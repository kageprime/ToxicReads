import { relations } from "drizzle-orm";
import { books, purchases } from "./schema";

export const booksRelations = relations(books, ({ many }) => ({
  purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  book: one(books, {
    fields: [purchases.bookId],
    references: [books.id],
  }),
}));
