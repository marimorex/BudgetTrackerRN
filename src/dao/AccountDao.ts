import { Account, AccountId, BankId, CurrencyType } from "../domain";

export interface AccountDao {
  create(account: Account): void;
  getById(id: AccountId): Account | null;
  list(filter?: { bankId?: BankId | null, currency?: CurrencyType }): Account[];
  update(account: Account): void;
  delete(id: AccountId): void;
}