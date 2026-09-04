import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { PiCaretLeft } from "react-icons/pi";
import { trpc } from "@/providers/trpc";
import BookCard from "@/components/BookCard";

function prettyName(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function AuthorProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const slugQuery = trpc.book.byAuthorSlug.useQuery(
    { authorSlug: slug ?? "" },
    { enabled: !!slug }
  );

  // Legacy fallback: old URLs used the raw name (/author/Felix%20Obekpa).
  const needsFallback =
    !!slug && slugQuery.isSuccess && (slugQuery.data?.length ?? 0) === 0;
  let legacyName = slug ?? "";
  try {
    legacyName = decodeURIComponent(slug ?? "");
  } catch {}
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

  const books =
    slugQuery.data && slugQuery.data.length > 0
      ? slugQuery.data
      : (fallbackQuery.data ?? slugQuery.data);
  const isLoading =
    slugQuery.isLoading || (needsFallback && fallbackQuery.isLoading);

  const sellerName = books?.[0]?.author || prettyName(slug ?? "Unknown");
  const genres = books
    ? Array.from(new Set(books.map(b => b.category))).join(" · ")
    : "";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "hsl(var(--background))" }}>
        <p style={{ fontSize: "18px", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
          LOADING...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
      <div className="mx-auto" style={{ maxWidth: "1120px", padding: "40px 32px 96px" }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 mb-6 hover:opacity-70 transition-opacity"
        >
          <PiCaretLeft size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
          <span style={{ fontSize: "17px", color: "hsl(var(--muted-foreground))" }}>
            Back
          </span>
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-full border border-border flex items-center justify-center"
            style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "hsl(var(--foreground))" }}
          >
            {sellerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1
              style={{
                fontSize: "34px",
                fontWeight: 400,
                fontFamily: "var(--font-serif)",
                color: "hsl(var(--foreground))",
                letterSpacing: "-0.01em",
              }}
            >
              {sellerName}
            </h1>
            {books && (
              <p style={{ fontSize: "17px", color: "hsl(var(--muted-foreground))" }}>
                {books.length} book{books.length !== 1 ? "s" : ""}
                {genres ? ` · ${genres}` : ""}
              </p>
            )}
          </div>
        </div>

        {books && books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
          <p style={{ fontSize: "19px", color: "hsl(var(--muted-foreground))", textAlign: "center", padding: "40px" }}>
            No books found for this author.
          </p>
        )}
      </div>
    </div>
  );
}
