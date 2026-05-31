import Database from "better-sqlite3";
import { join } from "path";

const dbPath = join(process.cwd(), "data", "bookhaven.db");

async function resetDb() {
  const db = new Database(dbPath);

  db.exec("DROP TABLE IF EXISTS localUsers");
  db.exec("DROP TABLE IF EXISTS books");
  db.exec("DROP TABLE IF EXISTS purchases");

  db.exec(`
    CREATE TABLE IF NOT EXISTS localUsers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'user' NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      description TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      price TEXT NOT NULL,
      coverImage TEXT NOT NULL,
      category TEXT NOT NULL,
      "condition" TEXT NOT NULL,
      sellerId INTEGER,
      sellerType TEXT DEFAULT 'user' NOT NULL,
      status TEXT DEFAULT 'pending' NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyerId INTEGER NOT NULL,
      bookId INTEGER NOT NULL,
      purchasePrice TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    )
  `);

  db.close();
  console.log("Database reset - all tables recreated");
}

resetDb().catch(console.error);