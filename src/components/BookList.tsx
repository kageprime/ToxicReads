import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import type { BookDisplay } from "../../contracts/blog";
import ShaderCanvas from "@/components/ShaderCanvas";
import BookCard from "@/components/BookCard";
import { PiMagnifyingGlass, PiPlus, PiSliders } from "react-icons/pi";

interface BookListProps {
  books: BookDisplay[];
}

const priceOptions = [
  { value: "all", label: "All prices" },
  { value: "under5000", label: "Under ₦5,000" },
  { value: "5000to10000", label: "₦5,000 – ₦10,000" },
  { value: "10000to20000", label: "₦10,000 – ₦20,000" },
  { value: "over20000", label: "Over ₦20,000" },
];

export default function BookList({ books }: BookListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("category") || "all";
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const selectCategory = (cat: string) => {
    setSearchParams(
      prev => {
        if (cat === "all") prev.delete("category");
        else prev.set("category", cat);
        return prev;
      },
      { replace: true }
    );
  };

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
    <div className="px-4 sm:px-6 md:px-10 pt-4 md:pt-8 pb-28">
      {/* Mobile header — clean, compact, no hero banner */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-baobab tracking-tight">Browse books</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {books.length} {books.length === 1 ? "book" : "books"} available
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => navigate("/add-book")}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:bg-accent transition-colors"
              aria-label="Add book"
            >
              <PiPlus size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Desktop hero banner — kept for larger screens, but cleaner */}
      <div className="hidden md:block mb-8">
        <div
          className="relative overflow-hidden"
          style={{
            height: "220px",
            border: "1px solid hsl(var(--border))",
          }}
        >
          <ShaderCanvas />
          <div
            className="absolute inset-0 flex flex-col justify-center px-8"
            style={{ mixBlendMode: "difference" }}
          >
            <h2
              className="font-serif text-white text-3xl tracking-tight mb-2"
              style={{ textTransform: "uppercase" }}
            >
              ToxicReads
            </h2>
            <p className="text-white/90 text-base max-w-lg leading-relaxed mb-4">
              A community-driven marketplace for African sci-fi, horror &amp; thrillers. Curated by admins, open for submissions.
            </p>
            <div className="flex items-center gap-3">
              {["Sci-Fi", "Horror", "Thriller"].map(genre => (
                <span
                  key={genre}
                  className="text-white text-xs uppercase tracking-wider px-2.5 py-1 border border-white/40"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop section header */}
      <div className="hidden md:flex items-center justify-between mb-5">
        <div>
          <h2 className="font-serif text-xl text-baobab tracking-tight">Browse</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {books.length} {books.length === 1 ? "book" : "books"} available
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/add-book")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:bg-accent text-sm font-medium transition-colors"
          >
            <PiPlus size={16} /> Add book
          </button>
        )}
      </div>

      {/* Search + price filter */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 min-w-0">
          <PiMagnifyingGlass
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title or author..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
          />
        </div>
        <div className="relative shrink-0">
          <select
            value={priceRange}
            onChange={e => setPriceRange(e.target.value)}
            className="appearance-none h-full pl-4 pr-10 py-2.5 rounded-full border border-border bg-background text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer"
          >
            {priceOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <PiSliders
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>
      </div>

      {/* Genre filter — horizontal scroll chips on mobile, inline wrap on desktop */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {categories.map(cat => {
            const active = filter === cat;
            const label = cat === "all" ? "All" : cat;
            return (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-spring ${
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Book grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
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
          <p className="text-lg text-muted-foreground">No books found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
