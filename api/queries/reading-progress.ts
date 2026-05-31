import { eq, and, sql } from "drizzle-orm";
import { getDb } from "./connection.js";
import { readingProgress } from "../../db/schema.js";

export async function upsertProgress(
  userId: number,
  bookId: number,
  chunk: number,
  scrollPercent: number,
) {
  const db = getDb();
  const existing = await db
    .select()
    .from(readingProgress)
    .where(and(
      eq(readingProgress.userId, userId),
      eq(readingProgress.bookId, bookId),
    ))
    .limit(1);

  if (existing.length > 0) {
    return db
      .update(readingProgress)
      .set({ chunk, scrollPercent, updatedAt: new Date() })
      .where(eq(readingProgress.id, existing[0].id));
  }

  return db.insert(readingProgress).values({
    userId,
    bookId,
    chunk,
    scrollPercent,
  });
}

export async function getProgress(userId: number, bookId: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(readingProgress)
    .where(and(
      eq(readingProgress.userId, userId),
      eq(readingProgress.bookId, bookId),
    ))
    .limit(1);
  return rows[0] || null;
}
