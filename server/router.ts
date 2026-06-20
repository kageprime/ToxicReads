import { localAuthRouter } from "./local-auth-router.js";
import { bookRouter } from "./book-router.js";
import { purchaseRouter } from "./purchase-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: localAuthRouter,
  book: bookRouter,
  purchase: purchaseRouter,
});

export type AppRouter = typeof appRouter;
