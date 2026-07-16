import { useParams, useNavigate } from "react-router";
import { PiCaretLeft } from "react-icons/pi";
import { trpc } from "@/providers/trpc";
import BookCard from "@/components/BookCard";

export default function AuthorProfile() {
  const { author } = useParams<{ author: string }>();
  const navigate = useNavigate();

  const { data: books, isLoading } = trpc.book.byAuthor.useQuery(
    { author: author || "" },
    { enabled: !!author }
  );

  const sellerName = author || "Unknown";

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
