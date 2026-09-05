import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "../contracts/constants.js";
import { setSessionCookie } from "./lib/cookies.js";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware.js";
import { checkRateLimit } from "./lib/rate-limiter.js";
import { env } from "./lib/env.js";
import {
  findLocalUserByUsername,
  findLocalUserById,
  verifyLocalPassword,
  createLocalUser,
  updateLocalUser,
  listLocalUsers,
  updateLocalUserStatus,
  deleteLocalUser,
} from "./queries/local-users.js";
import {
  signLocalSessionToken,
  verifyLocalSessionToken,
} from "./local-auth-session.js";

export const localAuthRouter = createRouter({
  me: publicQuery.query(async ({ ctx }) => {
    if (ctx.user && ctx.user.status !== "banned") {
      return {
        id: ctx.user.id,
        username: ctx.user.username,
        name: ctx.user.name,
        role: ctx.user.role,
        status: ctx.user.status,
        location: ctx.user.location ?? null,
      };
    }
    const cookies = cookie.parse(ctx.req.headers.get("cookie") || "");
    const token = cookies[Session.cookieName];
    if (!token) return null;

    const claim = await verifyLocalSessionToken(token);
    if (!claim) return null;

    const user = await findLocalUserById(claim.userId);
    if (!user || user.status === "banned") return null;

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status,
      location: user.location ?? null,
    };
  }),

  login: publicQuery
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip =
        ctx.req.headers.get("x-forwarded-for") ||
        ctx.req.headers.get("cf-connecting-ip") ||
        "unknown";
      const rlKey = `login:${ip}`;
      if (
        !checkRateLimit(rlKey, env.rateLimitMaxAttempts, env.rateLimitWindowMs)
      ) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many login attempts. Try again later.",
        });
      }

      const user = await findLocalUserByUsername(input.username);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const valid = await verifyLocalPassword(user, input.password);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      if (user.status === "banned") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your account has been suspended. Contact support.",
        });
      }

      const token = await signLocalSessionToken({
        username: user.username,
        userId: user.id,
        tokenVersion: user.tokenVersion ?? 0,
      });

      setSessionCookie(ctx.resHeaders, token, ctx.req.headers);

      return {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
        location: user.location ?? null,
        // Returned (not just cookied) so native apps can store it as a
        // Bearer token. Web clients ignore it and use the cookie.
        token,
      };
    }),

  register: publicQuery
    .input(
      z.object({
        username: z.string().min(3).max(100),
        password: z.string().min(6).max(100),
        name: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip =
        ctx.req.headers.get("x-forwarded-for") ||
        ctx.req.headers.get("cf-connecting-ip") ||
        "unknown";
      const rlKey = `register:${ip}`;
      if (
        !checkRateLimit(rlKey, env.rateLimitMaxAttempts, env.rateLimitWindowMs)
      ) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many registration attempts. Try again later.",
        });
      }

      const existing = await findLocalUserByUsername(input.username);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Registration failed. Please try different credentials.",
        });
      }

      const user = await createLocalUser({
        username: input.username,
        password: input.password,
        name: input.name,
      });

      // Sign the user in immediately after registration (industry standard).
      const token = await signLocalSessionToken({
        username: user.username,
        userId: user.id,
        tokenVersion: user.tokenVersion ?? 0,
      });
      setSessionCookie(ctx.resHeaders, token, ctx.req.headers);

      return {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
        location: user.location ?? null,
        // See login: also returned for native Bearer-token clients.
        token,
      };
    }),

  updateCredentials: publicQuery
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newName: z.string().max(100).optional(),
        newUsername: z.string().min(3).max(100).optional(),
        newPassword: z.string().min(6).max(100).optional(),
        newLocation: z.string().max(200).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get current user from session
      const cookies = cookie.parse(ctx.req.headers.get("cookie") || "");
      const token = cookies[Session.cookieName];
      if (!token) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      }

      const claim = await verifyLocalSessionToken(token);
      if (!claim) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid session",
        });
      }

      const user = await findLocalUserById(claim.userId);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Verify current password
      const valid = await verifyLocalPassword(user, input.currentPassword);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      // Check username uniqueness if changing
      if (input.newUsername && input.newUsername !== user.username) {
        const existing = await findLocalUserByUsername(input.newUsername);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Update failed. Please try different credentials.",
          });
        }
      }

      // Update user
      const updated = await updateLocalUser(user.id, {
        name: input.newName,
        username: input.newUsername,
        password: input.newPassword,
        location: input.newLocation,
      });

      // Re-issue session token with new username and current tokenVersion
      const newToken = await signLocalSessionToken({
        username: updated.username,
        userId: updated.id,
        tokenVersion: updated.tokenVersion ?? 0,
      });

      setSessionCookie(ctx.resHeaders, newToken, ctx.req.headers);

      return {
        id: updated.id,
        username: updated.username,
        name: updated.name,
        role: updated.role,
        status: updated.status,
        location: updated.location ?? null,
      };
    }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    setSessionCookie(ctx.resHeaders, "", ctx.req.headers, { maxAge: 0 });
    return { success: true };
  }),

  updateLocation: authedQuery
    .input(z.object({ location: z.string().max(200).optional() }))
    .mutation(async ({ ctx, input }) => {
      await updateLocalUser(ctx.user.id, {
        location: input.location || "",
      });
      return { success: true };
    }),

  // ── Admin: user management ─────────────────────────────────

  adminList: adminQuery.query(async () => {
    const users = await listLocalUsers();
    return users.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      status: u.status,
      location: u.location ?? null,
      createdAt: u.createdAt,
    }));
  }),

  adminUpdateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["active", "banned"]),
      })
    )
    .mutation(async ({ input }) => {
      const user = await findLocalUserById(input.id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      if (user.role === "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change status of another admin",
        });
      }
      await updateLocalUserStatus(input.id, input.status);
      return { success: true, status: input.status };
    }),

  adminDelete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const user = await findLocalUserById(input.id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      if (user.role === "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete another admin",
        });
      }
      await deleteLocalUser(input.id);
      return { success: true };
    }),
});
