import { BankDao } from "../../dao/BankDao";
import { Bank } from "../../domain/bank";
import { uuid } from "../uuid";

export class CreateBankUseCase {
  constructor(private readonly bankDao: BankDao) {}

  execute(input: { name: string; description?: string }): Bank {
    const now = new Date().toISOString();
    const bank: Bank = {
      id: uuid(),
      name: input.name,
      description: input.description,
      createdAt: now,
    };
    this.bankDao.create(bank);
    return bank;
  }
}
