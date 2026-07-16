import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "./connection.js";
import { reviews } from "../../db/schema.js";
import type { InsertReview } from "../../db/schema.js";

export async function findReviewsByBook(bookId: number) {
  return getDb()
    .select()
    .from(reviews)
    .where(eq(reviews.bookId, bookId))
    .orderBy(desc(reviews.createdAt));
}

export async function findReviewByUserAndBook(
  userId: number,
  bookId: number
) {
  const rows = await getDb()
    .select()
    .from(reviews)
    .where(
      and(eq(reviews.userId, userId), eq(reviews.bookId, bookId))
    )
    .limit(1);
  return rows.at(0) ?? null;
}

export async function createReview(data: InsertReview) {
  const result = await getDb().insert(reviews).values(data).returning();
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to create review");
  const row = await getDb()
    .select()
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);
  return row.at(0) ?? null;
}

export async function deleteReview(id: number) {
  await getDb().delete(reviews).where(eq(reviews.id, id));
}

export async function getBookRatingAverage(bookId: number) {
  const result = await getDb()
    .select({
      avg: sql<number>`round(avg(${reviews.rating}), 1)`,
      count: sql<number>`count(*)`,
    })
    .from(reviews)
    .where(eq(reviews.bookId, bookId));
  return result[0] ?? { avg: 0, count: 0 };
}

export async function findReviewById(id: number) {
  const rows = await getDb()
    .select()
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);
  return rows.at(0) ?? null;
}

export async function findReviewsByUser(userId: number) {
  return getDb()
    .select()
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.createdAt));
}
