import { db } from "../../db/database";
import { Transaction, assertValidTransactionAmount } from "../../domain/transaction";
import { AccountId, CategoryId, TransactionId } from "../../domain/types";
import { TransactionDao } from "../TransactionDao";

function mapRow(row: any): Transaction {
  return {
    id: row.id,
    accountId: row.account_id,
    categoryId: row.category_id ?? null,
    amountCents: row.amount_cents,
    date: row.date,
    description: row.description ?? null,
    transferId: row.transfer_id ?? null,
    createdAt: row.created_at,
  };
}

export class SQLiteTransactionDao implements TransactionDao {
  create(tx: Transaction): void {
    assertValidTransactionAmount(tx.amountCents);

    const stmt = db.prepareSync(
      `INSERT INTO "transaction"
       (id, account_id, category_id, amount_cents, date, description, transfer_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    try {
      stmt.executeSync([
        tx.id,
        tx.accountId,
        tx.categoryId ?? null,
        tx.amountCents,
        tx.date,
        tx.description ?? null,
        tx.transferId ?? null,
        tx.createdAt,
      ]);
    } finally {
      stmt.finalizeSync();
    }
  }

  getById(id: TransactionId): Transaction | null {
    const stmt = db.prepareSync(`SELECT * FROM "transaction" WHERE id = ?`);
    try {
      const result = stmt.executeSync([id]);
      const row = result.getFirstSync();
      return row ? mapRow(row) : null;
    } finally {
      stmt.finalizeSync();
    }
  }

  list(filter?: {
    accountId?: AccountId;
    categoryId?: CategoryId;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
  }): Transaction[] {
    const where: string[] = [];
    const args: any[] = [];

    if (filter?.accountId) { where.push(`account_id = ?`); args.push(filter.accountId); }
    if (filter?.categoryId) { where.push(`category_id = ?`); args.push(filter.categoryId); }
    if (filter?.fromDate) { where.push(`date >= ?`); args.push(filter.fromDate); }
    if (filter?.toDate) { where.push(`date <= ?`); args.push(filter.toDate); }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const limit = Number.isFinite(filter?.limit) ? filter!.limit! : 100;
    const offset = Number.isFinite(filter?.offset) ? filter!.offset! : 0;

    const sql = `
      SELECT * FROM "transaction"
      ${whereSql}
      ORDER BY date DESC, created_at DESC
      LIMIT ${Math.max(1, Math.min(500, limit))}
      OFFSET ${Math.max(0, offset)}
    `;

    const stmt = db.prepareSync(sql);
    try {
      const result = stmt.executeSync(args);
      return result.getAllSync().map(mapRow);
    } finally {
      stmt.finalizeSync();
    }
  }

  delete(id: TransactionId): void {
    const stmt = db.prepareSync(`DELETE FROM "transaction" WHERE id = ?`);
    try {
      stmt.executeSync([id]);
    } finally {
      stmt.finalizeSync();
    }
  }

  sumByAccount(accountId: AccountId, filter?: { fromDate?: string; toDate?: string }): number {
    type SumRow = { total: number | null };

    const where: string[] = [`account_id = ?`];
    const args: any[] = [accountId];

    if (filter?.fromDate) { where.push(`date >= ?`); args.push(filter.fromDate); }
    if (filter?.toDate) { where.push(`date <= ?`); args.push(filter.toDate); }

    const sql = `
      SELECT COALESCE(SUM(amount_cents), 0) as total
      FROM "transaction"
      WHERE ${where.join(" AND ")}
    `;

    const stmt = db.prepareSync(sql);
    try {
      const result = stmt.executeSync(args);

      const row = result.getFirstSync() as SumRow | undefined;

      return Number(row?.total ?? 0);
    } finally {
      stmt.finalizeSync();
    }
  }
}