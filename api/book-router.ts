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

export const bookRouter = createRouter({
  // ── Public: browse approved books ───────────────────────────

  list: publicQuery.query(async () => findApprovedBooks()),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findApprovedBookById(input.id);
    }),

  // ── Authenticated: read purchased book ──────────────────────

  read: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
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
      return book;
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