import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import {
  PiList,
  PiX,
  PiUpload,
  PiBookOpen,
  PiArrowRight,
  PiCurrencyNgn,
  PiSun,
  PiMoon,
} from "react-icons/pi";

/* -- Genre palette --------------------------------------- */
const CATEGORY_TONE: Record<string, string> = {
  "Sci-Fi": "pastel-blue",
  Horror: "pastel-red",
  Thriller: "pastel-yellow",
  Fiction: "pastel-green",
  Fantasy: "pastel-green",
  "Non-Fiction": "pastel-blue",
};

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

/* -- Upload Modal ---------------------------------------- */
function UploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 mt-[4vh] md:mt-[6vh] max-w-[640px] md:mx-auto bg-card rounded-2xl border border-border shadow-soft-lg p-5 md:p-8 max-h-[92vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-9 h-9 grid place-items-center rounded-full hover:bg-accent transition-colors"
          aria-label="Close"
        >
          <PiX size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <PiUpload size={20} />
          </div>
          <div>
            <h3 className="font-serif text-xl md:text-2xl text-baobab">Upload your book</h3>
            <p className="text-sm text-muted-foreground -mt-0.5">
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
              <label className="text-xs uppercase tracking-[0.05em] text-muted-foreground">
                Book title
              </label>
              <input
                required
                placeholder="e.g., Salt and Rain"
                className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-ring/30 outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.05em] text-muted-foreground">
                Author / pen name
              </label>
              <input
                required
                placeholder="Your name"
                className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-ring/30 outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.05em] text-muted-foreground">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="What is your story about? Two or three sentences."
              className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-ring/30 outline-none text-sm"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.05em] text-muted-foreground">
                Price (₦)
              </label>
              <input
                type="number"
                min="500"
                placeholder="2500"
                className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.05em] text-muted-foreground">
                Genre
              </label>
              <select className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm">
                <option>Sci-Fi</option>
                <option>Horror</option>
                <option>Thriller</option>
              </select>
            </div>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm leading-snug text-muted-foreground">
              By uploading, you confirm you own the rights. Admin reviews within
              24 hours.
            </p>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[#333333] transition whitespace-nowrap"
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
        className={`rounded-lg object-cover border border-border ${compact ? "w-8 h-8" : "w-9 h-9"}`}
      />
      <span
        className={`font-serif tracking-tight text-baobab leading-none ${
          compact ? "text-xl" : "text-2xl"
        }`}
      >
        Toxic<span className="text-muted-foreground">Reads</span>
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
          scrolled ? "bg-background/95 backdrop-blur-xl shadow-soft" : "bg-background"
        } border-b border-border`}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] md:h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <BrandMark onClick={() => navigate("/")} compact />
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground mr-4">
              <a href="/" className="hover:text-foreground transition-colors">
                Home
              </a>
              <a href="/home" className="hover:text-foreground transition-colors">
                Browse
              </a>
              <button
                onClick={() => navigate("/submit-book")}
                className="hover:text-foreground transition-colors text-left"
              >
                Upload
              </button>
              <a href="#genres" className="hover:text-foreground transition-colors">
                Genres
              </a>
              <a href="#why" className="hover:text-foreground transition-colors">
                Why us
              </a>
            </div>
            <button
              onClick={toggleTheme}
              className="hidden sm:flex p-2.5 hover:bg-accent rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <PiMoon size={20} /> : <PiSun size={20} />}
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => navigate(dashboardPath)}
                className="hidden sm:inline-flex px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[#333333] active:scale-[0.98] transition"
              >
                Dashboard
              </button>
            ) : (
              <a
                href="/login"
                className="hidden sm:inline-flex px-4 py-2 rounded-full border border-border hover:bg-accent text-sm font-medium transition-colors"
              >
                Login
              </a>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 grid place-items-center rounded-full border border-border hover:bg-accent transition-colors"
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
          className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute top-[60px] right-0 bottom-0 w-[min(320px,85vw)] bg-background border-l border-border shadow-soft-lg flex flex-col transition-transform duration-500 ease-spring ${
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
                      className="block py-3 text-lg font-serif text-baobab hover:text-muted-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        link.action?.();
                        setMobileOpen(false);
                      }}
                      className="block w-full text-left py-3 text-lg font-serif text-baobab hover:text-muted-foreground transition-colors"
                    >
                      {link.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 border-t border-border space-y-3">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  navigate(dashboardPath);
                  setMobileOpen(false);
                }}
                className="w-full py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[#333333] active:scale-[0.98] transition"
              >
                Dashboard
              </button>
            ) : (
              <a
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full py-3 text-center rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[#333333] transition"
              >
                Login
              </a>
            )}
            <button
              onClick={() => {
                toggleTheme();
                setMobileOpen(false);
              }}
              className="w-full py-3 rounded-full border border-border text-sm font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
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

/* -- Hero ------------------------------------------------ */
function HeroSection({ onUpload }: { onUpload: () => void }) {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[calc(100dvh-60px)] md:min-h-[calc(100dvh-68px)] flex items-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-40 md:opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(circle at 50% 25%, black, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(circle at 50% 25%, black, transparent 78%)",
          }}
        />
        <div className="absolute -top-32 right-[-8%] w-[400px] h-[400px] md:w-[520px] md:h-[520px] rounded-full bg-[radial-gradient(circle,rgba(149,100,0,0.05),transparent_70%)] blur-2xl animate-ambient-drift" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
        <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-10 md:gap-12 items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground border border-border rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-p-green" />
              African speculative fiction
            </span>
            <h1 className="mt-5 md:mt-6 font-display text-[38px] leading-[1.05] sm:text-[52px] md:text-[72px] tracking-tightest text-baobab">
              African sci-fi, horror &amp; thrillers
            </h1>
            <p className="mt-5 text-base md:text-xl leading-relaxed text-muted-foreground max-w-xl">
              The home of African science fiction, horror, and thrillers. Buy,
              sell, and read the boldest speculative writing from the continent.
            </p>
            <div className="mt-8 md:mt-9 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/home")}
                className="group inline-flex items-center justify-center gap-2 px-6 md:px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-[#333333] active:scale-[0.98] transition-all duration-500 ease-spring"
              >
                <PiBookOpen size={18} /> Explore the library
              </button>
              <button
                onClick={onUpload}
                className="inline-flex items-center justify-center gap-2 px-6 md:px-7 py-3.5 rounded-full border border-border font-medium hover:bg-accent transition-all duration-500 ease-spring"
              >
                Upload your book <PiArrowRight size={16} />
              </button>
            </div>
            <div className="mt-8 md:mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["AB", "CO", "EM"].map(init => (
                  <div
                    key={init}
                    className="w-9 h-9 rounded-full border border-border bg-card grid place-items-center text-[10px] font-semibold text-baobab"
                  >
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground font-semibold">340+ authors</strong>{" "}
                from Nigeria, Ghana, Kenya &amp; beyond
              </p>
            </div>
          </div>

          <div className="hidden md:flex justify-center items-center relative">
            <div className="relative w-full max-w-[380px] rounded-2xl overflow-hidden border border-border bg-card shadow-soft">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E2E0DB]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E2E0DB]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E2E0DB]" />
                <span className="ml-2 text-[11px] font-mono text-muted-foreground">
                  reader — toxicreads
                </span>
              </div>
              <img
                src="/images/hero-bg.png"
                alt="ToxicReads reader preview"
                className="w-full h-[300px] lg:h-[340px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -- Browse by genre ------------------------------------ */
function toneClasses(tone: string) {
  return (
    ({
      "pastel-blue": "bg-p-blue text-p-blue-fg",
      "pastel-red": "bg-p-red text-p-red-fg",
      "pastel-yellow": "bg-p-yellow text-p-yellow-fg",
      "pastel-green": "bg-p-green text-p-green-fg",
    } as Record<string, string>)[tone] || "bg-p-blue text-p-blue-fg"
  );
}

function GenreGrid() {
  const navigate = useNavigate();
  return (
    <section id="genres" className="py-16 md:py-28 border-t border-border scroll-mt-[60px] md:scroll-mt-[68px]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl md:text-4xl text-baobab tracking-tight">
              Browse by genre
            </h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Find your next read by the worlds you love.
            </p>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="text-sm font-medium text-foreground hover:underline inline-flex items-center gap-1"
          >
            View the full library <PiArrowRight size={15} />
          </button>
        </div>
        <div className="mt-8 md:mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {GENRES.map((genre, idx) => (
            <button
              key={genre.name}
              onClick={() => navigate(`/home?category=${encodeURIComponent(genre.name)}`)}
              className="reveal group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 text-left hover:bg-accent transition-colors duration-300"
              style={{ ["--reveal-delay"]: `${idx * 50}ms` } as CSSProperties}
            >
              <span
                className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-[11px] font-semibold uppercase tracking-[0.05em] ${toneClasses(
                  CATEGORY_TONE[genre.name]
                )}`}
              >
                {genre.name.slice(0, 2)}
              </span>
              <div>
                <p className="font-serif text-lg leading-tight text-baobab">{genre.name}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-snug">{genre.blurb}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -- Why ToxicReads -------------------------------------- */
