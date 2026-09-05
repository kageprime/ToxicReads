import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  PiCaretLeft,
  PiBookOpen,
  PiGlobe,
  PiTwitterLogo,
  PiInstagramLogo,
  PiMapPin,
  PiEye,
  PiCurrencyNgn,
  PiStarFill,
  PiPencilSimple,
} from "react-icons/pi";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import BookCard from "@/components/BookCard";
import { BookGridSkeleton, Skel } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";

function prettyName(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function socialUrl(kind: "website" | "twitter" | "instagram", value: string) {
  if (kind === "website") {
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  }
  const handle = value.replace(/^@/, "");
  return kind === "twitter"
    ? `https://x.com/${handle}`
    : `https://instagram.com/${handle}`;
}

export default function AuthorProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const profileQuery = trpc.author.profile.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  // Legacy fallback: old URLs used the raw name (/author/Felix%20Obekpa).
  const needsFallback =
    !!slug && profileQuery.isSuccess && !profileQuery.data;
  let legacyName = slug ?? "";
  try {
    legacyName = decodeURIComponent(slug ?? "");
  } catch {
    // slug is already plain text
  }
  const fallbackQuery = trpc.book.byAuthor.useQuery(
    { author: legacyName },
    { enabled: needsFallback && legacyName !== slug }
  );

  // Old name URL → canonical slug URL.
  const canonical = fallbackQuery.data?.[0]?.authorSlug;
  useEffect(() => {
    if (needsFallback && canonical && canonical !== slug) {
      navigate(`/author/${canonical}`, { replace: true });
    }
  }, [needsFallback, canonical, slug, navigate]);

  const isLoading =
    profileQuery.isLoading || (needsFallback && fallbackQuery.isLoading);
  const profile = profileQuery.data ?? null;
  const fallbackBooks =
    !profile && fallbackQuery.data?.length ? fallbackQuery.data : null;

  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <div className="mx-auto max-w-[1120px] px-8 pb-24 pt-10">
          <div className="mb-8 flex items-center gap-5">
            <div className="skel h-20 w-20 shrink-0 rounded-full" aria-hidden="true" />
            <div>
              <Skel className="h-9 w-56" />
              <Skel className="mt-2 h-5 w-40" />
            </div>
          </div>
          <BookGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  // Full profile from the authors table.
  if (profile) {
    const { author, books, stats } = profile;
    return (
      <div className="min-h-full bg-background">
        <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-6 sm:px-8 md:pt-10">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-1 text-muted-foreground transition-opacity hover:opacity-70"
          >
            <PiCaretLeft size={14} />
            <span className="text-[17px]">Back</span>
          </button>

          {/* Header card */}
          <div className="border border-border bg-card p-6 shadow-soft md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="h-20 w-20 shrink-0 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-border font-serif text-3xl text-foreground">
                  {author.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-balance font-serif text-3xl tracking-tight text-baobab md:text-4xl">
                      {author.name}
                    </h1>
                    {author.location && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <PiMapPin size={14} /> {author.location}
                      </p>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => navigate("/admin?tab=authors")}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <PiPencilSimple size={14} /> Edit profile
                    </button>
                  )}
                </div>

                {author.bio ? (
                  <p className="text-pretty mt-3 max-w-2xl leading-relaxed text-foreground/90">
                    {author.bio}
                  </p>
                ) : (
                  <p className="mt-3 text-sm italic text-muted-foreground">
                    This author hasn't written a bio yet.
                  </p>
                )}

                {author.dedication && (
                  <p className="mt-3 border-l-2 border-p-yellow-fg pl-3 font-display text-lg italic text-baobab">
                    {author.dedication}
                  </p>
                )}

                {(author.website || author.twitter || author.instagram) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {author.website && (
                      <a
                        href={socialUrl("website", author.website)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm transition-colors hover:bg-accent"
                      >
                        <PiGlobe size={15} /> Website
                      </a>
                    )}
                    {author.twitter && (
                      <a
                        href={socialUrl("twitter", author.twitter)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm transition-colors hover:bg-accent"
                      >
                        <PiTwitterLogo size={15} /> @{author.twitter.replace(/^@/, "")}
                      </a>
                    )}
                    {author.instagram && (
                      <a
                        href={socialUrl("instagram", author.instagram)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm transition-colors hover:bg-accent"
                      >
                        <PiInstagramLogo size={15} /> @{author.instagram.replace(/^@/, "")}
                      </a>
                    )}
                  </div>
                )}

                {/* Stats */}
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-4">
                  {[
                    { icon: <PiBookOpen size={15} />, label: "Books", value: String(stats.books) },
                    { icon: <PiEye size={15} />, label: "Reads", value: stats.views.toLocaleString() },
                    { icon: <PiCurrencyNgn size={15} />, label: "Sales", value: String(stats.sales) },
                    {
                      icon: <PiStarFill size={14} />,
                      label: "Rating",
                      value: stats.ratings > 0 ? `${stats.avgRating} (${stats.ratings})` : "—",
                    },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-muted-foreground">
                        {s.icon}
                      </span>
                      <span>
                        <dt className="tnum block font-mono text-[15px] text-foreground">
                          {s.value}
                        </dt>
                        <dd className="block text-xs text-muted-foreground">
                          {s.label}
                        </dd>
                      </span>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* Catalogue */}
          <h2 className="mb-4 mt-10 font-serif text-2xl tracking-tight text-baobab">
            Books by {author.name.split(" ")[0]}
          </h2>
          {books.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {books.map((book, i) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  price={book.price}
                  coverImage={book.coverImage}
                  category={book.category}
                  slug={book.slug}
                  authorSlug={book.authorSlug}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<PiBookOpen size={24} />}
              title="No books here yet"
              body="Nothing live in the catalogue right now."
              actionLabel="Browse the library"
              onAction={() => navigate("/home")}
            />
          )}
        </div>
      </div>
    );
  }

  // Legacy name fallback (pre-profile URLs).
  const books = fallbackBooks;
  const sellerName =
    books?.[0]?.author || prettyName(slug ?? "Unknown");
  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-6 sm:px-8 md:pt-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1 text-muted-foreground transition-opacity hover:opacity-70"
        >
          <PiCaretLeft size={14} />
          <span className="text-[17px]">Back</span>
        </button>
        <div className="mb-8 flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-border font-serif text-[28px] text-foreground">
            {sellerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-[34px] font-normal leading-none tracking-[-0.01em] text-foreground">
              {sellerName}
            </h1>
            {books && (
              <p className="tnum mt-1 text-[17px] text-muted-foreground">
                {books.length} book{books.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        {books && books.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {books.map((book, i) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                price={book.price}
                coverImage={book.coverImage}
                category={book.category}
                slug={book.slug}
                authorSlug={book.authorSlug}
                createdAt={book.createdAt}
                index={i}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<PiBookOpen size={24} />}
            title="No books here yet"
            body={`${sellerName} has nothing live in the catalogue right now.`}
            actionLabel="Browse the library"
            onAction={() => navigate("/home")}
          />
        )}
      </div>
    </div>
  );
}
