import { z } from "zod";
import { createRouter, authedQuery } from "./middleware.js";
import {
  findWishlistWithBooks,
  isInWishlist,
  addToWishlist,
  removeFromWishlist,
} from "./queries/wishlist.js";

export const wishlistRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    return findWishlistWithBooks(ctx.user.id);
  }),

  check: authedQuery
    .input(z.object({ bookId: z.number() }))
    .query(async ({ ctx, input }) => {
      return isInWishlist(ctx.user.id, input.bookId);
    }),

  add: authedQuery
    .input(z.object({ bookId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return addToWishlist({
        userId: ctx.user.id,
        bookId: input.bookId,
      });
    }),

  remove: authedQuery
    .input(z.object({ bookId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return removeFromWishlist(ctx.user.id, input.bookId);
    }),
});
