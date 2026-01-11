import { SQLiteAccountDao, SQLiteBankDao, SQLiteCategoryDao, SQLiteTransactionDao } from "../dao";
import { CreateAccountUseCase, DeleteAccountUseCase, ListAccountsUseCase, UpdateAccountUseCase } from "./account";
import { CreateBankUseCase, DeleteBankUseCase, ListBanksUseCase, UpdateBankUseCase } from "./bank";
import { CreateCategoryUseCase, DeleteCategoryUseCase, ListCategoriesUseCase, UpdateCategoryUseCase } from "./category";
import { GetCapitalAtDateUseCase } from "./reports/GetCapitalAtDateUseCase";
import { GetMonthlySummaryUseCase } from "./reports/GetMonthlySummaryUseCase";
import { CreateTransactionUseCase, DeleteTransactionUseCase, ListTransactionsUseCase, UpdateTransactionUseCase } from "./transaction";

export function makeUseCases() {
  const accountDao = new SQLiteAccountDao();
  const categoryDao = new SQLiteCategoryDao();
  const transactionDao = new SQLiteTransactionDao();
  const bankDao = new SQLiteBankDao();

  return {
    accountDao,
    transactionDao,
    createTransaction: new CreateTransactionUseCase(accountDao, categoryDao, transactionDao),
    updateTransaction: new UpdateTransactionUseCase(accountDao, transactionDao),
    deleteTransaction: new DeleteTransactionUseCase(accountDao, transactionDao),
    listAccounts: new ListAccountsUseCase(accountDao),
    createAccount: new CreateAccountUseCase(accountDao),
    updateAccount: new UpdateAccountUseCase(accountDao),
    deleteAccount: new DeleteAccountUseCase(accountDao),
    listCategories: new ListCategoriesUseCase(categoryDao),
    listTransactions: new ListTransactionsUseCase(transactionDao),
    createBank: new CreateBankUseCase(bankDao),
    listBanks: new ListBanksUseCase(bankDao),
    updateBank: new UpdateBankUseCase(bankDao),
    deleteBank: new DeleteBankUseCase(bankDao),
    createCategory: new CreateCategoryUseCase(categoryDao),
    updateCategory: new UpdateCategoryUseCase(categoryDao),
    deleteCategory: new DeleteCategoryUseCase(categoryDao),
    getMonthlySummary: new GetMonthlySummaryUseCase(transactionDao),
    getCapitalAtDate: new GetCapitalAtDateUseCase(accountDao, transactionDao),
  };
}