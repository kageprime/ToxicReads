import { localAuthRouter } from "./local-auth-router.js";
import { bookRouter } from "./book-router.js";
import { authorRouter } from "./author-router.js";
import { purchaseRouter } from "./purchase-router.js";
import { reviewsRouter } from "./reviews-router.js";
import { wishlistRouter } from "./wishlist-router.js";
import { notificationsRouter } from "./notifications-router.js";
import { sellerRouter } from "./seller-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: localAuthRouter,
  book: bookRouter,
  author: authorRouter,
  purchase: purchaseRouter,
  reviews: reviewsRouter,
  wishlistItems: wishlistRouter,
  notifications: notificationsRouter,
  sellerInfo: sellerRouter,
});

export type AppRouter = typeof appRouter;
