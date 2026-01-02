import { AccountDao } from "../../dao/AccountDao";
import { CategoryDao } from "../../dao/CategoryDao";
import { TransactionDao } from "../../dao/TransactionDao";
import { db } from "../../db/database";
import {
  AccountId,
  assertValidTransactionAmount,
  CategoryId,
  CategoryType,
  Cents,
  Transaction,
} from "../../domain";
import { uuid } from "../uuid";

export type CreateTransactionInput = {
  accountId: AccountId;
  categoryId: CategoryId;
  amountCents: Cents;          // signed
  date?: string;               // ISO, defaults now
  description?: string | null;
};

export type CreateTransactionOutput = {
  transaction: Transaction;
  newBalanceCents: number;
};

export class CreateTransactionUseCase {
  constructor(
    private readonly accountDao: AccountDao,
    private readonly categoryDao: CategoryDao,
    private readonly transactionDao: TransactionDao
  ) {}

  execute(input: CreateTransactionInput): CreateTransactionOutput {
    // 1) Validate amount (domain rule)
    assertValidTransactionAmount(input.amountCents);

    // 2) Check account exists
    const account = this.accountDao.getById(input.accountId);
    if (!account) throw new Error("Account not found");

    // 3) Check category exists + sign/type match
    const category = this.categoryDao.getById(input.categoryId);
    if (!category) throw new Error("Category not found");

    const isIncome = input.amountCents > 0;
    const expectedType: CategoryType = isIncome ? "INCOME" : "EXPENSE";
    if (category.type !== expectedType) {
      throw new Error(
        `Category type mismatch. Amount is ${isIncome ? "income" : "expense"} but category is ${category.type}.`
      );
    }

    const nowIso = new Date().toISOString();
    const tx: Transaction = {
      id: uuid(),
      accountId: input.accountId,
      categoryId: input.categoryId,
      amountCents: input.amountCents,
      date: input.date ?? nowIso,
      description: input.description ?? null,
      transferId: null,
      createdAt: nowIso,
    };

    // 4) Atomic DB transaction: insert tx + update balance
    // expo-sqlite supports BEGIN/COMMIT/ROLLBACK via execSync
    db.execSync("BEGIN");
    try {
      this.transactionDao.create(tx);

      const newBalance = account.balanceCents + input.amountCents;
      this.accountDao.update({
        ...account,
        balanceCents: newBalance,
      });

      db.execSync("COMMIT");
      console.log('Inserting transaction:', tx)
      return { transaction: tx, newBalanceCents: newBalance };
    } catch (e) {
      db.execSync("ROLLBACK");
      throw e;
    }
  }
}