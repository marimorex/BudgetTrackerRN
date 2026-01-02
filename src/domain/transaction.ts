import { AccountId, CategoryId, Cents, TransactionId, TransferId } from "./types";

export interface Transaction {
  id: TransactionId;
  accountId: AccountId;
  categoryId?: CategoryId | null; // null for transfers later
  amountCents: Cents; // signed, MUST NOT be 0
  date: string; // ISO
  description?: string | null;
  transferId?: TransferId | null; // phase 2
  createdAt: string; // ISO
}

// Domain rule: transaction amount cannot be zero
export function assertValidTransactionAmount(amountCents: Cents): void {
  if (!Number.isFinite(amountCents)) throw new Error("amountCents must be a number");
  if (!Number.isInteger(amountCents)) throw new Error("amountCents must be an integer (cents)");
  if (amountCents === 0) throw new Error("Transaction amount cannot be 0");
}