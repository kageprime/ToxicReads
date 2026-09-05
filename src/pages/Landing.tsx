import { useState, useEffect, useRef, useCallback } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { bookUrl, authorUrl } from "../../contracts/blog";
import { Skel } from "@/components/Skeleton";
import NotificationsBell from "@/components/NotificationsBell";
import {
  PiList,
  PiX,
  PiUpload,
  PiBookOpen,
  PiArrowRight,
  PiCaretLeft,
  PiCaretRight,
  PiSun,
  PiMoon,
} from "react-icons/pi";

/* -- Genre data ---------------------------------------- */
const GENRES = [
  { name: "Sci-Fi", blurb: "Future worlds, alien skies" },
  { name: "Horror", blurb: "The things in the dark" },
  { name: "Thriller", blurb: "Pulse-pounding suspense" },
  { name: "Fantasy", blurb: "Magic rooted in myth" },
  { name: "Fiction", blurb: "Stories that linger" },
  { name: "Non-Fiction", blurb: "Truth, sharper than fiction" },
];

/* -- Scroll Reveal Hook ---------------------------------- */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add("active");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* -- Warning mark ---------------------------------------- */
function WarningTriangle({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3 22 20H2L12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1.2" fill="currentColor" />
    </svg>
  );
}

/* -- Upload Modal ---------------------------------------- */
function UploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 mt-[4vh] md:mt-[6vh] max-w-[640px] md:mx-auto bg-[#12141c] rounded-2xl border border-white/10 shadow-soft-lg p-5 md:p-8 max-h-[92vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-9 h-9 grid place-items-center rounded-full text-[#f2efe6]/70 hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <PiX size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#c0a040] text-[#141005] grid place-items-center">
            <PiUpload size={20} />
          </div>
          <div>
            <h3 className="font-serif text-xl md:text-2xl text-[#f2efe6]">Upload your book</h3>
            <p className="text-sm text-[#f2efe6]/60 -mt-0.5">
              Takes three minutes. We review within 24 hours.
            </p>
          </div>
        </div>
        <form
          className="mt-6 space-y-4"
          onSubmit={e => {
            e.preventDefault();
            onClose();
          }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.05em] text-[#f2efe6]/60">
                Book title
              </label>
              <input
                required
                placeholder="e.g., Salt and Rain"
                className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-transparent text-[#f2efe6] placeholder:text-[#f2efe6]/30 focus:outline-none focus:ring-2 focus:ring-[#c0a040]/50 text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.05em] text-[#f2efe6]/60">
                Author / pen name
              </label>
              <input
                required
                placeholder="Your name"
                className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-transparent text-[#f2efe6] placeholder:text-[#f2efe6]/30 focus:outline-none focus:ring-2 focus:ring-[#c0a040]/50 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.05em] text-[#f2efe6]/60">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="What is your story about? Two or three sentences."
              className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-transparent text-[#f2efe6] placeholder:text-[#f2efe6]/30 focus:outline-none focus:ring-2 focus:ring-[#c0a040]/50 text-sm"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.05em] text-[#f2efe6]/60">
                Price (₦)
              </label>
              <input
                type="number"
                min="500"
                placeholder="2500"
                className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-transparent text-[#f2efe6] placeholder:text-[#f2efe6]/30 text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.05em] text-[#f2efe6]/60">
                Genre
              </label>
              <select className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#12141c] text-[#f2efe6] text-sm">
                <option>Sci-Fi</option>
                <option>Horror</option>
                <option>Thriller</option>
              </select>
            </div>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm leading-snug text-[#f2efe6]/60">
              By uploading, you confirm you own the rights. Admin reviews within
              24 hours.
            </p>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#c0a040] text-[#141005] text-sm font-medium hover:opacity-90 active:scale-[0.96] transition whitespace-nowrap"
            >
              Submit for review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -- Brand mark ------------------------------------------ */
function BrandMark({ onClick, compact }: { onClick?: () => void; compact?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 group"
      aria-label="ToxicReads home"
    >
      <img
        src="/images/hero-bg.png"
        alt="ToxicReads"
        className={`rounded-lg object-cover border border-white/15 ${compact ? "w-8 h-8" : "w-9 h-9"}`}
      />
      <span
        className={`font-serif tracking-tight leading-none text-[#f2efe6] ${
          compact ? "text-xl" : "text-2xl"
        }`}
      >
        Toxic<span className="text-[#c0a040]">Reads</span>
      </span>
    </button>
  );
}

/* -- Header ---------------------------------------------- */
function Header({ scrolled }: { scrolled: boolean }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  const dashboardPath = isAdmin ? "/admin" : "/home";

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const links = [
    { label: "Home", href: "/" },
    { label: "Browse", href: "/home" },
    { label: "Genres", href: "#genres" },
    { label: "Why us", href: "#why" },
    { label: "Upload", action: () => navigate("/submit-book") },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-spring ${
          scrolled
            ? "bg-[#0b0c12]/95 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] md:h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <BrandMark onClick={() => navigate("/")} compact />
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="hidden md:flex items-center gap-7 text-sm text-[#f2efe6]/65 mr-4">
              <a href="/" className="hover:text-[#f2efe6] transition-colors">
                Home
              </a>
              <a href="/home" className="hover:text-[#f2efe6] transition-colors">
                Browse
              </a>
              <button
                onClick={() => navigate("/submit-book")}
                className="hover:text-[#f2efe6] transition-colors text-left"
              >
                Upload
              </button>
              <a href="#genres" className="hover:text-[#f2efe6] transition-colors">
                Genres
              </a>
              <a href="#why" className="hover:text-[#f2efe6] transition-colors">
                Why us
              </a>
            </div>
            <div className="text-[#f2efe6]/80">
              <NotificationsBell />
            </div>
            <button
              onClick={toggleTheme}
              className="hidden sm:flex p-2.5 rounded-full text-[#f2efe6]/80 hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <PiMoon size={20} /> : <PiSun size={20} />}
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => navigate(dashboardPath)}
                className="hidden sm:inline-flex px-4 py-2 rounded-full bg-[#c0a040] text-[#141005] text-sm font-medium hover:opacity-90 active:scale-[0.96] transition"
              >
                Dashboard
              </button>
            ) : (
              <a
                href="/login"
                className="hidden sm:inline-flex px-4 py-2 rounded-full border border-white/25 text-[#f2efe6] text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Login
              </a>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 grid place-items-center rounded-full border border-white/25 text-[#f2efe6] hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <PiX size={20} /> : <PiList size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile slide-in menu */}
      <div
        className={`fixed inset-0 z-30 md:hidden transition-opacity duration-500 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute top-[60px] right-0 bottom-0 w-[min(320px,85vw)] bg-[#101218] border-l border-white/10 shadow-soft-lg flex flex-col transition-transform duration-500 ease-spring ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-1">
              {links.map((link, i) => (
                <div
                  key={link.label}
                  className="reveal"
                  style={{ transitionDelay: mobileOpen ? `${i * 50}ms` : "0ms" }}
                >
                  {link.href ? (
                    <a
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 text-lg font-serif text-[#f2efe6] hover:text-[#c0a040] transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        link.action?.();
                        setMobileOpen(false);
                      }}
                      className="block w-full text-left py-3 text-lg font-serif text-[#f2efe6] hover:text-[#c0a040] transition-colors"
                    >
                      {link.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 border-t border-white/10 space-y-3">
            <div className="flex justify-center text-[#f2efe6]/80">
              <NotificationsBell />
            </div>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  navigate(dashboardPath);
                  setMobileOpen(false);
                }}
                className="w-full py-3 rounded-full bg-[#c0a040] text-[#141005] text-sm font-medium hover:opacity-90 active:scale-[0.96] transition"
              >
                Dashboard
              </button>
            ) : (
              <a
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full py-3 text-center rounded-full bg-[#c0a040] text-[#141005] text-sm font-medium hover:opacity-90 transition"
              >
                Login
              </a>
            )}
            <button
              onClick={() => {
                toggleTheme();
                setMobileOpen(false);
              }}
              className="w-full py-3 rounded-full border border-white/25 text-[#f2efe6] text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              {theme === "light" ? <PiMoon size={18} /> : <PiSun size={18} />}
              Switch to {theme === "light" ? "dark" : "light"} mode
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* -- Hero: read something toxic -------------------------- */
const FAN_COVERS = [
  {
    src: "/images/terrazites-hero.jpeg",
    alt: "Cover of The Terrazites of Akarfia by Felix Obekpa",
    tilt: "rotate-[-7deg]",
    tag: "Sample 001",
  },
  {
    src: "/images/blog-1.jpg",
    alt: "Featured book cover",
    tilt: "rotate-[3deg]",
    tag: "Sample 002",
  },
  {
    src: "/images/blog-2.jpg",
    alt: "Featured book cover",
    tilt: "rotate-[9deg]",
    tag: "Sample 003",
  },
];

function HeroToxic({ onUpload }: { onUpload: () => void }) {
  const navigate = useNavigate();
  return (
    <section className="toxic-bg relative overflow-hidden" aria-label="Warning">
      {/* Contamination glow */}
      <div
        className="pointer-events-none absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full blur-3xl"
        aria-hidden="true"
        style={{ background: "rgba(192,160,64,0.09)" }}
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6 md:pb-24 md:pt-20 lg:px-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#c0a040]/40 bg-[#c0a040]/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#c0a040]">
          <WarningTriangle size={13} />
          Warning: highly addictive fiction
        </p>

        <h1 className="mt-6 font-display text-[clamp(3.4rem,11vw,8.5rem)] leading-[0.92] tracking-tight text-[#f2efe6]">
          <span className="rise-mask">
            <span>Read something</span>
          </span>
          <span className="rise-mask">
            <span style={{ animationDelay: "100ms" }}>
              <em className="italic text-[#c0a040]">TOXIC.</em>
            </span>
          </span>
        </h1>

        <div className="mt-8 grid items-end gap-10 md:mt-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="rise-mask max-w-md">
            <span style={{ animationDelay: "220ms" }}>
              <p className="text-pretty text-base leading-relaxed text-[#f2efe6]/70 md:text-lg">
                African sci-fi, horror and thrillers from the continent's
                boldest writers. Priced in naira. No antidote included.
              </p>
              <span className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/home")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c0a040] px-7 py-3.5 font-medium text-[#141005] transition hover:opacity-90 active:scale-[0.96]"
                >
                  <PiBookOpen size={18} /> Enter the library
                </button>
                <button
                  onClick={onUpload}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3.5 font-medium text-[#f2efe6] transition-colors hover:bg-white/10"
                >
                  Upload your book <PiArrowRight size={16} />
                </button>
              </span>
              <span className="tnum mt-6 block font-mono text-[11px] uppercase tracking-[0.14em] text-[#f2efe6]/40">
                Lagos — Accra — Nairobi
              </span>
            </span>
          </div>

          {/* Live specimens */}
          <div
            className="relative hidden select-none justify-end pr-6 sm:flex"
            aria-label="Featured covers"
          >
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              aria-hidden="true"
              style={{ background: "rgba(192,160,64,0.14)" }}
            />
            {FAN_COVERS.map((cover, i) => (
              <div key={cover.src} className={i > 0 ? "-ml-10 lg:-ml-12" : ""}>
                <button
                  onClick={() => navigate("/home")}
                  aria-label={`Browse books — ${cover.alt}`}
                  className={`block w-36 shrink-0 overflow-hidden rounded-md border border-white/20 bg-[#151824] shadow-soft-lg transition-all duration-500 ease-spring hover:z-10 hover:-translate-y-3 hover:rotate-0 hover:border-[#c0a040]/50 lg:w-44 ${cover.tilt}`}
                >
                  <img
                    src={cover.src}
                    alt={cover.alt}
                    className="aspect-[3/4] w-full object-cover"
                    loading="eager"
                  />
                </button>
                <p className="tnum mt-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[#f2efe6]/40">
                  {cover.tag}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -- Ticker: caution tape -------------------------------- */
const TICKER_ITEMS = [
  "Highly addictive",
  "Side effects include sleepless nights",
  "Do not operate heavy machinery",
  "Overdose encouraged",
  "Keep away from boring books",
];

function Ticker() {
  return (
    <div
      className="overflow-hidden border-y border-[#141005] bg-[#c0a040] py-2.5"
      aria-label="Warnings"
    >
      <div className="marquee-track flex w-max items-center gap-8 pr-8">
        {[0, 1].map(half => (
          <div
            key={half}
            className="flex items-center gap-8"
            aria-hidden={half === 1}
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span
                key={`${half}-${i}`}
                className="flex items-center gap-8 whitespace-nowrap font-mono text-xs font-medium uppercase tracking-[0.16em] text-[#141005]"
              >
                {item}
                <WarningTriangle size={12} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -- Active ingredients (genres) ------------------------- */
function IngredientGenres() {
  const navigate = useNavigate();
  return (
    <section id="genres" className="toxic-bg scroll-mt-[60px] md:scroll-mt-[68px]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#c0a040]">
          Active ingredients
        </p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="text-balance font-serif text-3xl tracking-tight text-[#f2efe6] md:text-5xl">
            Pick your poison
          </h2>
          <button
            onClick={() => navigate("/home")}
            className="group inline-flex items-center gap-1.5 self-start text-sm font-medium text-[#f2efe6] hover:underline underline-offset-4 sm:self-auto"
          >
            View the full library
            <PiArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
        <div className="mt-8 border-t border-white/10 md:mt-10">
          {GENRES.map((genre, idx) => (
            <button
              key={genre.name}
              onClick={() => navigate(`/home?category=${encodeURIComponent(genre.name)}`)}
              className="reveal group grid w-full grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b border-white/10 py-5 text-left transition-colors duration-200 hover:bg-white/[0.04] md:gap-8 md:py-6"
              style={{ ["--reveal-delay"]: `${idx * 40}ms` } as CSSProperties}
            >
              <span className="tnum font-mono text-xs text-[#c0a040]">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-3xl tracking-tight text-[#f2efe6] transition-transform duration-300 ease-spring group-hover:translate-x-2 md:text-5xl">
                  {genre.name}
                </span>
                <span className="mt-1 block text-sm text-[#f2efe6]/55">
                  {genre.blurb}
                </span>
              </span>
              <PiArrowRight
                size={20}
                className="self-center text-[#f2efe6]/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#c0a040]"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -- Today's dose (featured carousel) -------------------- */
function DoseFeatured() {
  const navigate = useNavigate();
  const { data: books, isLoading } = trpc.book.featured.useQuery();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const count = books?.length ?? 0;
  const safeIndex = count === 0 ? 0 : index % count;

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  // Gentle rotation. Off for a single slide, on hover/focus/touch, or reduced motion.
  useEffect(() => {
    if (count < 2 || paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const t = setInterval(() => setIndex(i => (i + 1) % count), 7000);
    return () => clearInterval(t);
  }, [count, paused]);

  // Stay in range when the admin edits the lineup.
  useEffect(() => {
    setIndex(i => (count === 0 ? 0 : i % count));
  }, [count]);

  if (!isLoading && count === 0) return null;
  const book = books?.[safeIndex];

  return (
    <section
      className="relative overflow-hidden border-y border-white/10 bg-[#0e1017]"
      aria-label="Featured books"
      aria-roledescription="carousel"
    >
      <div
        className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full blur-3xl"
        aria-hidden="true"
        style={{ background: "rgba(192,160,64,0.07)" }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#c0a040]">
            Today's dose
          </p>
          {count > 1 && (
            <div className="flex items-center gap-3">
              <span
                className="tnum font-mono text-xs text-[#f2efe6]/50"
                aria-live="polite"
              >
                {safeIndex + 1} / {count}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => go(safeIndex - 1)}
                  aria-label="Previous featured book"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-[#f2efe6] transition-colors hover:bg-white/10 active:scale-[0.96]"
                >
                  <PiCaretLeft size={18} />
                </button>
                <button
                  onClick={() => go(safeIndex + 1)}
                  aria-label="Next featured book"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-[#f2efe6] transition-colors hover:bg-white/10 active:scale-[0.96]"
                >
                  <PiCaretRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {isLoading || !book || !books ? (
          <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-12">
            <Skel className="aspect-[3/4] w-full max-w-[340px] !rounded-none" />
            <div>
              <Skel className="mb-3 h-5 w-40" />
              <Skel className="mb-2 h-11 w-11/12" />
              <Skel className="mb-2 h-11 w-2/3" />
              <Skel className="mb-6 h-6 w-48" />
              <Skel className="h-12 w-56 !rounded-full" />
            </div>
          </div>
        ) : (
          <>
            <div
              className="mt-8 overflow-hidden"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              onTouchStart={e => {
                touchX.current = e.touches[0].clientX;
              }}
              onTouchEnd={e => {
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                touchX.current = null;
                if (dx > 40) go(safeIndex - 1);
                else if (dx < -40) go(safeIndex + 1);
              }}
            >
              <div
                className="flex transition-transform duration-500 ease-spring"
                style={{ transform: `translateX(-${safeIndex * 100}%)` }}
              >
                {books.map((b, i) => {
                  const current = b.id === book.id;
                  return (
                    <div
                      key={b.id}
                      className="grid w-full shrink-0 gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-12"
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${i + 1} of ${count}: ${b.title}`}
                    >
                      <button
                        onClick={() => navigate(bookUrl(b))}
                        tabIndex={current ? undefined : -1}
                        className="group relative block w-full max-w-[340px] justify-self-start overflow-hidden rounded-md border border-white/15 bg-[#151824] shadow-soft-lg transition-transform duration-500 ease-spring hover:-translate-y-1.5 hover:border-[#c0a040]/40"
                        aria-label={`Read ${b.title}`}
                      >
                        <img
                          src={b.coverImage}
                          alt={`Cover of ${b.title} by ${b.author}`}
                          className="aspect-[3/4] w-full object-cover"
                        />
                      </button>
                      <div className="min-w-0">
                        <h2 className="text-balance font-display text-4xl leading-[1.02] tracking-tight text-[#f2efe6] md:text-6xl">
                          {b.title}
                        </h2>
                        <p className="mt-3 text-lg text-[#f2efe6]/60">
                          by{" "}
                          <button
                            onClick={() => navigate(authorUrl(b))}
                            tabIndex={current ? undefined : -1}
                            className="underline underline-offset-[3px] transition-opacity hover:opacity-70"
                          >
                            {b.author}
                          </button>
                        </p>
                        <p className="text-pretty mt-4 line-clamp-3 max-w-xl leading-relaxed text-[#f2efe6]/65">
                          {b.description}
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-4">
                          <span className="tnum font-mono text-2xl text-[#f2efe6]">
                            ₦{b.price}
                          </span>
                          <button
                            onClick={() => navigate(bookUrl(b))}
                            tabIndex={current ? undefined : -1}
                            className="group inline-flex items-center gap-2 rounded-full bg-[#c0a040] px-7 py-3 font-medium text-[#141005] transition hover:opacity-90 active:scale-[0.96]"
                          >
                            Take the dose{" "}
                            <PiArrowRight
                              size={16}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {count > 1 && (
              <div className="mt-8 flex items-center gap-2.5">
                {books.map((b, i) => (
                  <button
                    key={b.id}
                    onClick={() => go(i)}
                    aria-label={`Show ${b.title}`}
                    aria-current={i === safeIndex}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === safeIndex
                        ? "w-8 bg-[#c0a040]"
                        : "w-2 bg-white/25 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* -- Side effects (manifesto + why) ---------------------- */
function SideEffects() {
  const points = [
    {
      title: "Publish in minutes",
      body: "Upload your book and it's queued for review. No agents, no gatekeepers — live in the catalogue the same day.",
    },
    {
      title: "Fair royalties",
      body: "You keep the lion's share. Priced in naira and paid to the writers telling Africa's stories.",
    },
    {
      title: "Read anywhere",
      body: "Buy once, read on any device. Sci-fi, horror and thrillers you won't find on the big shelves.",
    },
  ];
  return (
    <section id="why" className="toxic-bg scroll-mt-[60px] md:scroll-mt-[68px]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <p className="reveal max-w-4xl font-display text-3xl leading-[1.15] tracking-tight text-[#f2efe6] md:text-5xl">
          Side effects include{" "}
          <em className="italic text-[#c0a040]">sleepless nights.</em>
        </p>
        <dl className="mt-10 border-t border-white/10 md:mt-14">
          {points.map((p, i) => (
            <div
              key={p.title}
              className="reveal group grid gap-2 border-b border-white/10 py-7 transition-colors duration-200 hover:bg-white/[0.03] sm:grid-cols-[72px_1fr_1.4fr] sm:items-baseline sm:gap-6 md:py-9"
              style={{ ["--reveal-delay"]: `${i * 70}ms` } as CSSProperties}
            >
              <dt className="tnum font-mono text-sm text-[#c0a040]">
                {String(i + 1).padStart(2, "0")}
              </dt>
              <dt className="font-serif text-2xl tracking-tight text-[#f2efe6] transition-transform duration-300 ease-spring group-hover:translate-x-1 md:text-3xl">
                {p.title}
              </dt>
              <dd className="text-pretty max-w-xl text-sm leading-relaxed text-[#f2efe6]/60 md:text-base">
                {p.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* -- No antidote (CTA + footer) -------------------------- */
function AntidoteCta({ onUpload }: { onUpload: () => void }) {
  const navigate = useNavigate();
  return (
    <section className="toxic-bg relative overflow-hidden" aria-label="No antidote">
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 md:pt-20 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#c0a040]">
              For writers
            </p>
            <h2 className="text-balance mt-3 font-display text-4xl tracking-tight text-[#f2efe6] md:text-6xl">
              No antidote.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#f2efe6]/60 md:text-base">
              Your story could keep someone up tonight. Upload it in minutes —
              our editors review within a day.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <button
              onClick={onUpload}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c0a040] px-7 py-3.5 font-medium text-[#141005] transition hover:opacity-90 active:scale-[0.96]"
            >
              <PiUpload size={18} /> Upload your book
            </button>
            <button
              onClick={() => navigate("/home")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3.5 font-medium text-[#f2efe6] transition-colors hover:bg-white/10"
            >
              Browse first <PiArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToxicFooter() {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <footer className="toxic-bg border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="font-serif text-2xl tracking-tight text-[#f2efe6]"
              aria-label="Back to top"
            >
              Toxic<span className="text-[#c0a040]">Reads</span>
            </button>
            <p className="text-pretty mt-3 max-w-md text-sm leading-relaxed text-[#f2efe6]/55">
              Africa's home for sci-fi, horror, and thrillers. Upload, sell, and
              discover the boldest speculative fiction.
            </p>
            {subscribed ? (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#c0a040]/50 bg-[#c0a040]/10 px-4 py-2.5 text-sm text-[#c0a040]">
                You're on the list. First drop lands soon.
              </p>
            ) : (
              <form
                className="mt-5 flex max-w-md gap-2"
                onSubmit={e => {
                  e.preventDefault();
                  setSubscribed(true);
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="Your email for new releases"
                  aria-label="Email for new releases"
                  className="min-w-0 flex-1 rounded-lg border border-white/20 bg-transparent px-4 py-2.5 text-sm text-[#f2efe6] placeholder:text-[#f2efe6]/35 focus:outline-none focus:ring-2 focus:ring-[#c0a040]/50"
                />
                <button className="whitespace-nowrap rounded-full bg-[#c0a040] px-5 py-2.5 text-sm font-medium text-[#141005] transition hover:opacity-90 active:scale-[0.96]">
                  Subscribe
                </button>
              </form>
            )}
          </div>
          <nav aria-label="Explore">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#f2efe6]/45">
              Explore
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#f2efe6]/65">
              <li>
                <a href="/home" className="transition-colors hover:text-[#f2efe6]">
                  Browse library
                </a>
              </li>
              <li>
                <a href="#genres" className="transition-colors hover:text-[#f2efe6]">
                  Genres
                </a>
              </li>
              <li>
                <a href="/submit-book" className="transition-colors hover:text-[#f2efe6]">
                  Upload
                </a>
              </li>
              <li>
                <a href="#why" className="transition-colors hover:text-[#f2efe6]">
                  Why us
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label="Account">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#f2efe6]/45">
              Account
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#f2efe6]/65">
              <li>
                <a href="/login" className="transition-colors hover:text-[#f2efe6]">
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="transition-colors hover:text-[#f2efe6]">
                  Register
                </a>
              </li>
              <li>
                <a href="/my-purchases" className="transition-colors hover:text-[#f2efe6]">
                  My purchases
                </a>
              </li>
              <li>
                <a href="/my-submissions" className="transition-colors hover:text-[#f2efe6]">
                  My submissions
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="tnum font-mono text-xs text-[#f2efe6]/45">
            © {new Date().getFullYear()} ToxicReads — every story matters.
          </p>
          <p className="text-xs text-[#f2efe6]/45">Built for readers in Lagos, Accra &amp; Nairobi.</p>
        </div>
      </div>
    </footer>
  );
}

/* -- Main ------------------------------------------------ */
export default function Landing() {
  useReveal();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="toxic-bg relative min-h-screen">
      {/* One grain over the whole page for cohesion */}
      <div className="grain pointer-events-none absolute inset-0 z-[5]" aria-hidden="true" />
      <Header scrolled={scrolled} />
      {/* Spacer keeps the warning unbroken under the clear header */}
      <div className="toxic-bg h-[60px] md:h-[68px]" />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <HeroToxic onUpload={() => setUploadOpen(true)} />
      <Ticker />
      <IngredientGenres />
      <DoseFeatured />
      <SideEffects />
      <AntidoteCta onUpload={() => setUploadOpen(true)} />
      <ToxicFooter />
    </div>
  );
}
