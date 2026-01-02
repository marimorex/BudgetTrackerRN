import { AccountId, AccountType, BankId, Cents, CurrencyType } from "./types";

export interface Account {
  id: AccountId;
  name: string;
  type: AccountType;
  bankId?: BankId | null;
  currency: CurrencyType;
  balanceCents: Cents; // can be negative or zero
  createdAt: string; // ISO
}