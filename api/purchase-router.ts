import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery, adminQuery } from "./middleware.js";
import {
  findPurchasesWithBookDetails,
  createPurchase,
  hasUserPurchasedBook,
} from "./queries/purchases.js";
import { findApprovedBookById } from "./queries/books.js";

export const purchaseRouter = createRouter({
  // ── Authenticated: buy a book ───────────────────────────────

  buy: authedQuery
    .input(z.object({ bookId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const book = await findApprovedBookById(input.bookId);
      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found or not available",
        });
      }

      // Prevent buying your own book
      if (book.sellerId === ctx.user.id && book.sellerType === "user") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot purchase your own book",
        });
      }

      // Check if already purchased
      const alreadyPurchased = await hasUserPurchasedBook(
        ctx.user.id,
        input.bookId,
      );
      if (alreadyPurchased) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already purchased this book",
        });
      }

      const purchase = await createPurchase({
        buyerId: ctx.user.id,
        bookId: input.bookId,
        purchasePrice: book.price,
      });

      return purchase;
    }),

  // ── Authenticated: my purchases ─────────────────────────────

  myPurchases: authedQuery.query(async ({ ctx }) => {
    return findPurchasesWithBookDetails(ctx.user.id);
  }),

  // ── Admin: all purchases ────────────────────────────────────

  adminList: adminQuery.query(async () => {
    // Return all purchases with details
    const { getDb } = await import("./queries/connection.js");
    const { purchases, books: booksTable, localUsers } = await import("../db/schema");
    const { eq, desc } = await import("drizzle-orm");
    const db = getDb();

    const allPurchases = await db
      .select()
      .from(purchases)
      .orderBy(desc(purchases.createdAt));

    return Promise.all(
      allPurchases.map(async (purchase) => {
        const bookRows = await db
          .select()
          .from(booksTable)
          .where(eq(booksTable.id, purchase.bookId))
          .limit(1);
        const buyerRows = await db
          .select()
          .from(localUsers)
          .where(eq(localUsers.id, purchase.buyerId))
          .limit(1);
        return {
          ...purchase,
          book: bookRows.at(0) ?? null,
          buyer: buyerRows.at(0) ?? null,
        };
      }),
    );
  }),
});
