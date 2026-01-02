import { AccountDao } from "../../dao/AccountDao";
import { TransactionDao } from "../../dao/TransactionDao";
import { db } from "../../db/database";
import {
  AccountId,
  assertValidTransactionAmount,
  CategoryId,
  Cents,
  Transaction,
  TransactionId,
} from "../../domain";

export type UpdateTransactionInput = {
  id: TransactionId;
  accountId: AccountId;
  categoryId: CategoryId;
  amountCents: Cents;
  date?: string;
  description?: string | null;
};

export class UpdateTransactionUseCase {
  constructor(
    private readonly accountDao: AccountDao,
    private readonly transactionDao: TransactionDao
  ) {}

  execute(input: UpdateTransactionInput): Transaction {
    assertValidTransactionAmount(input.amountCents);

    const oldTx = this.transactionDao.getById(input.id);
    if (!oldTx) throw new Error("Transaction not found");

    const oldAccount = this.accountDao.getById(oldTx.accountId);
    if (!oldAccount) throw new Error("Old account not found");
    
    const newAccount = this.accountDao.getById(input.accountId);
    if (!newAccount) throw new Error("New account not found");

    const updatedTx: Transaction = {
      ...oldTx,
      accountId: input.accountId,
      categoryId: input.categoryId,
      amountCents: input.amountCents,
      date: input.date ?? oldTx.date,
      description: input.description ?? oldTx.description,
    };

    db.execSync("BEGIN");
    try {
      // 1. Update the transaction itself
      this.transactionDao.update(updatedTx);

      // 2. Adjust balances
      if (oldTx.accountId === input.accountId) {
        // Account is the same, just adjust balance with the difference
        const diff = input.amountCents - oldTx.amountCents;
        this.accountDao.update({
          ...newAccount,
          balanceCents: newAccount.balanceCents + diff,
        });
      } else {
        // Account has changed, revert old amount from old account, add new amount to new account
        this.accountDao.update({
          ...oldAccount,
          balanceCents: oldAccount.balanceCents - oldTx.amountCents,
        });
        this.accountDao.update({
          ...newAccount,
          balanceCents: newAccount.balanceCents + input.amountCents,
        });
      }

      db.execSync("COMMIT");
      return updatedTx;
    } catch (e) {
      db.execSync("ROLLBACK");
      throw e;
    }
  }
}
