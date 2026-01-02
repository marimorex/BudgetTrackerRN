import { SQLiteAccountDao } from "../dao/sqlite/SQLiteAccountDao";
import { SQLiteCategoryDao } from "../dao/sqlite/SQLiteCategoryDao";
import { Account, Category } from "../domain";
import { db } from "./database";

function uuid(): string {
  // Good enough for POC; later you can use expo-crypto or uuid lib
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function seedIfEmpty(): void {
  const accountDao = new SQLiteAccountDao();
  const categoryDao = new SQLiteCategoryDao();

  // If there is at least 1 account, assume seeded
  const countRow = db.prepareSync(`SELECT COUNT(*) as c FROM account`).executeSync().getFirstSync() as any;
  const count = Number(countRow?.c ?? 0);
  if (count > 0) return;

  // Seed account
  const now = new Date().toISOString();
  const cashEur: Account = {
    id: uuid(),
    name: "Cash",
    type: "CASH",
    bankId: null,
    currency: "EUR",
    balanceCents: 0,
    createdAt: now,
  };
  accountDao.create(cashEur);

  // Seed categories
  const categories: Category[] = [
    { id: uuid(), name: "Salary", type: "INCOME", description: null },
    { id: uuid(), name: "Groceries", type: "EXPENSE", description: null },
    { id: uuid(), name: "Debt Payment", type: "EXPENSE", description: "Paying credit card / loans" },
  ];

  for (const c of categories) categoryDao.create(c);
}