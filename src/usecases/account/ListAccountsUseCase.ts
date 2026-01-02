import { AccountDao } from "../../dao/AccountDao";
import { Account } from "../../domain";

export class ListAccountsUseCase {
  constructor(private readonly accountDao: AccountDao) {}

  execute(): Account[] {
    return this.accountDao.list();
  }
}