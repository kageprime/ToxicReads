import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { books } from "@db/schema";
import type { InsertBook } from "@db/schema";

// ── Public: approved books only ───────────────────────────────

export async function findApprovedBooks() {
  return getDb()
    .select()
    .from(books)
    .where(eq(books.status, "approved"))
    .orderBy(desc(books.createdAt));
}

export async function findBookById(id: number) {
  const rows = await getDb()
    .select()
    .from(books)
    .where(eq(books.id, id))
    .limit(1);
  return rows.at(0) ?? null;
}

export async function findApprovedBookById(id: number) {
  const rows = await getDb()
    .select()
    .from(books)
    .where(and(eq(books.id, id), eq(books.status, "approved")))
    .limit(1);
  return rows.at(0) ?? null;
}

// ── Admin: all books with filters ─────────────────────────────

export async function findAllBooks() {
  return getDb()
    .select()
    .from(books)
    .orderBy(desc(books.createdAt));
}

export async function findPendingBooks() {
  return getDb()
    .select()
    .from(books)
    .where(eq(books.status, "pending"))
    .orderBy(desc(books.createdAt));
}

export async function findBooksBySeller(sellerId: number, sellerType: "admin" | "user") {
  return getDb()
    .select()
    .from(books)
    .where(
      and(
        eq(books.sellerId, sellerId),
        eq(books.sellerType, sellerType),
      ),
    )
    .orderBy(desc(books.createdAt));
}

// ── Mutations ─────────────────────────────────────────────────

export async function createBook(data: InsertBook) {
  const result = await getDb()
    .insert(books)
    .values(data)
    .returning();
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to create book");
  return findBookById(id);
}

export async function updateBook(id: number, data: Partial<InsertBook>) {
  await getDb()
    .update(books)
    .set(data)
    .where(eq(books.id, id));
  return findBookById(id);
}

export async function deleteBook(id: number) {
  await getDb()
    .delete(books)
    .where(eq(books.id, id));
}

export async function approveBook(id: number) {
  return updateBook(id, { status: "approved" });
}

export async function rejectBook(id: number) {
  return updateBook(id, { status: "rejected" });
}

export async function incrementBookViews(id: number) {
  const getDb = (await import("./connection")).getDb;
  const { sql } = await import("drizzle-orm");
  await getDb()
    .update(books)
    .set({ views: sql`${books.views} + 1` })
    .where(eq(books.id, id));
}
