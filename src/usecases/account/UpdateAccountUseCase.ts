import { AccountDao } from "../../dao/AccountDao";
import { Account, AccountType, CurrencyType } from "../../domain";
import { AccountId, BankId } from "../../domain/types";

export class UpdateAccountUseCase {
  constructor(private readonly accountDao: AccountDao) {}

  execute(input: {
    id: AccountId,
    name: string;
    type: AccountType;
    currency: CurrencyType;
    balanceCents: number;
    bankId?: BankId | null;
  }): Account {
    const existingAccount = this.accountDao.getById(input.id);
    if (!existingAccount) {
      throw new Error(`Account with id ${input.id} not found`);
    }

    const account: Account = {
      ...existingAccount,
      name: input.name,
      type: input.type,
      currency: input.currency,
      balanceCents: input.balanceCents,
      bankId: input.bankId ?? null,
    };
    
    this.accountDao.update(account);
    return account;
  }
}
