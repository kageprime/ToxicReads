import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./connection.js";
import { wishlist, books } from "../../db/schema.js";
import type { InsertWishlistItem } from "../../db/schema.js";

export async function findWishlistByUser(userId: number) {
  return getDb()
    .select()
    .from(wishlist)
    .where(eq(wishlist.userId, userId))
    .orderBy(desc(wishlist.createdAt));
}

export async function findWishlistWithBooks(userId: number) {
  const items = await getDb()
    .select()
    .from(wishlist)
    .where(eq(wishlist.userId, userId))
    .orderBy(desc(wishlist.createdAt));

  return Promise.all(
    items.map(async item => {
      const bookRows = await getDb()
        .select()
        .from(books)
        .where(eq(books.id, item.bookId))
        .limit(1);
      return { ...item, book: bookRows.at(0) ?? null };
    })
  );
}

export async function isInWishlist(userId: number, bookId: number) {
  const rows = await getDb()
    .select()
    .from(wishlist)
    .where(
      and(eq(wishlist.userId, userId), eq(wishlist.bookId, bookId))
    )
    .limit(1);
  return rows.length > 0;
}

export async function addToWishlist(data: InsertWishlistItem) {
  const existing = await isInWishlist(data.userId, data.bookId);
  if (existing) return { success: true };
  await getDb().insert(wishlist).values(data);
  return { success: true };
}

export async function removeFromWishlist(userId: number, bookId: number) {
  await getDb()
    .delete(wishlist)
    .where(
      and(eq(wishlist.userId, userId), eq(wishlist.bookId, bookId))
    );
  return { success: true };
}
