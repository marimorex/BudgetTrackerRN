import { Account, AccountId, BankId } from "../domain";

export interface AccountDao {
  create(account: Account): void;
  getById(id: AccountId): Account | null;
  list(filter?: { bankId?: BankId | null }): Account[];
  update(account: Account): void;
  delete(id: AccountId): void;
}