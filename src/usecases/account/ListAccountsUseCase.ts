import { AccountDao } from "../../dao/AccountDao";
import { Account, BankId, CurrencyType } from "../../domain";

export class ListAccountsUseCase {
  constructor(private readonly accountDao: AccountDao) {}

  execute(filter?: { bankId?: BankId | null, currency?: CurrencyType }): Account[] {
    return this.accountDao.list(filter);
  }
}