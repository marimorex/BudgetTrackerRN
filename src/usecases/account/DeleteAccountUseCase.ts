import { AccountDao } from "../../dao/AccountDao";
import { AccountId } from "../../domain/types";

export class DeleteAccountUseCase {
  constructor(private readonly accountDao: AccountDao) {}

  execute(id: AccountId): void {
    this.accountDao.delete(id);
  }
}
