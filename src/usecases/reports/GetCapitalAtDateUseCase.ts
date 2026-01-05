import { AccountDao } from "../../dao/AccountDao";
import { TransactionDao } from "../../dao/TransactionDao";

export class GetCapitalAtDateUseCase {
  constructor(
    private readonly accountDao: AccountDao,
    private readonly transactionDao: TransactionDao
  ) {}

  execute(date: Date): number {
    // 1. Get current capital
    const accounts = this.accountDao.list();
    const currentCapital = accounts.reduce((sum, acc) => {
      if (acc.type === 'CREDIT_CARD' || acc.type === 'CREDIT') {
        return sum - acc.balanceCents;
      }
      return sum + acc.balanceCents;
    }, 0);

    // 2. Get sum of transactions from the given date until now
    const fromInclusiveDate = date.toISOString();
    const sumOfFutureTransactions = this.transactionDao.sum({ fromDate: fromInclusiveDate });

    // 3. Calculate capital at the given date
    const capitalAtDate = currentCapital - sumOfFutureTransactions;

    return capitalAtDate;
  }
}
