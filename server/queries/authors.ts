import { eq } from "drizzle-orm";
import { getDb } from "./connection.js";
import { authors } from "../../db/schema.js";
import type { InsertAuthor } from "../../db/schema.js";
import { slugify } from "../lib/slugify.js";

export async function findAuthorBySlug(slug: string) {
  const rows = await getDb()
    .select()
    .from(authors)
    .where(eq(authors.slug, slug))
    .limit(1);
  return rows.at(0) ?? null;
}

export async function findAuthorById(id: number) {
  const rows = await getDb()
    .select()
    .from(authors)
    .where(eq(authors.id, id))
    .limit(1);
  return rows.at(0) ?? null;
}

export async function findAllAuthors() {
  return getDb().select().from(authors).orderBy(authors.name);
}

/** Find the author row for a display name, creating it on first use. */
export async function ensureAuthorByName(name: string) {
  const clean = name.replace(/<[^>]*>/g, "").trim() || "Unknown Author";
  const slug = slugify(clean);
  const existing = await findAuthorBySlug(slug);
  if (existing) return existing;
  const result = await getDb()
    .insert(authors)
    .values({ name: clean, slug })
    .returning();
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to create author");
  const row = await findAuthorById(id);
  if (!row) throw new Error("Failed to create author");
  return row;
}

export async function updateAuthor(
  id: number,
  data: Partial<InsertAuthor>
) {
  await getDb().update(authors).set(data).where(eq(authors.id, id));
  return findAuthorById(id);
}
