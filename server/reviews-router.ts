import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware.js";
import {
  findReviewsByBook,
  findReviewByUserAndBook,
  findReviewById,
  createReview,
  deleteReview,
  getBookRatingAverage,
} from "./queries/reviews.js";
import { createNotification } from "./queries/notifications.js";
import { findBookById } from "./queries/books.js";

export const reviewsRouter = createRouter({
  byBook: publicQuery
    .input(z.object({ bookId: z.number() }))
    .query(async ({ input }) => {
      const reviewsList = await findReviewsByBook(input.bookId);
      const stats = await getBookRatingAverage(input.bookId);
      return { reviews: reviewsList, stats };
    }),

  myReview: authedQuery
    .input(z.object({ bookId: z.number() }))
    .query(async ({ ctx, input }) => {
      return findReviewByUserAndBook(ctx.user.id, input.bookId);
    }),

  create: authedQuery
    .input(
      z.object({
        bookId: z.number(),
        rating: z.number().min(1).max(5),
        text: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await findReviewByUserAndBook(
        ctx.user.id,
        input.bookId
      );
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already reviewed this book",
        });
      }

      const book = await findBookById(input.bookId);
      if (!book || book.status !== "approved") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      const review = await createReview({
        bookId: input.bookId,
        userId: ctx.user.id,
        rating: input.rating,
        text: input.text || null,
      });

      // Notify seller
      if (book.sellerId && book.sellerId !== ctx.user.id) {
        await createNotification({
          userId: book.sellerId,
          type: "new_review",
          message: `Someone reviewed your book "${book.title}"`,
          link: `/book/${book.id}`,
        });
      }

      return review;
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const found = await findReviewById(input.id);
      if (!found || found.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }
      await deleteReview(input.id);
      return { success: true };
    }),
});
