import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery, adminQuery } from "./middleware.js";
import {
  findPurchasesWithBookDetails,
  hasUserPurchasedBook,
  fulfillPaidOrder,
} from "./queries/purchases.js";
import { findApprovedBookById } from "./queries/books.js";
import {
  paystackConfigured,
  nairaToKobo,
  newPaystackReference,
  initPaystackTransaction,
  verifyPaystackTransaction,
} from "./lib/paystack.js";

function assertCallbackBase(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid app URL." });
  }
  const host = url.hostname;
  const ok =
    url.protocol === "https:" ||
    host === "localhost" ||
    host === "127.0.0.1";
  if (!ok) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid app URL." });
  }
  return url.origin;
}

async function guardBuyable(bookId: number, buyerId: number) {
  const book = await findApprovedBookById(bookId);
  if (!book) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Book not found or not available",
    });
  }
  // Prevent buying your own book
  if (book.sellerId === buyerId && book.sellerType === "user") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You cannot purchase your own book",
    });
  }
  const alreadyPurchased = await hasUserPurchasedBook(buyerId, bookId);
  if (alreadyPurchased) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "You have already purchased this book",
    });
  }
  return book;
}

export const purchaseRouter = createRouter({
  // ── Paystack: start hosted checkout ─────────────────────────

  paystackInit: authedQuery
    .input(
      z.object({
        bookId: z.number(),
        email: z.string().email("Enter a valid email for your receipt"),
        callbackBase: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const book = await guardBuyable(input.bookId, ctx.user.id);
      const isFree = book.price === "0" || book.price === "0.00";
      if (isFree) {
        const { purchase } = await fulfillPaidOrder(ctx.user.id, book.id);
        return { free: true as const, purchase };
      }
      if (!paystackConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Card payments are not configured yet. Please try again later.",
        });
      }
      const callbackBase = assertCallbackBase(input.callbackBase);
      const reference = newPaystackReference();
      const { authorizationUrl } = await initPaystackTransaction({
        email: input.email,
        amountKobo: nairaToKobo(book.price),
        reference,
        callbackUrl: `${callbackBase}/payment/callback`,
        metadata: {
          bookId: book.id,
          buyerId: ctx.user.id,
          bookTitle: book.title.slice(0, 100),
        },
      });
      return { free: false as const, authorizationUrl, reference };
    }),

  // ── Paystack: verify after redirect back ────────────────────

  paystackVerify: authedQuery
    .input(z.object({ reference: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const result = await verifyPaystackTransaction(input.reference);
      if (!result.paid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment was not completed. No charge was made.",
        });
      }
      const metaBookId = Number(result.metadata.bookId);
      const metaBuyerId = Number(result.metadata.buyerId);
      if (!metaBookId || metaBuyerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This payment does not belong to your account.",
        });
      }
      const book = await findApprovedBookById(metaBookId);
      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found or not available",
        });
      }
      if (result.amountKobo !== nairaToKobo(book.price)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Paid amount does not match the book price. Contact support.",
        });
      }
      const { purchase, alreadyOwned } = await fulfillPaidOrder(
        ctx.user.id,
        book.id
      );
      return { purchase, book, alreadyOwned };
    }),

  // ── Authenticated: my purchases ─────────────────────────────

  myPurchases: authedQuery.query(async ({ ctx }) => {
    return findPurchasesWithBookDetails(ctx.user.id);
  }),

  // ── Admin: all purchases ────────────────────────────────────

  adminList: adminQuery.query(async () => {
    // Return all purchases with details
    const { getDb } = await import("./queries/connection.js");
    const {
      purchases,
      books: booksTable,
      localUsers,
    } = await import("../db/schema.js");
    const { eq, desc } = await import("drizzle-orm");
    const db = getDb();

    const allPurchases = await db
      .select()
      .from(purchases)
      .orderBy(desc(purchases.createdAt));

    return Promise.all(
      allPurchases.map(async purchase => {
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
      })
    );
  }),
});
