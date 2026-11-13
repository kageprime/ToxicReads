import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  PiBookOpen,
  PiCaretLeft,
  PiCurrencyNgn,
  PiEye,
  PiGlobe,
  PiInstagramLogo,
  PiMapPin,
  PiStarFill,
  PiTwitterLogo,
  PiUser,
} from "react-icons/pi";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import BookCard from "@/components/BookCard";
import EmptyState from "@/components/EmptyState";
import { BookGridSkeleton, Skel } from "@/components/Skeleton";

function socialUrl(kind: "website" | "twitter" | "instagram", value: string) {
  const v = value.trim();
  if (kind === "website") {
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  }
  const handle = v.replace(/^@/, "").replace(/^https?:\/\/[^/]+\//i, "");
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

  const needsFallback = !!slug && profileQuery.isSuccess && !profileQuery.data;
  let legacyName = slug ?? "";
  try {
    legacyName = decodeURIComponent(slug ?? "");
  } catch {
    // slug is plain text
  }
  const fallbackQuery = trpc.book.byAuthor.useQuery(
    { author: legacyName },
    { enabled: needsFallback && legacyName !== slug }
  );

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-8 pb-20">
          <div className="mb-8 flex items-center gap-5">
            <div className="skel h-20 w-20 shrink-0 rounded-full" aria-hidden="true" />
            <div className="space-y-2.5">
              <Skel className="h-9 w-56" />
              <Skel className="h-4 w-40" />
            </div>
          </div>
          <BookGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (profile) {
    const { author, books, stats } = profile;
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-8 pb-20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <PiCaretLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>

          <header className="border-b border-border pb-8 mb-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="h-24 w-24 shrink-0 rounded-full overflow-hidden border border-border bg-secondary flex items-center justify-center">
                {author.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-4xl font-medium text-foreground">
                    {author.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-foreground text-balance">
                      {author.name}
                    </h1>
                    {author.location && (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <PiMapPin className="h-4 w-4" aria-hidden="true" />
                        {author.location}
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => navigate("/admin?tab=authors")}
                      className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      Edit profile
                    </button>
                  )}
                </div>

                {author.bio ? (
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/90 text-pretty">
                    {author.bio}
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Independent speculative fiction writer published on ToxicReads.
                  </p>
                )}

                {author.dedication && (
                  <blockquote className="mt-5 max-w-xl border-l-2 border-signal pl-4 font-serif text-base italic text-muted-foreground">
                    {author.dedication}
                  </blockquote>
                )}

                {(author.website || author.twitter || author.instagram) && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {author.website && (
                      <a
                        href={socialUrl("website", author.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        <PiGlobe className="h-3.5 w-3.5" aria-hidden="true" />
                        {author.website.replace(/^https?:\/\//i, "")}
                      </a>
                    )}
                    {author.twitter && (
                      <a
                        href={socialUrl("twitter", author.twitter)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        <PiTwitterLogo className="h-3.5 w-3.5" aria-hidden="true" />
                        @{author.twitter.replace(/^@/, "")}
                      </a>
                    )}
                    {author.instagram && (
                      <a
                        href={socialUrl("instagram", author.instagram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        <PiInstagramLogo className="h-3.5 w-3.5" aria-hidden="true" />
                        @{author.instagram.replace(/^@/, "")}
                      </a>
                    )}
                  </div>
                )}

                {/* Stats grid */}
                <dl className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
                  {[
                    {
                      icon: <PiBookOpen className="h-4 w-4" aria-hidden="true" />,
                      label: "Editions",
                      value: String(stats.books),
                    },
                    {
                      icon: <PiEye className="h-4 w-4" aria-hidden="true" />,
                      label: "Reads",
                      value: stats.views.toLocaleString(),
                    },
                    {
                      icon: <PiCurrencyNgn className="h-4 w-4" aria-hidden="true" />,
                      label: "Sales",
                      value: String(stats.sales),
                    },
                    {
                      icon: <PiStarFill className="h-4 w-4" aria-hidden="true" />,
                      label: "Rating",
                      value:
                        stats.ratings > 0
                          ? `${stats.avgRating} (${stats.ratings})`
                          : "-",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-border bg-card px-4 py-3"
                    >
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {s.icon}
                        <span>{s.label}</span>
                      </dt>
                      <dd className="mt-1 font-mono text-lg font-medium text-foreground tnum">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </header>

          <section aria-label="Published books">
            <h2 className="font-serif text-2xl font-medium text-foreground tracking-tight mb-6">
              Editions by {author.name.split(" ")[0]}
            </h2>
            {books.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
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
                    authorSlug={author.slug}
                    createdAt={book.createdAt}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<PiBookOpen className="h-5 w-5" aria-hidden="true" />}
                title="No live editions yet"
                body="Titles from this author will appear here once published."
                actionLabel="Browse catalog"
                onAction={() => navigate("/home")}
              />
            )}
          </section>
        </div>
      </div>
    );
  }

  if (fallbackBooks && fallbackBooks.length > 0) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-8 pb-20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <PiCaretLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>

          <div className="mb-8 border-b border-border pb-6">
            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-foreground">
              {legacyName}
            </h1>
            <p className="mt-2 font-mono text-xs text-muted-foreground tnum">
              {fallbackBooks.length} {fallbackBooks.length === 1 ? "edition" : "editions"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
            {fallbackBooks.map((book, i) => (
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-background px-4 py-20">
      <EmptyState
        icon={<PiUser className="h-5 w-5" aria-hidden="true" />}
        title="Author not found"
        body="No author profile or published books match this link."
        actionLabel="Browse catalog"
        onAction={() => navigate("/home")}
      />
    </div>
  );
}
