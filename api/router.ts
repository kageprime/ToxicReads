import { localAuthRouter } from "./local-auth-router";
import { bookRouter } from "./book-router";
import { purchaseRouter } from "./purchase-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: localAuthRouter,
  book: bookRouter,
  purchase: purchaseRouter,
});

export type AppRouter = typeof appRouter;
