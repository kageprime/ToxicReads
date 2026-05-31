import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware.js";
import {
  findApprovedBooks,
  findBookById,
  findApprovedBookById,
  findAllBooks,
  findPendingBooks,
  findBooksBySeller,
  createBook,
  updateBook,
  deleteBook,
  approveBook,
  rejectBook,
  incrementBookViews,
} from "./queries/books.js";
import { hasUserPurchasedBook } from "./queries/purchases.js";
import { checkRateLimit } from "./lib/rate-limiter.js";
import { signReadToken, verifyReadToken } from "./lib/read-token.js";

const CHUNK_SIZE = 5000;
const READ_LIMIT_PER_HOUR = 10;

function splitIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }
  return chunks.length > 0 ? chunks : [""];
}

export const bookRouter = createRouter({
  // ── Public: browse approved books ───────────────────────────

  list: publicQuery.query(async () => findApprovedBooks()),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findApprovedBookById(input.id);
    }),

  // ── Authenticated: read purchased book (first chunk + session token) ─

  read: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const rlKey = `read:${ctx.user.id}:${input.id}`;
      if (!checkRateLimit(rlKey, READ_LIMIT_PER_HOUR, 3600000)) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Read limit reached. Try again later." });
      }

      const book = await findBookById(input.id);
      if (!book) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });
      }
      if (book.status !== "approved") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Book not available" });
      }
      const isFree = book.price === "0" || book.price === "0.00";
      if (!isFree) {
        const purchased = await hasUserPurchasedBook(ctx.user.id, input.id);
        if (!purchased) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Purchase required to read" });
        }
      }

      const chunks = splitIntoChunks(book.content || "");
      const token = await signReadToken({ bookId: book.id, userId: ctx.user.id });

      return {
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        price: book.price,
        coverImage: book.coverImage,
        category: book.category,
        condition: book.condition,
        views: book.views,
        createdAt: book.createdAt,
        chunks: chunks.length,
        chunk: chunks[0] ?? "",
        token,
      };
    }),

  // ── Authenticated: fetch a content fragment ─────────────────

  readChunk: authedQuery
    .input(z.object({ token: z.string(), chunk: z.number().min(0) }))
    .query(async ({ ctx, input }) => {
      const payload = await verifyReadToken(input.token);
      if (!payload || payload.userId !== ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired read session. Please refresh the reader." });
      }

      const book = await findBookById(payload.bookId);
      if (!book) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });
      }

      const chunks = splitIntoChunks(book.content || "");
      if (input.chunk >= chunks.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Chunk index out of range" });
      }

      return { chunk: chunks[input.chunk], index: input.chunk };
    }),

  // ── Authenticated: check if user can access a book ───────────

  hasPurchased: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const book = await findApprovedBookById(input.id);
      if (book && (book.price === "0" || book.price === "0.00")) return true;
      return hasUserPurchasedBook(ctx.user.id, input.id);
    }),

  // ── Track views (no auth required) ─────────────────────────

  incrementView: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await incrementBookViews(input.id);
      return { success: true };
    }),

  // ── Authenticated: submit a book for sale ───────────────────

  submit: authedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        author: z.string().min(1).max(255),
        description: z.string().min(1),
        content: z.string().default(""),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
        coverImage: z.string().max(500),
        category: z.string().min(1).max(100),
        condition: z.enum(["new", "like-new", "good", "fair"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const book = await createBook({
        ...input,
        sellerId: ctx.user.id,
        sellerType: "user",
        status: "pending",
      });
      return book;
    }),

  mySubmissions: authedQuery.query(async ({ ctx }) => {
    return findBooksBySeller(ctx.user.id, "user");
  }),

  // ── Authenticated: update own submitted book (pending only) ──

  updateMySubmission: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().max(255).optional(),
        author: z.string().max(255).optional(),
        description: z.string().optional(),
        content: z.string().optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        coverImage: z.string().max(500).optional(),
        category: z.string().max(100).optional(),
        condition: z.enum(["new", "like-new", "good", "fair"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const book = await findBookById(id);
      if (!book) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });
      }
      if (book.sellerId !== ctx.user.id || book.sellerType !== "user") {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own submissions" });
      }
      if (book.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Can only edit pending submissions" });
      }
      return updateBook(id, data);
    }),

  // ── Authenticated: delete own pending submission ─────────────

  deleteMySubmission: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const book = await findBookById(input.id);
      if (!book) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });
      }
      if (book.sellerId !== ctx.user.id || book.sellerType !== "user") {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own submissions" });
      }
      if (book.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Can only delete pending submissions" });
      }
      await deleteBook(input.id);
      return { success: true };
    }),

  // ── Admin: manage all books ─────────────────────────────────

  adminList: adminQuery.query(async () => findAllBooks()),

  pendingList: adminQuery.query(async () => findPendingBooks()),

  adminById: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => findBookById(input.id)),

  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        author: z.string().min(1).max(255),
        description: z.string().min(1),
        content: z.string().default(""),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
        coverImage: z.string().max(500),
        category: z.string().min(1).max(100),
        condition: z.enum(["new", "like-new", "good", "fair"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const book = await createBook({
        ...input,
        sellerId: ctx.user.id,
        sellerType: "admin",
        status: "approved",
      });
      return book;
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().max(255).optional(),
        author: z.string().max(255).optional(),
        description: z.string().optional(),
        content: z.string().optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        coverImage: z.string().max(500).optional(),
        category: z.string().max(100).optional(),
        condition: z.enum(["new", "like-new", "good", "fair"]).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateBook(id, data);
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteBook(input.id);
      return { success: true };
    }),

  approve: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return approveBook(input.id);
    }),

  reject: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return rejectBook(input.id);
    }),
});