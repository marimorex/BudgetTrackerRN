import { BankId } from "./types";

export interface Bank {
  id: BankId;
  name: string;
  description?: string | null;
  createdAt: string; // ISO
}