import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createRouter,
  publicQuery,
  authedQuery,
  adminQuery,
} from "./middleware.js";
import {
  findAuthorBySlug,
  findAllAuthors,
  updateAuthor,
} from "./queries/authors.js";
import { findBooksByAuthorSlug } from "./queries/books.js";
import { findBooksBySeller } from "./queries/books.js";
import { getBookRatingAverage } from "./queries/reviews.js";
import { countPurchasesForBooks } from "./queries/purchases.js";

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

export const authorRouter = createRouter({
  // ── Public: full profile + catalogue + stats ──────────────

  profile: publicQuery
    .input(z.object({ slug: z.string().min(1).max(100) }))
    .query(async ({ input }) => {
      const author = await findAuthorBySlug(input.slug);
      if (!author) return null;
      const books = await findBooksByAuthorSlug(author.slug);
      const ids = books.map(b => b.id);
      const views = books.reduce((sum, b) => sum + (b.views ?? 0), 0);
      const sales = await countPurchasesForBooks(ids);
      let ratingSum = 0;
      let ratingCount = 0;
      for (const b of books) {
        const r = await getBookRatingAverage(b.id);
        ratingSum += (r.avg ?? 0) * (r.count ?? 0);
        ratingCount += r.count ?? 0;
      }
      return {
        author,
        books,
        stats: {
          books: books.length,
          views,
          sales,
          avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
          ratings: ratingCount,
        },
      };
    }),

  // ── Admin: manage profiles ────────────────────────────────

  adminList: adminQuery.query(async () => {
    const authors = await findAllAuthors();
    return Promise.all(
      authors.map(async a => {
        const books = await findBooksByAuthorSlug(a.slug);
        return { ...a, bookCount: books.length };
      })
    );
  }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        bio: z.string().max(2000).optional(),
        dedication: z.string().max(500).optional(),
        avatar: z.string().max(500).optional(),
        location: z.string().max(120).optional(),
        website: z.string().max(500).optional(),
        twitter: z.string().max(120).optional(),
        instagram: z.string().max(120).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...raw } = input;
      const data = {
        ...(raw.bio !== undefined && { bio: stripHtml(raw.bio) }),
        ...(raw.dedication !== undefined && {
          dedication: stripHtml(raw.dedication),
        }),
        ...(raw.avatar !== undefined && { avatar: raw.avatar.trim() }),
        ...(raw.location !== undefined && {
          location: stripHtml(raw.location),
        }),
        ...(raw.website !== undefined && { website: raw.website.trim() }),
        ...(raw.twitter !== undefined && {
          twitter: raw.twitter.trim().replace(/^@/, ""),
        }),
        ...(raw.instagram !== undefined && {
          instagram: raw.instagram.trim().replace(/^@/, ""),
        }),
      };
      return updateAuthor(id, data);
    }),

  // ── Seller self-service: own author profiles ──────────────

  myProfiles: authedQuery.query(async ({ ctx }) => {
    const authors = await findAllAuthors();
    const owned = authors.filter(a => a.userId === ctx.user.id);
    // Suggest unclaimed pen names from the seller's own books.
    const myBooks = await findBooksBySeller(ctx.user.id, "user");
    const myAuthorIds = new Set(
      myBooks.map(b => b.authorId).filter((v): v is number => v !== null)
    );
    const suggested = authors.filter(
      a => a.userId !== ctx.user.id && (a.userId == null && myAuthorIds.has(a.id))
    );
    return { owned, suggested };
  }),

  claim: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const authors = await findAllAuthors();
      const author = authors.find(a => a.id === input.id);
      if (!author) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Author not found" });
      }
      if (author.userId && author.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This profile is managed by another account",
        });
      }
      if (!author.userId) {
        await updateAuthor(author.id, { userId: ctx.user.id });
      }
      return updateAuthor(author.id, {});
    }),

  updateOwn: authedQuery
    .input(
      z.object({
        id: z.number(),
        bio: z.string().max(2000).optional(),
        dedication: z.string().max(500).optional(),
        avatar: z.string().max(500).optional(),
        location: z.string().max(120).optional(),
        website: z.string().max(500).optional(),
        twitter: z.string().max(120).optional(),
        instagram: z.string().max(120).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...raw } = input;
      const authors = await findAllAuthors();
      const author = authors.find(a => a.id === id);
      if (!author) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Author not found" });
      }
      if (author.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own author profile",
        });
      }
      const data = {
        ...(raw.bio !== undefined && { bio: stripHtml(raw.bio) }),
        ...(raw.dedication !== undefined && {
          dedication: stripHtml(raw.dedication),
        }),
        ...(raw.avatar !== undefined && { avatar: raw.avatar.trim() }),
        ...(raw.location !== undefined && {
          location: stripHtml(raw.location),
        }),
        ...(raw.website !== undefined && { website: raw.website.trim() }),
        ...(raw.twitter !== undefined && {
          twitter: raw.twitter.trim().replace(/^@/, ""),
        }),
        ...(raw.instagram !== undefined && {
          instagram: raw.instagram.trim().replace(/^@/, ""),
        }),
      };
      return updateAuthor(id, data);
    }),
});
