import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./connection.js";
import { notifications } from "../../db/schema.js";
import type { InsertNotification } from "../../db/schema.js";

export async function findNotificationsByUser(userId: number) {
  return getDb()
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function findUnreadCount(userId: number) {
  const rows = await getDb()
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      )
    );
  return rows.length;
}

export async function createNotification(data: InsertNotification) {
  const result = await getDb()
    .insert(notifications)
    .values(data)
    .returning();
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to create notification");
  const row = await getDb()
    .select()
    .from(notifications)
    .where(eq(notifications.id, id))
    .limit(1);
  return row.at(0) ?? null;
}

export async function markNotificationRead(id: number) {
  await getDb()
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, id));
  return { success: true };
}

export async function markAllNotificationsRead(userId: number) {
  await getDb()
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, userId));
  return { success: true };
}
