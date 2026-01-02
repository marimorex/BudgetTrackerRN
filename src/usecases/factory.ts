import { SQLiteAccountDao, SQLiteBankDao, SQLiteCategoryDao, SQLiteTransactionDao } from "../dao";
import { CreateAccountUseCase, DeleteAccountUseCase, ListAccountsUseCase, UpdateAccountUseCase } from "./account";
import { CreateBankUseCase, DeleteBankUseCase, ListBanksUseCase, UpdateBankUseCase } from "./bank";
import { CreateCategoryUseCase, DeleteCategoryUseCase, ListCategoriesUseCase, UpdateCategoryUseCase } from "./category";
import { CreateTransactionUseCase, DeleteTransactionUseCase, ListTransactionsUseCase, UpdateTransactionUseCase } from "./transaction";

export function makeUseCases() {
  const accountDao = new SQLiteAccountDao();
  const categoryDao = new SQLiteCategoryDao();
  const txDao = new SQLiteTransactionDao();
  const bankDao = new SQLiteBankDao();

  return {
    createTransaction: new CreateTransactionUseCase(accountDao, categoryDao, txDao),
    updateTransaction: new UpdateTransactionUseCase(accountDao, txDao),
    deleteTransaction: new DeleteTransactionUseCase(accountDao, txDao),
    listAccounts: new ListAccountsUseCase(accountDao),
    createAccount: new CreateAccountUseCase(accountDao),
    updateAccount: new UpdateAccountUseCase(accountDao),
    deleteAccount: new DeleteAccountUseCase(accountDao),
    listCategories: new ListCategoriesUseCase(categoryDao),
    listTransactions: new ListTransactionsUseCase(txDao),
    createBank: new CreateBankUseCase(bankDao),
    listBanks: new ListBanksUseCase(bankDao),
    updateBank: new UpdateBankUseCase(bankDao),
    deleteBank: new DeleteBankUseCase(bankDao),
    createCategory: new CreateCategoryUseCase(categoryDao),
    updateCategory: new UpdateCategoryUseCase(categoryDao),
    deleteCategory: new DeleteCategoryUseCase(categoryDao),
  };
}