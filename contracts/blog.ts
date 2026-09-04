import type { Book } from "@db/schema";

// Frontend-facing Book shape
export interface BookDisplay {
  id: number;
  title: string;
  author: string;
  description: string;
  price: string;
  coverImage: string;
  category: string;
  slug: string | null;
  authorSlug: string | null;
  sellerId: number | null;
  sellerType: "admin" | "user";
  status: "pending" | "approved" | "rejected";
  views: number;
  createdAt: Date;
}

/** Canonical public URL for a book. Falls back to the legacy numeric URL. */
export function bookUrl(book: { slug?: string | null; id: number }): string {
  return `/book/${book.slug || book.id}`;
}

/** Canonical public URL for an author page. */
export function authorUrl(book: {
  authorSlug?: string | null;
  author: string;
}): string {
  return `/author/${book.authorSlug || encodeURIComponent(book.author)}`;
}

/**
 * Transform a database Book row into the BookDisplay shape the UI expects.
 */
export function toBookDisplay(book: Book): BookDisplay {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    price: book.price,
    coverImage: book.coverImage,
    category: book.category,
    slug: book.slug,
    authorSlug: book.authorSlug,
    sellerId: book.sellerId,
    sellerType: book.sellerType as "admin" | "user",
    status: book.status as "pending" | "approved" | "rejected",
    views: book.views ?? 0,
    createdAt: book.createdAt,
  };
}
