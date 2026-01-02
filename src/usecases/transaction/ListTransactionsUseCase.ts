import { TransactionDao } from "../../dao/TransactionDao";
import { Transaction } from "../../domain";
import { AccountId } from "../../domain/types";

export class ListTransactionsUseCase {
  constructor(private readonly txDao: TransactionDao) {}

  execute(filter?: { accountId?: AccountId }): Transaction[] {
    return this.txDao.list({
      accountId: filter?.accountId,
      limit: 200,
      offset: 0,
    });
  }
}