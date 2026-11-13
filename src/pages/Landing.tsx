import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  PiArrowRight,
  PiArrowUpRight,
  PiBookOpen,
  PiCaretLeft,
  PiCaretRight,
  PiCheckCircle,
  PiList,
  PiMoon,
  PiSun,
  PiX,
} from "react-icons/pi";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { bookUrl, authorUrl } from "../../contracts/blog";
import BrandMark from "@/components/BrandMark";
import NotificationsBell from "@/components/NotificationsBell";
import SafeImage from "@/components/SafeImage";
import { Skel } from "@/components/Skeleton";

const GENRE_DIRECTORY = [
  {
    name: "Sci-Fi",
    summary: "Near-future cities, speculative worlds, and deep-space chronicles.",
  },
  {
    name: "Thriller",
    summary: "High-stakes conspiracies, crime narratives, and late-night suspense.",
  },
  {
    name: "Horror",
    summary: "Folklore, haunting architecture, and psychological dread.",
  },
  {
    name: "Fantasy",
    summary: "Mythic kingdoms, spirit ecologies, and original magic systems.",
  },
  {
    name: "Fiction",
    summary: "Literary novels and contemporary character studies.",
  },
  {
    name: "Non-Fiction",
    summary: "Essays, cultural criticism, and investigative reporting.",
  },
];

