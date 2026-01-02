import { SQLiteAccountDao, SQLiteBankDao, SQLiteCategoryDao, SQLiteTransactionDao } from "../dao";
import { ListAccountsUseCase } from "./account";
import { CreateBankUseCase, DeleteBankUseCase, ListBanksUseCase, UpdateBankUseCase } from "./bank";
import { ListCategoriesUseCase } from "./category";
import { CreateTransactionUseCase, ListTransactionsUseCase } from "./transaction";

export function makeUseCases() {
  const accountDao = new SQLiteAccountDao();
  const categoryDao = new SQLiteCategoryDao();
  const txDao = new SQLiteTransactionDao();
  const bankDao = new SQLiteBankDao();

  return {
    createTransaction: new CreateTransactionUseCase(accountDao, categoryDao, txDao),
    listAccounts: new ListAccountsUseCase(accountDao),
    listCategories: new ListCategoriesUseCase(categoryDao),
    listTransactions: new ListTransactionsUseCase(txDao),
    createBank: new CreateBankUseCase(bankDao),
    listBanks: new ListBanksUseCase(bankDao),
    updateBank: new UpdateBankUseCase(bankDao),
    deleteBank: new DeleteBankUseCase(bankDao),
  };
}