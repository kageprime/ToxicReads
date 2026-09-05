import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ── Local Users (username/password auth) ──────────────────────

export const localUsers = sqliteTable("localUsers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  location: text("location"),
  role: text("role", { enum: ["user", "admin"] })
    .default("user")
    .notNull(),
  status: text("status", { enum: ["active", "banned"] })
    .default("active")
    .notNull(),
  tokenVersion: integer("tokenVersion").notNull().default(0),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
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
  slug: text("slug").unique(),
  authorSlug: text("authorSlug"),
  authorId: integer("authorId"),
  isFeatured: integer("isFeatured", { mode: "boolean" })
    .default(false)
    .notNull(),
  featuredOrder: integer("featuredOrder").default(0).notNull(),
  condition: text("condition").default("New").notNull(),
  sellerId: integer("sellerId"),
  sellerType: text("sellerType", { enum: ["admin", "user"] })
    .default("user")
    .notNull(),
  views: integer("views").default(0).notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .default("pending")
    .notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Book = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;

// ── Authors (public profiles + catalogues) ────────────────────

export const authors = sqliteTable("authors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  bio: text("bio").notNull().default(""),
  dedication: text("dedication").notNull().default(""),
  avatar: text("avatar").notNull().default(""),
  location: text("location").notNull().default(""),
  website: text("website").notNull().default(""),
  twitter: text("twitter").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  userId: integer("userId"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Author = typeof authors.$inferSelect;
export type InsertAuthor = typeof authors.$inferInsert;

// ── Purchases ─────────────────────────────────────────────────

export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  buyerId: integer("buyerId").notNull(),
  bookId: integer("bookId").notNull(),
  purchasePrice: text("purchasePrice").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

// ── Reading Progress (auto-resume) ────────────────────────────

export const readingProgress = sqliteTable(
  "readingProgress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId").notNull(),
    bookId: integer("bookId").notNull(),
    chunk: integer("chunk").notNull().default(0),
    scrollPercent: integer("scrollPercent").notNull().default(0),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  table => ({
    uniqueUserBook: uniqueIndex("uq_readingProgress_user_book").on(
      table.userId,
      table.bookId
    ),
  })
);

export type ReadingProgress = typeof readingProgress.$inferSelect;
export type InsertReadingProgress = typeof readingProgress.$inferInsert;

// ── Reviews ───────────────────────────────────────────────────

export const reviews = sqliteTable(
  "reviews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookId: integer("bookId").notNull(),
    userId: integer("userId").notNull(),
    rating: integer("rating").notNull(),
    text: text("text"),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  table => ({
    uniqueUserBook: uniqueIndex("uq_reviews_user_book").on(
      table.userId,
      table.bookId
    ),
  })
);

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ── Wishlist ──────────────────────────────────────────────────

export const wishlist = sqliteTable(
  "wishlist",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId").notNull(),
    bookId: integer("bookId").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  table => ({
    uniqueUserBook: uniqueIndex("uq_wishlist_user_book").on(
      table.userId,
      table.bookId
    ),
  })
);

export type WishlistItem = typeof wishlist.$inferSelect;
export type InsertWishlistItem = typeof wishlist.$inferInsert;

// ── Notifications ─────────────────────────────────────────────

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  type: text("type", {
    enum: [
      "book_approved",
      "book_rejected",
      "book_purchased",
      "new_review",
      "system",
    ],
  }).notNull(),
  message: text("message").notNull(),
  link: text("link"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
