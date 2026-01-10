// IDs (UUID strings)
export type BankId = string;
export type AccountId = string;
export type CategoryId = string;
export type TransactionId = string;
export type TransferId = string;

// Enums (stored as TEXT in SQLite)
export type AccountType = "CASH" | "TDC" | "SAVINGS" | "CREDIT" | "DEBIT" | "INVESTMENTS";
export type CategoryType = "INCOME" | "EXPENSE";
export type CurrencyType = "EUR" | "USD";


// Money representation in DB: integer cents (signed for transactions)
export type Cents = number;