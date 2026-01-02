import { BankDao } from "../../dao/BankDao";
import { BankId } from "../../domain/types";

export class DeleteBankUseCase {
  constructor(private readonly bankDao: BankDao) {}

  execute(id: BankId): void {
    this.bankDao.delete(id);
  }
}
