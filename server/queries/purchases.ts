import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./connection.js";
import { purchases, books } from "../../db/schema.js";
import type { InsertPurchase } from "../../db/schema.js";
import { findBookById } from "./books.js";
import { createNotification } from "./notifications.js";

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

export async function findPurchaseByBuyerAndBook(
  buyerId: number,
  bookId: number
) {
  const rows = await getDb()
    .select()
    .from(purchases)
    .where(and(eq(purchases.buyerId, buyerId), eq(purchases.bookId, bookId)))
    .limit(1);
  return rows.at(0) ?? null;
}

export async function countPurchasesForBooks(bookIds: number[]) {
  if (bookIds.length === 0) return 0;
  const { inArray, count } = await import("drizzle-orm");
  const rows = await getDb()
    .select({ value: count() })
    .from(purchases)
    .where(inArray(purchases.bookId, bookIds));
  return rows.at(0)?.value ?? 0;
}

/**
 * Idempotent fulfillment for a verified-paid order. Shared by the
 * redirect-verify flow and the Paystack webhook.
 */
export async function fulfillPaidOrder(buyerId: number, bookId: number) {
  const existing = await findPurchaseByBuyerAndBook(buyerId, bookId);
  if (existing) return { purchase: existing, alreadyOwned: true as const };
  const book = await findBookById(bookId);
  if (!book) throw new Error("Book not found");
  const purchase = await createPurchase({
    buyerId,
    bookId,
    purchasePrice: book.price,
  });
  if (book.sellerId && book.sellerType === "user") {
    await createNotification({
      userId: book.sellerId,
      type: "book_purchased",
      message: `Someone purchased your book "${book.title}"`,
      link: `/book/${book.slug ?? book.id}`,
    });
  }
  return { purchase, alreadyOwned: false as const };
}

export async function createPurchase(data: InsertPurchase) {
  const result = await getDb().insert(purchases).values(data).returning();
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
    userPurchases.map(async purchase => {
      const bookRows = await db
        .select()
        .from(books)
        .where(eq(books.id, purchase.bookId))
        .limit(1);
      return {
        ...purchase,
        book: bookRows.at(0) ?? null,
      };
    })
  );

  return purchasesWithBooks;
}
