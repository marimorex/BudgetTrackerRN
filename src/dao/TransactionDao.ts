import { Transaction, TransactionId } from "../domain";
import { AccountId, CategoryId } from "../domain/types";

export interface TransactionDao {
  create(tx: Transaction): void;
  getById(id: TransactionId): Transaction | null;

  list(filter?: {
    accountId?: AccountId;
    categoryId?: CategoryId;
    fromDate?: string; // ISO
    toDate?: string;   // ISO
    limit?: number;
    offset?: number;
  }): Transaction[];

  delete(id: TransactionId): void;

  sumByAccount(accountId: AccountId, filter?: { fromDate?: string; toDate?: string }): number;
}