function WhyToxicReads() {
  const points = [
    {
      icon: PiUpload,
      tone: "pastel-blue",
      title: "Publish in minutes",
      body: "Upload your book and it's queued for review. No agents, no gatekeepers — live in the catalogue the same day.",
    },
    {
      icon: PiCurrencyNgn,
      tone: "pastel-green",
      title: "Fair royalties",
      body: "You keep the lion's share. Priced in naira and paid to the writers telling Africa's stories.",
    },
    {
      icon: PiBookOpen,
      tone: "pastel-yellow",
      title: "Read anywhere",
      body: "Buy once, read on any device. Sci-fi, horror and thrillers you won't find on the big shelves.",
    },
  ];
  return (
    <section id="why" className="py-16 md:py-28 border-t border-border scroll-mt-[60px] md:scroll-mt-[68px]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-serif text-2xl md:text-4xl text-baobab tracking-tight">
            Why ToxicReads
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            A home for African speculative fiction — built for writers first.
          </p>
        </div>
        <div className="mt-8 md:mt-12 grid gap-5 md:grid-cols-3">
          {points.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="reveal rounded-2xl border border-border bg-card p-6"
                style={{ ["--reveal-delay"]: `${i * 70}ms` } as CSSProperties}
              >
                <span
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-[15px] ${toneClasses(
                    p.tone
                  )}`}
                >
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-serif text-xl text-baobab">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -- Footer ---------------------------------------------- */
function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <BrandMark />
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              Africa's home for sci-fi, horror, and thrillers. Upload, sell, and
              discover the boldest speculative fiction.
            </p>
            <form className="mt-5 flex gap-2 max-w-md" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="Your email for new releases"
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring/30 text-sm"
              />
              <button className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[#333333] transition whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
          <div>
            <h4 className="font-medium text-baobab text-sm uppercase tracking-[0.05em]">
              Explore
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/home" className="hover:text-foreground transition-colors">
                  Browse library
                </a>
              </li>
              <li>
                <a href="#genres" className="hover:text-foreground transition-colors">
                  Genres
                </a>
              </li>
              <li>
                <a href="/submit-book" className="hover:text-foreground transition-colors">
                  Upload
                </a>
              </li>
              <li>
                <a href="#why" className="hover:text-foreground transition-colors">
                  Why us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-baobab text-sm uppercase tracking-[0.05em]">
              Account
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/login" className="hover:text-foreground transition-colors">
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="hover:text-foreground transition-colors">
                  Register
                </a>
              </li>
              <li>
                <a href="/my-purchases" className="hover:text-foreground transition-colors">
                  My purchases
                </a>
              </li>
              <li>
                <a href="/my-submissions" className="hover:text-foreground transition-colors">
                  My submissions
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            © 2025 ToxicReads — every story matters.
          </p>
          <p className="text-xs text-muted-foreground">Built for readers in Lagos, Accra &amp; Nairobi.</p>
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
    <div className="bg-background min-h-screen relative">
      <Header scrolled={scrolled} />
      {/* Reserve height for the fixed header so content starts below it */}
      <div className="h-[60px] md:h-[68px]" />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <HeroSection onUpload={() => setUploadOpen(true)} />
      <GenreGrid />
      <WhyToxicReads />
      <Footer />
    </div>
  );
}
