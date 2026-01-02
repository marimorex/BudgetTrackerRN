import { db } from "../../db/database";
import { Bank } from "../../domain/bank";
import { BankId } from "../../domain/types";
import { BankDao } from "../BankDao";

function mapRow(row: any): Bank {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    createdAt: row.created_at,
  };
}

export class SQLiteBankDao implements BankDao {
  create(bank: Bank): void {
    const stmt = db.prepareSync(
      `INSERT INTO bank (id, name, description, created_at)
       VALUES (?, ?, ?, ?)`
    );
    try {
      stmt.executeSync([
        bank.id,
        bank.name,
        bank.description ?? null,
        bank.createdAt,
      ]);
    } finally {
      stmt.finalizeSync();
    }
  }

  getById(id: BankId): Bank | null {
    const stmt = db.prepareSync(`SELECT * FROM bank WHERE id = ?`);
    try {
      const result = stmt.executeSync([id]);
      const row = result.getFirstSync();
      return row ? mapRow(row) : null;
    } finally {
      stmt.finalizeSync();
    }
  }

  list(): Bank[] {
    const stmt = db.prepareSync(`SELECT * FROM bank ORDER BY name ASC`);
    try {
      const result = stmt.executeSync();
      return result.getAllSync().map(mapRow);
    } finally {
      stmt.finalizeSync();
    }
  }

  update(bank: Bank): void {
    const stmt = db.prepareSync(
      `UPDATE bank
       SET name = ?, description = ?
       WHERE id = ?`
    );
    try {
      stmt.executeSync([
        bank.name,
        bank.description ?? null,
        bank.id,
      ]);
    } finally {
      stmt.finalizeSync();
    }
  }

  delete(id: BankId): void {
    const stmt = db.prepareSync(`DELETE FROM bank WHERE id = ?`);
    try {
      stmt.executeSync([id]);
    } finally {
      stmt.finalizeSync();
    }
  }
}
