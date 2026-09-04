import { eq, and, desc, like, or, sql, gte, lte } from "drizzle-orm";
import { getDb } from "./connection.js";
import { books } from "../../db/schema.js";
import type { InsertBook } from "../../db/schema.js";
import { slugify } from "../lib/slugify.js";

// ── Public: approved books only ───────────────────────────────

export async function findApprovedBooks() {
  return getDb()
    .select()
    .from(books)
    .where(eq(books.status, "approved"))
    .orderBy(desc(books.createdAt));
}

export async function searchApprovedBooks(params: {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const conditions = [eq(books.status, "approved")];

  if (params.q) {
    const searchCondition = or(
      like(books.title, `%${params.q}%`),
      like(books.author, `%${params.q}%`),
      like(books.description, `%${params.q}%`)
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  if (params.category) {
    conditions.push(eq(books.category, params.category));
  }

  if (params.minPrice !== undefined) {
    conditions.push(gte(sql`CAST(${books.price} AS REAL)`, params.minPrice));
  }

  if (params.maxPrice !== undefined) {
    conditions.push(lte(sql`CAST(${books.price} AS REAL)`, params.maxPrice));
  }

  return getDb()
    .select()
    .from(books)
    .where(and(...conditions))
    .orderBy(desc(books.createdAt));
}

export async function findBooksByAuthor(author: string) {
  return getDb()
    .select()
    .from(books)
    .where(
      and(
        eq(books.status, "approved"),
        like(books.author, `%${author}%`)
      )
    )
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

// ── Slug lookups (canonical public URLs: /book/:slug) ──────────

export async function findBookBySlug(slug: string) {
  const rows = await getDb()
    .select()
    .from(books)
    .where(eq(books.slug, slug))
    .limit(1);
  return rows.at(0) ?? null;
}

export async function findApprovedBookBySlug(slug: string) {
  const rows = await getDb()
    .select()
    .from(books)
    .where(and(eq(books.slug, slug), eq(books.status, "approved")))
    .limit(1);
  return rows.at(0) ?? null;
}

export async function findBooksByAuthorSlug(authorSlug: string) {
  return getDb()
    .select()
    .from(books)
    .where(
      and(eq(books.authorSlug, authorSlug), eq(books.status, "approved"))
    )
    .orderBy(desc(books.createdAt));
}

/** Generate a unique book slug. Slugs are immutable after publish. */
export async function generateUniqueBookSlug(
  title: string,
  excludeId?: number
): Promise<string> {
  const base = slugify(title);
  const rows = await getDb()
    .select({ id: books.id, slug: books.slug })
    .from(books);
  const taken = new Set(
    rows
      .filter(r => r.id !== excludeId && !!r.slug)
      .map(r => r.slug as string)
  );
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

// ── Admin: all books with filters ─────────────────────────────

export async function findAllBooks() {
  return getDb().select().from(books).orderBy(desc(books.createdAt));
}

export async function findPendingBooks() {
  return getDb()
    .select()
    .from(books)
    .where(eq(books.status, "pending"))
    .orderBy(desc(books.createdAt));
}

export async function findBooksBySeller(
  sellerId: number,
  sellerType: "admin" | "user"
) {
  return getDb()
    .select()
    .from(books)
    .where(and(eq(books.sellerId, sellerId), eq(books.sellerType, sellerType)))
    .orderBy(desc(books.createdAt));
}

// ── Mutations ─────────────────────────────────────────────────

export async function createBook(data: InsertBook) {
  const result = await getDb().insert(books).values(data).returning();
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to create book");
  return findBookById(id);
}

export async function updateBook(id: number, data: Partial<InsertBook>) {
  await getDb().update(books).set(data).where(eq(books.id, id));
  return findBookById(id);
}

export async function deleteBook(id: number) {
  await getDb().delete(books).where(eq(books.id, id));
}

export async function approveBook(id: number) {
  return updateBook(id, { status: "approved" });
}

export async function rejectBook(id: number) {
  return updateBook(id, { status: "rejected" });
}

export async function incrementBookViews(id: number) {
  const getDb = (await import("./connection.js")).getDb;
  const { sql } = await import("drizzle-orm");
  await getDb()
    .update(books)
    .set({ views: sql`${books.views} + 1` })
    .where(eq(books.id, id));
}
