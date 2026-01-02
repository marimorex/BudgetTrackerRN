import { AccountDao } from "../../dao/AccountDao";
import { Account, BankId } from "../../domain";

export class ListAccountsUseCase {
  constructor(private readonly accountDao: AccountDao) {}

  execute(filter?: { bankId?: BankId | null }): Account[] {
    return this.accountDao.list(filter);
  }
}