import { BankDao } from "../../dao/BankDao";
import { Bank } from "../../domain/bank";
import { BankId } from "../../domain/types";

export class UpdateBankUseCase {
  constructor(private readonly bankDao: BankDao) {}

  execute(input: { id: BankId, name: string; description?: string }): Bank {
    const existingBank = this.bankDao.getById(input.id);
    if (!existingBank) {
      throw new Error(`Bank with id ${input.id} not found`);
    }

    const bank: Bank = {
      ...existingBank,
      name: input.name,
      description: input.description,
    };
    
    this.bankDao.update(bank);
    return bank;
  }
}
