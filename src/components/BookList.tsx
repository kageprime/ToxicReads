import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import type { BookDisplay } from "../../contracts/blog";
import { bookUrl } from "../../contracts/blog";
import ShaderCanvas from "@/components/ShaderCanvas";
import BookCard from "@/components/BookCard";
import EmptyState from "@/components/EmptyState";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  PiMagnifyingGlass,
  PiPlus,
  PiSliders,
  PiX,
  PiBookOpen,
} from "react-icons/pi";

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

  const resetFilters = () => {
    setSearch("");
    setPriceRange("all");
    selectCategory("all");
  };

  const hasActiveFilters =
    filter !== "all" || search !== "" || priceRange !== "all";

  const activeFilterCount =
    (filter !== "all" ? 1 : 0) + (priceRange !== "all" ? 1 : 0);

  // Fresh covers for the 3D shelf. Falls back to house covers pre-seed.
  const fan: { id: number; title: string; author: string; cover: string; link: string }[] =
    books.length > 0
      ? books.slice(0, 3).map(b => ({
          id: b.id,
          title: b.title,
          author: b.author,
          cover: b.coverImage,
          link: bookUrl(b),
        }))
      : [
          {
            id: -1,
            title: "Staff pick",
            author: "ToxicReads",
            cover: "/images/blog-1.jpg",
            link: "/home",
          },
          {
            id: -2,
            title: "Staff pick",
            author: "ToxicReads",
            cover: "/images/blog-2.jpg",
            link: "/home",
          },
          {
            id: -3,
            title: "Staff pick",
            author: "ToxicReads",
            cover: "/images/blog-3.jpg",
            link: "/home",
          },
        ];

  return (
    <div className="px-4 pb-28 pt-4 sm:px-6 md:px-10 md:pt-8">
      {/* Section header — one responsive block */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-baobab">
            Browse books
          </h1>
          <p className="tnum mt-1 text-sm text-muted-foreground">
            {books.length} {books.length === 1 ? "book" : "books"} available
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/add-book")}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <PiPlus size={16} /> Add book
          </button>
        )}
      </div>

      {/* Dark showcase hero — fixed art direction, all viewports */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0e15]">
        <div className="relative">
          <ShaderCanvas forceDark />
          {/* Night gradient + vignette over the smoke */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(100deg, rgba(13,14,21,0.92) 20%, rgba(13,14,21,0.55) 55%, rgba(13,14,21,0.25) 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
            aria-hidden="true"
            style={{ background: "rgba(192,160,64,0.16)" }}
          />
          <div className="relative grid items-center gap-6 p-5 sm:p-6 md:grid-cols-[1.05fr_0.95fr] md:p-8">
            {/* Copy */}
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#f2ede3]/75">
                <img
                  src="/images/hero-bg.png"
                  alt=""
                  className="h-5 w-5 rounded-full border border-white/20 object-cover"
                />
                The library is open
              </p>
              <h2 className="text-balance mt-4 font-display text-3xl leading-[1.0] tracking-tight text-[#f2ede3] md:text-5xl">
                Find the book that{" "}
                <em className="italic text-[#c0a040]">keeps you up.</em>
              </h2>
              <p className="text-pretty mt-4 max-w-md leading-relaxed text-[#f2ede3]/70">
                Sci-fi, horror and thrillers from the continent's boldest
                writers — priced in naira, ready tonight.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {["Sci-Fi", "Horror", "Thriller"].map(genre => (
                  <button
                    key={genre}
                    onClick={() => selectCategory(genre)}
                    className={`rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-all duration-200 active:scale-[0.96] ${
                      filter === genre
                        ? "border-[#c0a040] bg-[#c0a040] text-[#1a1408]"
                        : "border-white/25 text-[#f2ede3]/85 hover:border-white/60 hover:text-white"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D shelf */}
            <div
              className="relative hidden h-[220px] select-none sm:block md:h-[250px]"
              style={{ perspective: "1100px" }}
              aria-label="Featured covers"
            >
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                aria-hidden="true"
                style={{ background: "rgba(192,160,64,0.22)" }}
              />
              {/* House emblem behind the shelf */}
              <div className="absolute left-1/2 top-1/2 w-[64%] max-w-[280px] -translate-x-1/2 -translate-y-1/2">
                <img
                  src="/images/hero-bg.png"
                  alt="ToxicReads golden mask emblem"
                  className="w-full animate-ambient-drift rounded-2xl border border-white/15 object-cover opacity-90 shadow-soft-lg"
                  style={{ animationDelay: "0.6s" }}
                  loading="eager"
                />
              </div>
              {fan.map((b, i) => (
                <div
                  key={`${b.id}-${i}`}
                  className="absolute top-1/2 w-28 lg:w-36"
                  style={{
                    left: `${8 + i * 27}%`,
                    transform: `translateY(-50%) rotateY(-18deg) rotate(${i === 1 ? 0 : i === 0 ? -7 : 7}deg) translateY(${i === 1 ? -14 : 10}px)`,
                    zIndex: i === 1 ? 2 : 1,
                  }}
                >
                  <button
                    onClick={() => navigate(b.link)}
                    aria-label={`${b.title} by ${b.author}`}
                    className="block w-full animate-ambient-drift overflow-hidden rounded-md border border-white/20 bg-[#171a26] shadow-soft-lg transition-[border-color,filter] duration-300 hover:z-10 hover:border-[#c0a040]/60 hover:brightness-110"
                    style={{ animationDelay: `${i * 1.1}s` }}
                  >
                    <img
                      src={b.cover}
                      alt={`Cover of ${b.title} by ${b.author}`}
                      className="aspect-[3/4] w-full object-cover"
                      loading="eager"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search + filters (bottom-sheet pattern) */}
      <div className="mb-5 flex gap-3">
        <div className="relative min-w-0 flex-1">
          <PiMagnifyingGlass
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title or author…"
            aria-label="Search by title or author"
            className="w-full py-2.5 pl-10 pr-10 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <PiX size={14} />
            </button>
          )}
        </div>
        <Drawer>
          <DrawerTrigger asChild>
            <button className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent active:scale-[0.96]">
              <PiSliders size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="tnum grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 font-mono text-[11px] text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-lg">
              <DrawerHeader>
                <DrawerTitle>Filters</DrawerTitle>
                <DrawerDescription>
                  Narrow the shelf by genre and price.
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-6 overflow-y-auto px-4 pb-2">
                <section aria-label="Categories">
                  <p className="field-label mb-2.5">Genre</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
                      const active = filter === cat;
                      const label = cat === "all" ? "All" : cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => selectCategory(cat)}
                          aria-pressed={active}
                          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.96] ${
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
                </section>
                <section aria-label="Price">
                  <p className="field-label mb-2.5">Price</p>
                  <div className="divide-y divide-border rounded-xl border border-border">
                    {priceOptions.map(opt => {
                      const active = priceRange === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setPriceRange(opt.value)}
                          aria-pressed={active}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent"
                        >
                          <span
                            className={`grid h-4 w-4 place-items-center rounded-full border transition-colors ${
                              active ? "border-foreground" : "border-muted-foreground"
                            }`}
                          >
                            {active && (
                              <span className="h-2 w-2 rounded-full bg-foreground" />
                            )}
                          </span>
                          <span
                            className={
                              active
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
              <DrawerFooter>
                <div className="flex gap-2">
                  <button
                    onClick={resetFilters}
                    className="flex-1 rounded-full border border-border py-3 text-sm font-medium transition-colors hover:bg-accent active:scale-[0.98]"
                  >
                    Reset
                  </button>
                  <DrawerClose asChild>
                    <button className="flex-[2] rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-[0.98]">
                      Show {filteredBooks.length}{" "}
                      {filteredBooks.length === 1 ? "book" : "books"}
                    </button>
                  </DrawerClose>
                </div>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {filter !== "all" && (
            <button
              onClick={() => selectCategory("all")}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
            >
              {filter} <PiX size={12} />
            </button>
          )}
          {priceRange !== "all" && (
            <button
              onClick={() => setPriceRange("all")}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
            >
              {priceOptions.find(o => o.value === priceRange)?.label}{" "}
              <PiX size={12} />
            </button>
          )}
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}

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
            slug={book.slug}
            authorSlug={book.authorSlug}
            createdAt={book.createdAt}
            index={idx}
          />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <EmptyState
          icon={<PiBookOpen size={24} />}
          image="/images/terrazites-hero.jpeg"
          imageAlt="Cover of The Terrazites of Akarfia"
          title={books.length === 0 ? "The shelves are empty" : "No matches"}
          body={
            books.length === 0
              ? "No books are live yet. Check back soon — new stories land here first."
              : "Nothing matches this combination. Loosen a filter or two."
          }
          actionLabel={hasActiveFilters ? "Clear all filters" : undefined}
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      )}
    </div>
  );
}
