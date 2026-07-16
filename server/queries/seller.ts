import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "./connection.js";
import { books, purchases, localUsers } from "../../db/schema.js";

export async function getSellerStats(sellerId: number) {
  const db = getDb();

  const approvedBooks = await db
    .select()
    .from(books)
    .where(
      and(
        eq(books.sellerId, sellerId),
        eq(books.sellerType, "user"),
        eq(books.status, "approved")
      )
    );

  const totalBooks = approvedBooks.length;
  const totalViews = approvedBooks.reduce(
    (sum, b) => sum + (b.views || 0),
    0
  );

  const salesRows = await db
    .select({
      total: sql<number>`count(*)`,
      revenue: sql<string>`coalesce(sum(${purchases.purchasePrice}), '0')`,
    })
    .from(purchases)
    .innerJoin(books, eq(purchases.bookId, books.id))
    .where(
      and(
        eq(books.sellerId, sellerId),
        eq(books.sellerType, "user")
      )
    );

  const { total: totalSales, revenue } = salesRows[0] ?? {
    total: 0,
    revenue: "0",
  };

  return {
    totalBooks,
    totalViews,
    totalSales:
      typeof totalSales === "number" ? totalSales : Number(totalSales || 0),
    totalRevenue: revenue,
  };
}

export async function getSellerBooks(sellerId: number) {
  return getDb()
    .select()
    .from(books)
    .where(
      and(
        eq(books.sellerId, sellerId),
        eq(books.sellerType, "user")
      )
    )
    .orderBy(desc(books.createdAt));
}

export async function getSellerSales(sellerId: number) {
  const db = getDb();
  const sales = await db
    .select()
    .from(purchases)
    .innerJoin(books, eq(purchases.bookId, books.id))
    .where(
      and(
        eq(books.sellerId, sellerId),
        eq(books.sellerType, "user")
      )
    )
    .orderBy(desc(purchases.createdAt));

  return Promise.all(
    sales.map(async s => {
      const buyerRows = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.id, s.purchases.buyerId))
        .limit(1);
      return {
        ...s.purchases,
        book: s.books,
        buyer: buyerRows.at(0) ?? null,
      };
    })
  );
}
