import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import type { BookDisplay } from "../../contracts/blog";
import BookCard from "@/components/BookCard";
import EmptyState from "@/components/EmptyState";
import { toast } from "sonner";
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

const PRICE_OPTIONS = [
  { value: "all", label: "All prices" },
  { value: "under5000", label: "Under ₦5,000" },
  { value: "5000to10000", label: "₦5,000 - ₦10,000" },
  { value: "10000to20000", label: "₦10,000 - ₦20,000" },
  { value: "over20000", label: "Over ₦20,000" },
];

type SortOption = "newest" | "price-asc" | "price-desc" | "title-asc";

export default function BookList({ books }: BookListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("category") || "all";
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const utils = trpc.useUtils();
  const { data: wishlistRows } = trpc.wishlistItems.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const wishlistedIds = useMemo(
    () => new Set((wishlistRows ?? []).map((item) => item.bookId)),
    [wishlistRows]
  );

  const addWishlist = trpc.wishlistItems.add.useMutation({
    onSuccess: () => {
      utils.wishlistItems.list.invalidate();
      utils.wishlistItems.check.invalidate();
      toast.success("Saved to wishlist");
    },
  });

  const removeWishlist = trpc.wishlistItems.remove.useMutation({
    onSuccess: () => {
      utils.wishlistItems.list.invalidate();
      utils.wishlistItems.check.invalidate();
      toast.success("Removed from wishlist");
    },
  });

  const toggleWishlist = (bookId: number) => {
    if (wishlistedIds.has(bookId)) {
      removeWishlist.mutate({ bookId });
    } else {
      addWishlist.mutate({ bookId });
    }
  };

  const selectCategory = (cat: string) => {
    setSearchParams(
      (prev) => {
        if (cat === "all") prev.delete("category");
        else prev.set("category", cat);
        return prev;
      },
      { replace: true }
    );
  };

  const categories = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          books
            .map((b) => (b.category || "").trim())
            .filter(Boolean)
        )
      ),
    ],
    [books]
  );

  const filteredBooks = useMemo(() => {
    const filtered = books.filter((b) => {
      if (
        filter !== "all" &&
        b.category.toLowerCase() !== filter.toLowerCase()
      ) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !b.title.toLowerCase().includes(q) &&
          !b.author.toLowerCase().includes(q) &&
          !b.category.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (priceRange !== "all") {
        const price = Number(String(b.price).replace(/[^0-9.]/g, "")) || 0;
        if (priceRange === "under5000" && price >= 5000) return false;
        if (priceRange === "5000to10000" && (price < 5000 || price > 10000))
          return false;
        if (priceRange === "10000to20000" && (price < 10000 || price > 20000))
          return false;
        if (priceRange === "over20000" && price <= 20000) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-asc") {
        return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      }
      if (sortBy === "price-desc") {
        return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      }
      if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      }
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
      return timeB - timeA;
    });
  }, [books, filter, search, priceRange, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setPriceRange("all");
    selectCategory("all");
  };

  const hasActiveFilters =
    filter !== "all" || search.trim() !== "" || priceRange !== "all";
  const activeFilterCount =
    (filter !== "all" ? 1 : 0) + (priceRange !== "all" ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-8 pb-12">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            Catalog
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            <span className="tnum font-medium text-foreground">
              {filteredBooks.length}
            </span>{" "}
            {filteredBooks.length === 1 ? "edition available" : "editions available"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate("/add-book")}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <PiPlus className="h-4 w-4" aria-hidden="true" />
              Add book
            </button>
          )}
        </div>
      </div>

      {/* Controls: Search + Sort + Filter Drawer */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <PiMagnifyingGlass
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or genre..."
            aria-label="Search catalog"
            className="w-full h-10 pl-10 pr-9 rounded-full border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <PiX className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <label className="sr-only" htmlFor="catalog-sort">
            Sort books
          </label>
          <select
            id="catalog-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-10 rounded-full border border-input bg-card px-4 text-sm text-foreground focus:outline-none focus:border-foreground cursor-pointer"
          >
            <option value="newest">Newest additions</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="title-asc">Title: A to Z</option>
          </select>

          <Drawer>
            <DrawerTrigger asChild>
              <button
                type="button"
                className="relative h-10 inline-flex items-center gap-2 rounded-full border border-input bg-card px-4 text-sm font-medium text-foreground hover:bg-secondary transition-colors shrink-0"
              >
                <PiSliders className="h-4 w-4" aria-hidden="true" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="h-4 min-w-[16px] px-1 rounded-full bg-signal text-signal-foreground text-[10px] font-mono font-medium flex items-center justify-center tnum">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </DrawerTrigger>

            <DrawerContent>
              <div className="mx-auto w-full max-w-lg">
                <DrawerHeader>
                  <DrawerTitle className="font-serif text-2xl font-medium">
                    Filter editions
                  </DrawerTitle>
                  <DrawerDescription>
                    Narrow the catalog by genre or cover price in naira.
                  </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 pb-6 space-y-6">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-3">
                      Genre
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const active = filter.toLowerCase() === cat.toLowerCase();
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => selectCategory(cat)}
                            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                              active
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-card text-foreground hover:bg-secondary"
                            }`}
                          >
                            {cat === "all" ? "All genres" : cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Cover price
                    </p>
                    <div className="rounded-xl border border-border divide-y divide-border overflow-hidden bg-card">
                      {PRICE_OPTIONS.map((opt) => {
                        const active = priceRange === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setPriceRange(opt.value)}
                            aria-pressed={active}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-secondary/60"
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
                  </div>
                </div>

                <DrawerFooter>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
                    >
                      Reset
                    </button>
                    <DrawerClose asChild>
                      <button
                        type="button"
                        className="flex-[2] rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                      >
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
      </div>

      {/* Category pill bar */}
      {categories.length > 1 && (
        <div
          className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
          role="tablist"
          aria-label="Filter by genre"
        >
          {categories.map((cat) => {
            const active = filter.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "all" ? "All genres" : cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {filter !== "all" && (
            <button
              type="button"
              onClick={() => selectCategory("all")}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              {filter}
              <PiX className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
          {priceRange !== "all" && (
            <button
              type="button"
              onClick={() => setPriceRange("all")}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              {PRICE_OPTIONS.find((o) => o.value === priceRange)?.label}
              <PiX className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Catalog Grid */}
      <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-8 sm:gap-x-6 sm:gap-y-10">
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
            wishlisted={wishlistedIds.has(book.id)}
            onToggleWishlist={toggleWishlist}
            index={idx}
          />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <EmptyState
          icon={<PiBookOpen className="h-5 w-5" aria-hidden="true" />}
          title={books.length === 0 ? "The shelves are quiet" : "No matching editions"}
          body={
            books.length === 0
              ? "No titles are published in the catalog yet. Check back soon as new editions go live."
              : "No books match these filters. Try another search term or clear your active filters."
          }
          actionLabel={hasActiveFilters ? "Clear all filters" : undefined}
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      )}
    </div>
  );
}
