import { z } from "zod";
import { createRouter, authedQuery } from "./middleware.js";
import {
  findNotificationsByUser,
  findUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./queries/notifications.js";

export const notificationsRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    return findNotificationsByUser(ctx.user.id);
  }),

  unreadCount: authedQuery.query(async ({ ctx }) => {
    return findUnreadCount(ctx.user.id);
  }),

  markRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return markNotificationRead(input.id);
    }),

  markAllRead: authedQuery.mutation(async ({ ctx }) => {
    return markAllNotificationsRead(ctx.user.id);
  }),
});
