import { TransactionDao } from "../../dao/TransactionDao";
import { AccountId, CategoryId } from "../../domain";

export type MonthlySummary = {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
};

export class GetMonthlySummaryUseCase {
  constructor(private readonly transactionDao: TransactionDao) {}

  execute(input: {
    year: number;
    month: number; // 1-12
    accountId?: AccountId;
    categoryId?: CategoryId;
  }): MonthlySummary {
    const fromDate = new Date(input.year, input.month - 1, 1).toISOString();
    const toExclusiveDate = new Date(input.year, input.month, 1).toISOString();

    const filter = {
      fromDate,
      toExclusiveDate,
      accountId: input.accountId,
      categoryId: input.categoryId,
    };

    const transactions = this.transactionDao.list(filter);

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const tx of transactions) {
      if (tx.amountCents > 0) {
        totalIncome += tx.amountCents;
      } else {
        totalExpenses += tx.amountCents;
      }
    }

    const netSavings = totalIncome + totalExpenses;

    return { totalIncome, totalExpenses, netSavings };
  }
}
