import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import type { BookDisplay } from "../../contracts/blog";
import ShaderCanvas from "@/components/ShaderCanvas";
import BookCard from "@/components/BookCard";

interface BookListProps {
  books: BookDisplay[];
}

export default function BookList({ books }: BookListProps) {
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
    <div className="p-8 md:p-10 pb-28">
      {/* ── Hero Banner (animated shader + content) ── */}
      <div
        className="mb-8"
        style={{
          position: "relative",
          overflow: "hidden",
          height: "240px",
          border: "1px solid var(--border)",
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
              fontSize: "30px",
              fontWeight: 400,
              fontFamily: "var(--font-serif)",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              marginBottom: "8px",
            }}
          >
            ToxicReads
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
            color: "var(--muted-foreground)",
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
              color: "var(--muted-foreground)",
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
          color: "var(--muted-foreground)",
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
                  ? "1px solid var(--foreground)"
                  : "1px solid var(--border)",
              background:
                filter === cat ? "var(--foreground)" : "transparent",
              color:
                filter === cat ? "var(--background)" : "var(--muted-foreground)",
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
            border: "1px solid var(--border)",
            outline: "none",
            color: "var(--foreground)",
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
            border: "1px solid var(--border)",
            outline: "none",
            color: "var(--muted-foreground)",
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 lg:gap-x-6 lg:gap-y-9">
        {filteredBooks.map((book, idx) => (
          <BookCard
            key={book.id}
            id={book.id}
            title={book.title}
            author={book.author}
            price={book.price}
            coverImage={book.coverImage}
            category={book.category}
            index={idx}
          />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-16">
          <p
            style={{
              fontSize: "18px",
              color: "var(--muted-foreground)",
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
