import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./connection.js";
import { purchases, books } from "../../db/schema.js";
import type { InsertPurchase } from "../../db/schema.js";

export async function findPurchasesByBuyer(buyerId: number) {
  return getDb()
    .select()
    .from(purchases)
    .where(eq(purchases.buyerId, buyerId))
    .orderBy(desc(purchases.createdAt));
}

export async function findPurchaseById(id: number) {
  const rows = await getDb()
    .select()
    .from(purchases)
    .where(eq(purchases.id, id))
    .limit(1);
  return rows.at(0) ?? null;
}

export async function hasUserPurchasedBook(buyerId: number, bookId: number) {
  const rows = await getDb()
    .select()
    .from(purchases)
    .where(and(eq(purchases.buyerId, buyerId), eq(purchases.bookId, bookId)))
    .limit(1);
  return rows.length > 0;
}

export async function createPurchase(data: InsertPurchase) {
  const result = await getDb()
    .insert(purchases)
    .values(data)
    .returning();
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to create purchase");
  return findPurchaseById(id);
}

export async function findPurchasesWithBookDetails(buyerId: number) {
  const db = getDb();
  const userPurchases = await db
    .select()
    .from(purchases)
    .where(eq(purchases.buyerId, buyerId))
    .orderBy(desc(purchases.createdAt));

  // Fetch book details for each purchase
  const purchasesWithBooks = await Promise.all(
    userPurchases.map(async (purchase) => {
      const bookRows = await db
        .select()
        .from(books)
        .where(eq(books.id, purchase.bookId))
        .limit(1);
      return {
        ...purchase,
        book: bookRows.at(0) ?? null,
      };
    }),
  );

  return purchasesWithBooks;
}
