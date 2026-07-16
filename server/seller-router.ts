import { createRouter, authedQuery } from "./middleware.js";
import {
  getSellerStats,
  getSellerSales,
} from "./queries/seller.js";
import { findBooksBySeller } from "./queries/books.js";

export const sellerRouter = createRouter({
  stats: authedQuery.query(async ({ ctx }) => {
    const stats = await getSellerStats(ctx.user.id);
    return stats;
  }),

  books: authedQuery.query(async ({ ctx }) => {
    return findBooksBySeller(ctx.user.id, "user");
  }),

  sales: authedQuery.query(async ({ ctx }) => {
    return getSellerSales(ctx.user.id);
  }),
});
