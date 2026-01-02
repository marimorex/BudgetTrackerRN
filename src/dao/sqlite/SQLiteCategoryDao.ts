import { db } from "../../db/database";
import { Category } from "../../domain/category";
import { CategoryId, CategoryType } from "../../domain/types";
import { CategoryDao } from "../CategoryDao";

function mapRow(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type as CategoryType,
    description: row.description ?? null,
  };
}

export class SQLiteCategoryDao implements CategoryDao {
  create(category: Category): void {
    const stmt = db.prepareSync(
      `INSERT INTO category (id, name, type, description)
       VALUES (?, ?, ?, ?)`
    );
    try {
      stmt.executeSync([
        category.id,
        category.name,
        category.type,
        category.description ?? null,
      ]);
    } finally {
      stmt.finalizeSync();
    }
  }

  getById(id: CategoryId): Category | null {
    const stmt = db.prepareSync(`SELECT * FROM category WHERE id = ?`);
    try {
      const result = stmt.executeSync([id]);
      const row = result.getFirstSync();
      return row ? mapRow(row) : null;
    } finally {
      stmt.finalizeSync();
    }
  }

  list(filter?: { type?: CategoryType }): Category[] {
    const type = filter?.type;                 // <-- capture once

    const sql = type
      ? `SELECT * FROM category WHERE type = ? ORDER BY name ASC`
      : `SELECT * FROM category ORDER BY name ASC`;

    const stmt = db.prepareSync(sql);
    try {
      const result = type
        ? stmt.executeSync([type])
        : stmt.executeSync();

      return result.getAllSync().map(mapRow);
    } finally {
      stmt.finalizeSync();
    }
  }

  update(category: Category): void {
    const stmt = db.prepareSync(
      `UPDATE category
       SET name = ?, type = ?, description = ?
       WHERE id = ?`
    );
    try {
      stmt.executeSync([
        category.name,
        category.type,
        category.description ?? null,
        category.id,
      ]);
    } finally {
      stmt.finalizeSync();
    }
  }

  delete(id: CategoryId): void {
    const stmt = db.prepareSync(`DELETE FROM category WHERE id = ?`);
    try {
      stmt.executeSync([id]);
    } finally {
      stmt.finalizeSync();
    }
  }
}