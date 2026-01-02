import { AccountDao } from "../../dao/AccountDao";
import { Account, AccountType, CurrencyType } from "../../domain";
import { BankId } from "../../domain/types";
import { uuid } from "../uuid";

export class CreateAccountUseCase {
  constructor(private readonly accountDao: AccountDao) {}

  execute(input: {
    name: string;
    type: AccountType;
    currency: CurrencyType;
    balanceCents: number;
    bankId?: BankId | null;
  }): Account {
    const now = new Date().toISOString();
    const account: Account = {
      id: uuid(),
      name: input.name,
      type: input.type,
      currency: input.currency,
      balanceCents: input.balanceCents,
      bankId: input.bankId ?? null,
      createdAt: now,
    };
    this.accountDao.create(account);
    return account;
  }
}
