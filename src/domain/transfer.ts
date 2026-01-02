import { AccountId, Cents, TransferId } from "./types";

export interface Transfer {
  id: TransferId;
  sourceAccountId: AccountId;
  targetAccountId: AccountId;
  amountCents: Cents; // positive integer
  date: string; // ISO
  description?: string | null;
  createdAt: string; // ISO
}