function formatNaira(price: string) {
  const numeric = Number(String(price).replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) {
    return `₦${numeric.toLocaleString("en-NG")}`;
  }
  return `₦${price}`;
}

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  const { data: featuredBooks, isLoading: featuredLoading } =
    trpc.book.featured.useQuery();
  const { data: catalogBooks, isLoading: catalogLoading } =
    trpc.book.list.useQuery();

  // Header elevation triggered via IntersectionObserver instead of scroll listeners
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Featured carousel state
  const highlightList = useMemo(() => {
    if (featuredBooks && featuredBooks.length > 0) return featuredBooks;
    if (catalogBooks && catalogBooks.length > 0) return catalogBooks.slice(0, 4);
    return [];
  }, [featuredBooks, catalogBooks]);

  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = highlightList.length;
  const activeIdx = count === 0 ? 0 : featuredIdx % count;
  const activeBook = highlightList[activeIdx];

  const stepFeatured = useCallback(
    (next: number) => {
      if (count === 0) return;
      setFeaturedIdx(((next % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setFeaturedIdx((i) => (i + 1) % count);
    }, 8000);
    return () => window.clearInterval(id);
  }, [count, paused]);

  const heroCovers = useMemo(() => {
    const source =
      catalogBooks && catalogBooks.length > 0 ? catalogBooks : highlightList;
    return source.slice(0, 2);
  }, [catalogBooks, highlightList]);

  const genreCounts = useMemo(() => {
    const counts = new Map<string, number>();
    (catalogBooks ?? []).forEach((book) => {
      const cat = (book.category || "").trim().toLowerCase();
      if (cat) counts.set(cat, (counts.get(cat) ?? 0) + 1);
    });
    return counts;
  }, [catalogBooks]);

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div ref={topSentinelRef} className="h-px w-full pointer-events-none" aria-hidden="true" />

      {/* ── Header (single row <= 68px) ───────────────────────────── */}
      <header
        className={`sticky top-0 z-40 h-[64px] transition-colors duration-200 ${
          scrolled
            ? "bg-background/92 backdrop-blur-md border-b border-border"
            : "bg-background/70 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        <div className="mx-auto max-w-6xl h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <BrandMark to="/" />

            <nav
              aria-label="Primary"
              className="hidden md:flex items-center gap-6 text-[14px] font-medium text-muted-foreground"
            >
              <Link
                to="/home"
                className="hover:text-foreground transition-colors whitespace-nowrap"
              >
                Catalog
              </Link>
              <a
                href="#genres"
                className="hover:text-foreground transition-colors whitespace-nowrap"
              >
                Genres
              </a>
              <Link
                to="/submit-book"
                className="hover:text-foreground transition-colors whitespace-nowrap"
              >
                Publish
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <NotificationsBell />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              className="h-9 w-9 rounded-full border border-border bg-card/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
            >
              {theme === "dark" ? (
                <PiSun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <PiMoon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2.5">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-purchases"
                    className="px-4 py-2 rounded-full border border-border bg-card text-[13.5px] font-medium text-foreground hover:bg-secondary transition-colors whitespace-nowrap"
                  >
                    Library
                  </Link>
                  <Link
                    to={isAdmin ? "/admin" : "/profile"}
                    className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-[13.5px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    {isAdmin ? "Admin" : "Account"}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-[13.5px] font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/home"
                    className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-[13.5px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    Browse books
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="md:hidden h-9 w-9 rounded-full border border-border bg-card flex items-center justify-center text-foreground"
            >
              {mobileMenuOpen ? (
                <PiX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <PiList className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-2 shadow-soft-lg">
            <Link
              to="/home"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-foreground"
            >
              Browse catalog
            </Link>
            <a
              href="#genres"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-foreground"
            >
              Genres
            </a>
            <Link
              to="/submit-book"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-foreground"
            >
              Submit a manuscript
            </Link>
            <div className="pt-2 border-t border-border flex items-center gap-2.5">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-purchases"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full border border-border text-sm font-medium"
                  >
                    My library
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium"
                  >
                    Account
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full border border-border text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/home"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium"
                  >
                    Browse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1">
        {/* ── 1. Hero (Asymmetric Bookshop Spread) ───────────────── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="text-xs font-medium tracking-wide text-signal uppercase">
                Independent speculative press
              </p>

              <h1 className="font-serif text-[38px] sm:text-[50px] lg:text-[56px] font-medium leading-[1.06] tracking-[-0.03em] text-foreground text-balance">
                African science fiction, horror, and thrillers built for late nights.
              </h1>

              <p className="text-base sm:text-[17px] text-muted-foreground leading-relaxed max-w-[46ch] text-pretty">
                Discover original novels and novellas directly from independent writers. Buy securely in naira, read in the browser edition, or listen with built-in narration.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/home"
                  className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Browse catalog
                  <PiArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  to="/submit-book"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card text-foreground px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Submit a manuscript
                </Link>
              </div>
            </div>

            {/* Live Book Showcase (no AI placeholders) */}
            <div className="lg:col-span-6">
              {catalogLoading && featuredLoading ? (
                <div className="grid grid-cols-2 gap-5 sm:gap-7 max-w-lg lg:ml-auto">
                  <Skel className="aspect-[2/3] w-full !rounded-sm" />
                  <Skel className="aspect-[2/3] w-full !rounded-sm sm:mt-8" />
                </div>
              ) : heroCovers.length > 0 ? (
                <div className="grid grid-cols-2 gap-5 sm:gap-7 max-w-lg lg:ml-auto">
                  {heroCovers.map((book, idx) => (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => navigate(bookUrl(book))}
                      className={`group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm ${
                        idx === 1 ? "sm:mt-8" : ""
                      }`}
                    >
                      <div className="aspect-[2/3] w-full rounded-sm overflow-hidden bg-secondary cover-frame shadow-soft-lg transition-transform duration-300 ease-spring group-hover:-translate-y-1">
                        <SafeImage
                          src={book.coverImage}
                          alt={`${book.title} by ${book.author}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-3 space-y-0.5">
                        <p className="font-serif text-[16px] font-medium text-foreground leading-snug line-clamp-1 group-hover:text-signal transition-colors">
                          {book.title}
                        </p>
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="truncate">{book.author}</span>
                          <span className="font-mono tnum text-foreground font-medium shrink-0">
                            {formatNaira(book.price)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden max-w-lg lg:ml-auto cover-frame">
                  <img
                    src="/images/press-desk.jpg"
                    alt="Independent literary press table with open book and manuscript pages"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. New & Notable Featured Edition ──────────────────── */}
        {(featuredLoading || activeBook) && (
          <section
            aria-label="Featured edition"
            className="border-y border-border bg-secondary/45"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
              <div className="flex items-center justify-between gap-4 mb-8">
                <h2 className="text-sm font-medium text-muted-foreground tracking-wide">
                  Featured edition
                </h2>
                {count > 1 && (
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground tnum">
                      {activeIdx + 1} / {count}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => stepFeatured(activeIdx - 1)}
                        aria-label="Previous featured edition"
                        className="h-9 w-9 rounded-full border border-border bg-card flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                      >
                        <PiCaretLeft className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => stepFeatured(activeIdx + 1)}
                        aria-label="Next featured edition"
                        className="h-9 w-9 rounded-full border border-border bg-card flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                      >
                        <PiCaretRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {featuredLoading && !activeBook ? (
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-center">
                  <Skel className="aspect-[2/3] w-full max-w-[280px] !rounded-sm" />
                  <div className="space-y-4">
                    <Skel className="h-4 w-24" />
                    <Skel className="h-10 w-3/4" />
                    <Skel className="h-4 w-40" />
                    <Skel className="h-16 w-full max-w-xl" />
                  </div>
                </div>
              ) : activeBook ? (
                <div
                  className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] gap-8 lg:gap-14 items-center"
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                >
                  <button
                    type="button"
                    onClick={() => navigate(bookUrl(activeBook))}
                    className="group w-full max-w-[260px] md:max-w-none aspect-[2/3] rounded-sm overflow-hidden bg-secondary cover-frame shadow-soft-lg transition-transform duration-300 ease-spring hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <SafeImage
                      src={activeBook.coverImage}
                      alt={`${activeBook.title} cover`}
                      className="h-full w-full object-cover"
                    />
                  </button>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-signal mb-2">
                      {activeBook.category || "Speculative Edition"}
                    </p>

                    <h3 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-medium leading-[1.1] tracking-tight text-foreground text-balance">
                      {activeBook.title}
                    </h3>

                    <p className="mt-2.5 text-sm text-muted-foreground">
                      By{" "}
                      <button
                        type="button"
                        onClick={() => navigate(authorUrl(activeBook))}
                        className="text-foreground font-medium underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
                      >
                        {activeBook.author}
                      </button>
                    </p>

                    <p className="mt-5 text-[15.5px] text-muted-foreground leading-relaxed max-w-[58ch] line-clamp-4 text-pretty">
                      {activeBook.description}
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-4">
                      <span className="font-mono text-xl font-medium text-foreground tnum">
                        {formatNaira(activeBook.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(bookUrl(activeBook))}
                        className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        <PiBookOpen className="h-4 w-4" aria-hidden="true" />
                        Read edition
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* ── 3. Genre Directory ──────────────────────────────────── */}
        <section
          id="genres"
          className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-border">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
                Browse by genre
              </h2>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-lg text-pretty">
                Filter the press catalog by shelf and discover writers across speculative traditions.
              </p>
            </div>
            <Link
              to="/home"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-signal transition-colors shrink-0"
            >
              View full catalog
              <PiArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:gap-5 pt-8">
            {GENRE_DIRECTORY.map((genre) => {
              const titleCount =
                genreCounts.get(genre.name.toLowerCase()) ?? 0;
              return (
                <Link
                  key={genre.name}
                  to={`/home?category=${encodeURIComponent(genre.name)}`}
                  className="group flex flex-col justify-between rounded-xl border border-transparent sm:border-border sm:bg-card p-5 sm:hover:border-foreground/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-xl font-medium text-foreground group-hover:text-signal transition-colors">
                        {genre.name}
                      </h3>
                      <PiArrowUpRight
                        className="h-4 w-4 text-muted-foreground group-hover:text-signal transition-colors"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty">
                      {genre.summary}
                    </p>
                  </div>

                  {titleCount > 0 && (
                    <p className="mt-4 font-mono text-xs text-muted-foreground tnum">
                      {titleCount} {titleCount === 1 ? "edition" : "editions"}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── 4. Independent Publishing (For Authors) ─────────────── */}
        <section className="border-t border-border bg-secondary/35">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-6">
                <div className="rounded-xl overflow-hidden bg-secondary cover-frame shadow-soft">
                  <img
                    src="/images/press-desk.jpg"
                    alt="Open hardcover book, cream manuscript stack, and fountain pen on an editorial desk"
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <p className="text-xs font-medium tracking-wide text-signal uppercase">
                  For independent authors
                </p>

                <h2 className="font-serif text-3xl sm:text-4xl font-medium leading-[1.12] tracking-tight text-foreground text-balance">
                  Publish your book without waiting on gatekeepers.
                </h2>

                <p className="text-[15.5px] text-muted-foreground leading-relaxed max-w-[52ch] text-pretty">
                  Submit a completed manuscript, set your own cover price in naira, and reach readers in a fast, distraction-free browser edition.
                </p>

                <ul className="space-y-3 pt-1">
                  {[
                    "Import text directly from .docx and .txt manuscripts or paste chapters cleanly.",
                    "Every edition includes an instant sample preview and built-in read-aloud narration.",
                    "Direct checkout powered by Paystack with real-time purchase tracking in your dashboard.",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-foreground/90 leading-relaxed"
                    >
                      <PiCheckCircle
                        className="h-4 w-4 text-signal shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/submit-book"
                    className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Submit a book
                    <PiArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/seller"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    Author dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-border">
            <div className="md:col-span-5 space-y-3">
              <BrandMark to="/" />
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                An independent speculative press and digital bookshop publishing African science fiction, horror, and thrillers.
              </p>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <h3 className="font-medium text-foreground mb-3">Bookshop</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <Link to="/home" className="hover:text-foreground transition-colors">
                      Full catalog
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-purchases" className="hover:text-foreground transition-colors">
                      My library
                    </Link>
                  </li>
                  <li>
                    <Link to="/wishlist" className="hover:text-foreground transition-colors">
                      Saved books
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-3">Authors</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <Link to="/submit-book" className="hover:text-foreground transition-colors">
                      Submit a book
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-submissions" className="hover:text-foreground transition-colors">
                      My submissions
                    </Link>
                  </li>
                  <li>
                    <Link to="/seller" className="hover:text-foreground transition-colors">
                      Sales dashboard
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-3">Account</h3>
                <ul className="space-y-2 text-muted-foreground">
                  {isAuthenticated ? (
                    <>
                      <li>
                        <Link to="/profile" className="hover:text-foreground transition-colors">
                          Profile settings
                        </Link>
                      </li>
                      {isAdmin && (
                        <li>
                          <Link to="/admin" className="hover:text-foreground transition-colors">
                            Admin panel
                          </Link>
                        </li>
                      )}
                    </>
                  ) : (
                    <>
                      <li>
                        <Link to="/login" className="hover:text-foreground transition-colors">
                          Sign in
                        </Link>
                      </li>
                      <li>
                        <Link to="/register" className="hover:text-foreground transition-colors">
                          Create account
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ToxicReads Press.</p>
            <p>Digital editions &amp; audio reading in naira.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
