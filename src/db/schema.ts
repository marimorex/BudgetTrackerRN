export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS bank (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,              -- CASH | BANK | CREDIT_CARD | SAVINGS
  bank_id TEXT,                    -- nullable
  currency TEXT NOT NULL,          -- EUR | USD
  balance_cents INTEGER NOT NULL,  -- can be negative or 0
  created_at TEXT NOT NULL,
  FOREIGN KEY (bank_id) REFERENCES bank(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS category (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,              -- INCOME | EXPENSE
  description TEXT,
  UNIQUE(name, type)
);

CREATE TABLE IF NOT EXISTS "transaction" (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  category_id TEXT,
  amount_cents INTEGER NOT NULL,
  date TEXT NOT NULL,
  description TEXT,
  transfer_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL
  -- transfer_id will reference transfer(id) later (phase 2)
);


CREATE TABLE IF NOT EXISTS transfer (
  id TEXT PRIMARY KEY,
  source_account_id TEXT NOT NULL,
  target_account_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  date TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (source_account_id) REFERENCES account(id) ON DELETE CASCADE,
  FOREIGN KEY (target_account_id) REFERENCES account(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tx_account_date ON "transaction"(account_id, date);
CREATE INDEX IF NOT EXISTS idx_tx_category_date ON "transaction"(category_id, date);
`;
