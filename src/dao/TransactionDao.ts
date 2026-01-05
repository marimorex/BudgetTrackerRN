import { Transaction, TransactionId } from "../domain";
import { AccountId, CategoryId } from "../domain/types";

export interface TransactionDao {
  create(tx: Transaction): void;
  getById(id: TransactionId): Transaction | null;

  list(filter?: {
    accountId?: AccountId;
    categoryId?: CategoryId;
    fromDate?: string; // ISO
    toExclusiveDate?: string;   // ISO
    limit?: number;
    offset?: number;
  }): Transaction[];

  sum(filter?: {
    accountId?: AccountId;
    categoryId?: CategoryId;
    fromDate?: string; // ISO
    toExclusiveDate?: string;   // ISO
  }): number;

  update(tx: Transaction): void;
  delete(id: TransactionId): void;

  sumByAccount(accountId: AccountId, filter?: { fromDate?: string; toDate?: string }): number;
}