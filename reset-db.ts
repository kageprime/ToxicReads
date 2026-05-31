import "dotenv/config";
import { createClient } from "@libsql/client";

const dbUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || (() => { throw new Error("DATABASE_URL or TURSO_DATABASE_URL is required"); })();
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;

async function resetDb() {
  const client = createClient({ url: dbUrl, authToken });

  await client.execute("DROP TABLE IF EXISTS localUsers");
  await client.execute("DROP TABLE IF EXISTS books");
  await client.execute("DROP TABLE IF EXISTS purchases");

  await client.execute(`
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

  await client.execute(`
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

  await client.execute(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyerId INTEGER NOT NULL,
      bookId INTEGER NOT NULL,
      purchasePrice TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    )
  `);

  client.close();
  console.log("Database reset - all tables recreated");
}

resetDb().catch(console.error);