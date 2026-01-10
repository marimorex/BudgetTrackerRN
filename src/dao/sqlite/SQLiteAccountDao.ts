import { db } from "../../db/database";
import { Account } from "../../domain/account";
import { AccountId, BankId, CurrencyType } from "../../domain/types";
import { AccountDao } from "../AccountDao";

function mapRow(row: any): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    bankId: row.bank_id ?? null,
    currency: row.currency as CurrencyType,
    balanceCents: row.balance_cents,
    createdAt: row.created_at,
  };
}

export class SQLiteAccountDao implements AccountDao {
  create(account: Account): void {
    const stmt = db.prepareSync(
      `INSERT INTO account (id, name, type, bank_id, currency, balance_cents, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    try {
      stmt.executeSync([
        account.id,
        account.name,
        account.type,
        account.bankId ?? null,
        account.currency,
        account.balanceCents,
        account.createdAt,
      ]);
    } finally {
      stmt.finalizeSync();
    }
  }

  getById(id: AccountId): Account | null {
    const stmt = db.prepareSync(`SELECT * FROM account WHERE id = ?`);
    try {
      const result = stmt.executeSync([id]);
      const row = result.getFirstSync();
      return row ? mapRow(row) : null;
    } finally {
      stmt.finalizeSync();
    }
  }

  list(filter?: { bankId?: BankId | null, currency?: CurrencyType }): Account[] {
    const where: string[] = [];
    const args: any[] = [];

    if (filter?.bankId) {
      where.push(`bank_id = ?`);
      args.push(filter.bankId);
    } else if (filter?.bankId === null) {
      where.push(`bank_id IS NULL`);
    }

    if (filter?.currency) {
      where.push(`currency = ?`);
      args.push(filter.currency);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    
    const stmt = db.prepareSync(`SELECT * FROM account ${whereSql} ORDER BY created_at DESC`);
    try {
      const result = stmt.executeSync(args);
      return result.getAllSync().map(mapRow);
    } finally {
      stmt.finalizeSync();
    }
  }

  update(account: Account): void {
    const stmt = db.prepareSync(
      `UPDATE account
       SET name = ?, type = ?, bank_id = ?, currency = ?, balance_cents = ?
       WHERE id = ?`
    );
    try {
      stmt.executeSync([
        account.name,
        account.type,
        account.bankId ?? null,
        account.currency,
        account.balanceCents,
        account.id,
      ]);
    } finally {
      stmt.finalizeSync();
    }
  }

  delete(id: AccountId): void {
    const stmt = db.prepareSync(`DELETE FROM account WHERE id = ?`);
    try {
      stmt.executeSync([id]);
    } finally {
      stmt.finalizeSync();
    }
  }
}