import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import type { BookDisplay } from "../../contracts/blog";
import { conditionLabels, conditionColors } from "../../contracts/blog";

interface BookListProps {
  books: BookDisplay[];
}

export default function BookList({ books }: BookListProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const categories = ["all", ...Array.from(new Set(books.map((b) => b.category)))];

  const filteredBooks = books.filter((b) => {
    if (filter !== "all" && b.category !== filter) return false;
    if (conditionFilter !== "all" && b.condition !== conditionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false;
    }
    if (priceRange !== "all") {
      const price = parseFloat(b.price);
      if (priceRange === "under5" && price >= 5) return false;
      if (priceRange === "5to10" && (price < 5 || price > 10)) return false;
      if (priceRange === "10to20" && (price < 10 || price > 20)) return false;
      if (priceRange === "over20" && price <= 20) return false;
    }
    return true;
  });

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-grey)", marginBottom: "8px", lineHeight: 1.4 }}>
          BROWSE COLLECTION
        </h2>
        {isAdmin && (
          <button onClick={() => navigate("/add-book")} style={{ fontSize: "10px", color: "var(--text-grey)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace", marginBottom: "8px" }}>
            + ADD BOOK
          </button>
        )}
      </div>

      <p style={{ fontSize: "11px", color: "var(--text-grey)", marginBottom: "20px", fontFamily: "'Space Mono', monospace" }}>
        {books.length} books available
      </p>

      <div className="flex flex-wrap gap-1 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              fontSize: "9px",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.05em",
              padding: "3px 8px",
              border: filter === cat ? "1px solid var(--text-charcoal)" : "1px solid var(--border-light)",
              background: filter === cat ? "var(--text-charcoal)" : "transparent",
              color: filter === cat ? "var(--bg-warm-white)" : "var(--text-grey)",
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
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or author..."
          style={{
            flex: 1, minWidth: "180px", fontSize: "11px", padding: "6px 10px",
            border: "1px solid var(--border-light)", outline: "none",
            color: "var(--text-charcoal)", fontFamily: "'Space Mono', monospace",
            background: "transparent",
          }}
        />
        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          style={{
            fontSize: "10px", padding: "6px 8px",
            border: "1px solid var(--border-light)", outline: "none",
            color: "var(--text-grey)", fontFamily: "'Space Mono', monospace",
            background: "transparent",
          }}
        >
          <option value="all">All Conditions</option>
          <option value="new">New</option>
          <option value="like-new">Like New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
        </select>
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          style={{
            fontSize: "10px", padding: "6px 8px",
            border: "1px solid var(--border-light)", outline: "none",
            color: "var(--text-grey)", fontFamily: "'Space Mono', monospace",
            background: "transparent",
          }}
        >
          <option value="all">All Prices</option>
          <option value="under5">Under $5</option>
          <option value="5to10">$5 - $10</option>
          <option value="10to20">$10 - $20</option>
          <option value="over20">Over $20</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredBooks.map((book, idx) => (
          <article
            key={book.id}
            style={{ cursor: "pointer", contentVisibility: "auto", containIntrinsicSize: "200px", animation: "fadeIn 0.4s ease-out both", animationDelay: `${Math.min(idx * 0.03, 0.2)}s` }}
            onClick={() => navigate(`/book/${book.id}`)}
          >
            <div
              className="overflow-hidden mb-2"
              style={{ border: "1px solid var(--border-light)", aspectRatio: "3/4" }}
              onMouseEnter={() => setHoveredId(book.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <img
                src={book.coverImage}
                alt={book.title}
                width="200"
                height="267"
                decoding="async"
                fetchPriority={idx < 10 ? "high" : "auto"}
                className="w-full h-full block transition-all duration-300 object-cover"
                style={{
                  filter: hoveredId === book.id ? "grayscale(100%) brightness(0.9)" : "none",
                  transform: hoveredId === book.id ? "scale(1.02)" : "scale(1)",
                }}
                loading="lazy"
              />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 style={{ fontSize: "13px", fontWeight: 400, lineHeight: 1.4, color: "var(--text-charcoal)", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {book.title}
                </h3>
                <p style={{ fontSize: "11px", color: "var(--text-grey)", lineHeight: 1.5, marginBottom: "4px" }}>
                  {book.author}
                </p>
              </div>
              <span
                style={{
                  fontSize: "9px",
                  fontFamily: "'Space Mono', monospace",
                  color: conditionColors[book.condition] || "var(--text-grey)",
                  border: `1px solid ${conditionColors[book.condition] || "var(--border-light)"}`,
                  padding: "2px 6px",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                {conditionLabels[book.condition] || book.condition.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: "12px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", marginTop: "4px" }}>
              ${book.price}
            </p>
            {book.views !== undefined && (
              <p style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", color: "var(--text-grey)", marginTop: "2px" }}>
                {book.views} view{book.views !== 1 ? "s" : ""}
              </p>
            )}
          </article>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-16">
          <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>
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