import { eq, and } from "drizzle-orm";
import { getDb } from "./connection.js";
import { listeningProgress } from "../../db/schema.js";

export async function upsertListeningProgress(
  userId: number,
  bookId: number,
  paragraph: number
) {
  const db = getDb();
  const existing = await db
    .select()
    .from(listeningProgress)
    .where(
      and(
        eq(listeningProgress.userId, userId),
        eq(listeningProgress.bookId, bookId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return db
      .update(listeningProgress)
      .set({ paragraph, updatedAt: new Date() })
      .where(eq(listeningProgress.id, existing[0].id));
  }

  return db.insert(listeningProgress).values({
    userId,
    bookId,
    paragraph,
  });
}

export async function getListeningProgress(userId: number, bookId: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(listeningProgress)
    .where(
      and(
        eq(listeningProgress.userId, userId),
        eq(listeningProgress.bookId, bookId)
      )
    )
    .limit(1);
  return rows[0] || null;
}
