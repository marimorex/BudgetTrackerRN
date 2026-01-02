import { AccountDao } from "../../dao/AccountDao";
import { TransactionDao } from "../../dao/TransactionDao";
import { db } from "../../db/database";
import { TransactionId } from "../../domain";

export class DeleteTransactionUseCase {
  constructor(
    private readonly accountDao: AccountDao,
    private readonly transactionDao: TransactionDao
  ) {}

  execute(id: TransactionId): void {
    const tx = this.transactionDao.getById(id);
    if (!tx) return; // Or throw error? For now, idempotent

    const account = this.accountDao.getById(tx.accountId);
    if (!account) throw new Error("Account not found for transaction");

    db.execSync("BEGIN");
    try {
      // Revert balance change
      this.accountDao.update({
        ...account,
        balanceCents: account.balanceCents - tx.amountCents,
      });

      // Delete transaction
      this.transactionDao.delete(id);

      db.execSync("COMMIT");
    } catch (e) {
      db.execSync("ROLLBACK");
      throw e;
    }
  }
}
