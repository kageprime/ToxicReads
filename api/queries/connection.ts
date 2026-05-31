import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;
let sqlite: Database.Database;

export function getDb() {
  if (!instance) {
    sqlite = new Database(env.databaseUrl);
    instance = drizzle(sqlite, { schema: fullSchema });
    migrate();
  }
  return instance;
}

export function getSqlite() {
  if (!sqlite) {
    sqlite = new Database(env.databaseUrl);
    migrate();
  }
  return sqlite;
}

function migrate() {
  try {
    sqlite.exec(`ALTER TABLE books ADD COLUMN views INTEGER NOT NULL DEFAULT 0;`);
  } catch {
    // column already exists
  }
}