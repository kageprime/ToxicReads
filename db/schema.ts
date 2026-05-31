import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

// ── Local Users (username/password auth) ──────────────────────

export const localUsers = sqliteTable("localUsers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

// ── Books (marketplace listings) ──────────────────────────────

export const books = sqliteTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull().default(""),
  price: text("price").notNull(),
  coverImage: text("coverImage").notNull(),
  category: text("category").notNull(),
  condition: text("condition").notNull(),
  sellerId: integer("sellerId"),
  sellerType: text("sellerType", { enum: ["admin", "user"] }).default("user").notNull(),
  views: integer("views").default(0).notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Book = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;

// ── Purchases ─────────────────────────────────────────────────

export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  buyerId: integer("buyerId").notNull(),
  bookId: integer("bookId").notNull(),
  purchasePrice: text("purchasePrice").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;