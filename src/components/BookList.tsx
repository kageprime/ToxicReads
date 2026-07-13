import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import type { BookDisplay } from "../../contracts/blog";
import SafeImage from "@/components/SafeImage";
import ShaderCanvas from "@/components/ShaderCanvas";

interface BookListProps {
  books: BookDisplay[];
}

export default function BookList({ books }: BookListProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const categories = [
    "all",
    ...Array.from(new Set(books.map(b => b.category))),
  ];

  const filteredBooks = books.filter(b => {
    if (filter !== "all" && b.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !b.title.toLowerCase().includes(q) &&
        !b.author.toLowerCase().includes(q)
      )
        return false;
    }
    if (priceRange !== "all") {
      const price = parseFloat(b.price);
      if (priceRange === "under5000" && price >= 5000) return false;
      if (priceRange === "5000to10000" && (price < 5000 || price > 10000)) return false;
      if (priceRange === "10000to20000" && (price < 10000 || price > 20000)) return false;
      if (priceRange === "over20000" && price <= 20000) return false;
    }
    return true;
  });

  return (
    <div className="p-6 pb-24">
      {/* ── Hero Banner (animated shader + content) ── */}
      <div
        className="mb-8"
        style={{
          position: "relative",
          overflow: "hidden",
          height: "240px",
          border: "1px solid var(--border-light)",
        }}
      >
        <ShaderCanvas />
        <div
          className="flex flex-col justify-center"
          style={{
            mixBlendMode: "difference",
            position: "relative",
            zIndex: 1,
            height: "100%",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              marginBottom: "8px",
            }}
          >
            TOXICREADS
          </h2>
          <p
            style={{
              fontSize: "17px",
              lineHeight: 1.8,
              color: "#FFFFFF",
              marginBottom: "12px",
              maxWidth: "520px",
            }}
          >
            A community-driven marketplace for African sci-fi, horror &amp; thrillers. Admins curate the collection, and users can submit their own books for sale after vetting.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Sci-Fi", "Horror", "Thriller"].map(genre => (
              <span
                key={genre}
                style={{
                  fontSize: "16px",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.4)",
                  padding: "3px 10px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                  letterSpacing: "0.03em",
                }}
              >
                {genre.toUpperCase()}
              </span>
            ))}
          </div>
          {isAuthenticated && (
            <div className="mt-3 flex gap-4">
              <button
                onClick={() => navigate("/my-purchases")}
                style={{
                  fontSize: "16px",
                  color: "#FFFFFF",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                  padding: 0,
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                }}
              >
                MY PURCHASES
              </button>
              <button
                onClick={() => navigate("/submit-book")}
                style={{
                  fontSize: "16px",
                  color: "#FFFFFF",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                  padding: 0,
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                }}
              >
                SELL A BOOK
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 400,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--text-grey)",
            marginBottom: "8px",
            lineHeight: 1.4,
          }}
        >
          BROWSE GENRES
        </h2>
        {isAdmin && (
          <button
            onClick={() => navigate("/add-book")}
            style={{
              fontSize: "16px",
              color: "var(--text-grey)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              marginBottom: "8px",
            }}
          >
            + ADD BOOK
          </button>
        )}
      </div>

      <p
        style={{
          fontSize: "17px",
          color: "var(--text-grey)",
          marginBottom: "20px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        {books.length} books available
      </p>

      <div className="flex flex-wrap gap-1 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              fontSize: "15px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              letterSpacing: "0.05em",
              padding: "3px 8px",
              border:
                filter === cat
                  ? "1px solid var(--text-charcoal)"
                  : "1px solid var(--border-light)",
              background:
                filter === cat ? "var(--text-charcoal)" : "transparent",
              color:
                filter === cat ? "var(--bg-warm-white)" : "var(--text-grey)",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {cat === "all" ? "ALL" : cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search title or author..."
          style={{
            flex: 1,
            minWidth: "180px",
            fontSize: "17px",
            padding: "6px 10px",
            border: "1px solid var(--border-light)",
            outline: "none",
            color: "var(--text-charcoal)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            background: "transparent",
          }}
        />
        <select
          value={priceRange}
          onChange={e => setPriceRange(e.target.value)}
          style={{
            fontSize: "16px",
            padding: "6px 8px",
            border: "1px solid var(--border-light)",
            outline: "none",
            color: "var(--text-grey)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            background: "transparent",
          }}
        >
          <option value="all">All Prices</option>
          <option value="under5000">Under ₦5,000</option>
          <option value="5000to10000">₦5,000 - ₦10,000</option>
          <option value="10000to20000">₦10,000 - ₦20,000</option>
          <option value="over20000">Over ₦20,000</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredBooks.map((book, idx) => (
          <article
            key={book.id}
            style={{
              cursor: "pointer",
              contentVisibility: "auto",
              containIntrinsicSize: "200px",
              animation: "fadeIn 0.4s ease-out both",
              animationDelay: `${Math.min(idx * 0.03, 0.2)}s`,
            }}
            onClick={() => navigate(`/book/${book.id}`)}
          >
            <div
              className="overflow-hidden mb-2"
              style={{
                border: "1px solid var(--border-light)",
                aspectRatio: "3/4",
              }}
              onMouseEnter={() => setHoveredId(book.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <SafeImage
                src={book.coverImage}
                alt={book.title}
                style={{
                  filter:
                    hoveredId === book.id
                      ? "grayscale(100%) brightness(0.9)"
                      : "none",
                  transform: hoveredId === book.id ? "scale(1.02)" : "scale(1)",
                  transition: "filter 0.3s, transform 0.3s",
                }}
              />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  style={{
                    fontSize: "19px",
                    fontWeight: 400,
                    lineHeight: 1.4,
                    color: "var(--text-charcoal)",
                    marginBottom: "2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {book.title}
                </h3>
                <p
                  style={{
                    fontSize: "17px",
                    color: "var(--text-grey)",
                    lineHeight: 1.5,
                    marginBottom: "4px",
                  }}
                >
                  {book.author}
                </p>
              </div>
            </div>
            <p
              style={{
                fontSize: "18px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: "var(--text-charcoal)",
                marginTop: "4px",
              }}
            >
              ₦{book.price}
            </p>
            {book.views !== undefined && (
              <p
                style={{
                  fontSize: "15px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                  color: "var(--text-grey)",
                  marginTop: "2px",
                }}
              >
                {book.views} view{book.views !== 1 ? "s" : ""}
              </p>
            )}
          </article>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-16">
          <p
            style={{
              fontSize: "18px",
              color: "var(--text-grey)",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            No books found
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
