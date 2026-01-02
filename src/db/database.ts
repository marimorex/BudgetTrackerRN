import * as SQLite from "expo-sqlite";
import { CREATE_TABLES_SQL, SCHEMA_VERSION } from "./schema";

export const db = SQLite.openDatabaseSync("budgettracker.db");

export function initDb(): void {
    // create tables
  db.execSync(CREATE_TABLES_SQL);

  // store schema version (simple POC migration strategy)
  const row = db.getFirstSync<{ user_version: number }>("PRAGMA user_version") as any;
  const current = Number(row?.user_version ?? 0);

  if (current < SCHEMA_VERSION) {
    db.execSync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  }
}