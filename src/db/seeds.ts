import { SQLiteAccountDao } from "../dao/sqlite/SQLiteAccountDao";
import { SQLiteBankDao } from "../dao/sqlite/SQLiteBankDao";
import { SQLiteCategoryDao } from "../dao/sqlite/SQLiteCategoryDao";
import { Account, Bank, Category } from "../domain";
import { db } from "./database";

function uuid(): string {
  // Good enough for POC; later you can use expo-crypto or uuid lib
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function seedIfEmpty(): void {
  const accountDao = new SQLiteAccountDao();
  const categoryDao = new SQLiteCategoryDao();
  const bankDao = new SQLiteBankDao();

  // If there is at least 1 account, assume seeded
  const countRow = db.prepareSync(`SELECT COUNT(*) as c FROM account`).executeSync().getFirstSync() as any;
  const count = Number(countRow?.c ?? 0);
  if (count > 0) return;

  const now = new Date().toISOString();

  // Seed bank
  const bank: Bank = {
    id: uuid(),
    name: "My Bank",
    description: "Main bank",
    createdAt: now,
  }
  bankDao.create(bank);

  // Seed accounts
  const accounts: Account[] = [
    {
      id: uuid(),
      name: "Cash",
      type: "CASH",
      bankId: null,
      currency: "EUR",
      balanceCents: 10000, // 100 EUR
      createdAt: now,
    },
    {
      id: uuid(),
      name: "Checking Account",
      type: "CURRENT",
      bankId: bank.id,
      currency: "EUR",
      balanceCents: 125000, // 1250 EUR
      createdAt: now,
    },
    {
        id: uuid(),
        name: "Credit Card",
        type: "CREDIT_CARD",
        bankId: bank.id,
        currency: "EUR",
        balanceCents: -5000, // -50 EUR
        createdAt: now,
    }
  ];
  for (const acc of accounts) accountDao.create(acc);


  // Seed categories
  const categories: Category[] = [
    { id: uuid(), name: "Salary", type: "INCOME", description: null },
    { id: uuid(), name: "Groceries", type: "EXPENSE", description: null },
    { id: uuid(), name: "Debt Payment", type: "EXPENSE", description: "Paying credit card / loans" },
  ];

  for (const c of categories) categoryDao.create(c);
}