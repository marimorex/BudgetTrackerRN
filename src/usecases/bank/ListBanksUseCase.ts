import { BankDao } from "../../dao/BankDao";
import { Bank } from "../../domain/bank";

export class ListBanksUseCase {
  constructor(private readonly bankDao: BankDao) {}

  execute(): Bank[] {
    return this.bankDao.list();
  }
}
