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
  sellerId: number | null;
  sellerType: "admin" | "user";
  status: "pending" | "approved" | "rejected";
  views: number;
  createdAt: Date;
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
    sellerId: book.sellerId,
    sellerType: book.sellerType as "admin" | "user",
    status: book.status as "pending" | "approved" | "rejected",
    views: book.views ?? 0,
    createdAt: book.createdAt,
  };
}
