import { Bank } from "../domain";
import { BankId } from "../domain/types";

export interface BankDao {
  create(bank: Bank): void;
  getById(id: BankId): Bank | null;
  list(): Bank[];
  update(bank: Bank): void;
  delete(id: BankId): void;
}
