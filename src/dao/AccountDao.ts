import { Account, AccountId } from "../domain";

export interface AccountDao {
  create(account: Account): void;
  getById(id: AccountId): Account | null;
  list(): Account[];
  update(account: Account): void;
  delete(id: AccountId): void;
}