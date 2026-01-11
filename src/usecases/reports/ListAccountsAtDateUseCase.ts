import { Account, AccountDao, TransactionDao } from "../..";

export class ListAccountsAtDateUseCase {
  constructor(
    private readonly accountDao: AccountDao,
    private readonly transactionDao: TransactionDao
  ) {}

  execute(date: Date): Account[] {
    const accounts = this.accountDao.list();
    const fromInclusiveDate = date.toISOString();

    return accounts.map(account => {
      const sumOfFutureTransactions = this.transactionDao.sum({
        accountId: account.id,
        fromDate: fromInclusiveDate,
      });

      const balanceAtDate = account.balanceCents - sumOfFutureTransactions;
      return { ...account, balanceCents: balanceAtDate };
    });
  }
}
