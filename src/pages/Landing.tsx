import { useState, useEffect, useCallback } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import SafeImage from "@/components/SafeImage";
import PaymentModal from "@/components/PaymentModal";
import {
  PiShoppingCart,
  PiList,
  PiX,
  PiUpload,
  PiBookOpen,
  PiArrowRight,
  PiCaretRight,
  PiSun,
  PiMoon,
} from "react-icons/pi";

/* -- Constants ------------------------------------------- */
interface CartItem {
  id: number;
  title: string;
  author: string;
  price: string;
  coverImage: string;
  category?: string;
}
function formatNaira(price: string | number) {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `₦${num.toLocaleString("en-NG")}`;
}

const CATEGORY_TONE: Record<string, string> = {
  "Sci-Fi": "pastel-blue",
  Horror: "pastel-red",
  Thriller: "pastel-yellow",
  Fiction: "pastel-green",
  Fantasy: "pastel-green",
  "Non-Fiction": "pastel-blue",
};
function toneFor(category?: string) {
  return (category && CATEGORY_TONE[category]) || "pastel-blue";
}

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

/* -- Toast ----------------------------------------------- */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]">
      <div className="px-5 py-3 rounded-md bg-charcoal text-cream shadow-soft text-sm flex items-center gap-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-p-yellow" />
        <span>{message}</span>
      </div>
    </div>
  );
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
function Header({
  cartCount,
  onCartOpen,
  scrolled,
}: {
  cartCount: number;
  onCartOpen: () => void;
  scrolled: boolean;
}) {
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
    { label: "Upload", action: () => navigate("/submit-book") },
    { label: "Featured", href: "#browse" },
    { label: "Authors", href: "#authors" },
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
              <a href="#browse" className="hover:text-foreground transition-colors">
                Featured
              </a>
              <a href="#authors" className="hover:text-foreground transition-colors">
                Authors
              </a>
            </div>
            <button
              onClick={onCartOpen}
              className="relative p-2.5 hover:bg-accent rounded-full transition-colors"
              aria-label="Cart"
            >
              <PiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold grid place-items-center">
                  {cartCount}
                </span>
              )}
            </button>
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

/* -- Featured Books -------------------------------------- */
function SkeletonCard() {
  return (
    <article className="bg-card rounded-2xl overflow-hidden border border-border shadow-none animate-pulse">
      <div className="h-[260px] sm:h-[300px] bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </article>
  );
}

function FeaturedBooks({
  books,
  onAdd,
  loading,
  fetching,
}: {
  books: Array<{ id: number; title: string; author: string; coverImage: string; price: string; category: string }>;
  onAdd: (b: CartItem) => void;
  loading?: boolean;
  fetching?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <section id="browse" className="py-16 md:py-28 border-t border-border scroll-mt-[60px] md:scroll-mt-[68px]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl md:text-4xl text-baobab tracking-tight inline-flex items-center gap-3">
              Featured this week
              {!loading && fetching && (
                <span className="inline-block w-4 h-4 border-2 border-border border-t-baobab rounded-full animate-spin" />
              )}
            </h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Uncommon books, extraordinary voices
            </p>
          </div>
          <a
            href="/home"
            className="text-sm font-medium text-foreground hover:underline inline-flex items-center gap-1"
          >
            View all books <PiCaretRight size={15} />
          </a>
        </div>
        <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            books.slice(0, 6).map((book, idx) => (
              <article
                key={book.id}
                className="reveal group bg-card rounded-2xl overflow-hidden border border-border shadow-soft hover:shadow-soft-lg transition-[box-shadow,transform] duration-500 ease-spring hover:-translate-y-1"
                style={{ ["--reveal-delay"]: `${idx * 70}ms` } as CSSProperties}
              >
                <div className="relative h-[260px] sm:h-[300px] overflow-hidden bg-muted">
                  {book.coverImage ? (
                    <div className="absolute inset-0 z-0">
                      <SafeImage
                        src={book.coverImage}
                        alt={book.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 z-0 grid place-items-center bg-[#EFEEEA] dark:bg-[#232220]">
                      <span className="font-serif text-3xl text-muted-foreground px-6 text-center">
                        {book.title}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/85 transition-colors duration-500 flex items-center justify-center gap-2 z-20 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => navigate(`/book/${book.id}`)}
                      className="px-4 py-2 rounded-full border border-border bg-card text-foreground text-sm font-medium hover:bg-accent"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => onAdd(book)}
                      className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[#333333]"
                    >
                      Buy
                    </button>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-lg leading-tight truncate text-baobab">
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">{book.author}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block mb-1.5 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.05em] border border-transparent ${
                        ({
                          "pastel-blue": "bg-p-blue text-p-blue-fg",
                          "pastel-red": "bg-p-red text-p-red-fg",
                          "pastel-yellow": "bg-p-yellow text-p-yellow-fg",
                          "pastel-green": "bg-p-green text-p-green-fg",
                        } as Record<string, string>)[toneFor(book.category)] || "bg-p-blue text-p-blue-fg"
                      }`}
                    >
                      {book.category || "Book"}
                    </span>
                    <p className="font-mono text-sm font-medium text-baobab">
                      {formatNaira(book.price)}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* -- Authors strip --------------------------------------- */
function AuthorsStrip() {
  const authors = [
    { initials: "NC", name: "Nnedi O.", tone: "bg-p-blue text-p-blue-fg" },
    { initials: "TO", name: "Tade O.", tone: "bg-p-red text-p-red-fg" },
    { initials: "MA", name: "Makena A.", tone: "bg-p-green text-p-green-fg" },
    { initials: "KO", name: "Kofi O.", tone: "bg-p-yellow text-p-yellow-fg" },
    { initials: "ZA", name: "Zara A.", tone: "bg-p-blue text-p-blue-fg" },
  ];
  return (
    <section id="authors" className="py-16 md:py-28 border-t border-border scroll-mt-[60px] md:scroll-mt-[68px]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-serif text-2xl md:text-4xl text-baobab tracking-tight">
            Voices from across the continent
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            Independent writers publishing directly to readers. No gatekeepers,
            fair royalties, and a growing catalogue of genre fiction.
          </p>
        </div>
        <div className="mt-8 md:mt-12 flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-5">
          {authors.map((a, i) => (
            <div
              key={a.name}
              className="reveal flex flex-col items-center text-center gap-3 p-5 min-w-[140px] sm:min-w-0 rounded-2xl border border-border bg-card"
              style={{ ["--reveal-delay"]: `${i * 70}ms` } as CSSProperties}
            >
              <div
                className={`w-14 h-14 rounded-full grid place-items-center font-serif text-xl ${a.tone}`}
              >
                {a.initials}
              </div>
              <p className="text-sm font-medium text-baobab">{a.name}</p>
            </div>
          ))}
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
                <a href="#browse" className="hover:text-foreground transition-colors">
                  Featured books
                </a>
              </li>
              <li>
                <a href="/submit-book" className="hover:text-foreground transition-colors">
                  Upload
                </a>
              </li>
              <li>
                <a href="#authors" className="hover:text-foreground transition-colors">
                  For authors
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

/* -- Cart Drawer ----------------------------------------- */
function CartDrawer({
  open,
  onClose,
  items,
  onRemove,
  onCheckout,
}: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: number) => void;
  onCheckout: () => void;
}) {
  const total = items.reduce((sum, item) => sum + parseFloat(item.price || "0"), 0);
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-[200] bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[201] w-[min(420px,100vw)] bg-card border-l border-border flex flex-col transition-transform duration-500 ease-spring ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-baobab">
            Cart
          </span>
          <button
            onClick={onClose}
            className="w-9 h-9 grid place-items-center rounded-full hover:bg-accent"
            aria-label="Close"
          >
            <PiX size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center mt-12">Your cart is empty</p>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 mb-4 pb-4 border-b border-border">
                <div className="w-14 aspect-[3/4] rounded-lg overflow-hidden bg-muted shrink-0">
                  <SafeImage src={item.coverImage} alt={item.title} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-baobab">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.author}</p>
                  <p className="text-sm font-mono font-medium text-baobab mt-1">
                    {formatNaira(item.price)}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Remove"
                >
                  <PiX size={16} />
                </button>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="p-5 border-t border-border">
            <div className="flex justify-between mb-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-mono font-medium text-baobab">{formatNaira(total)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-[#333333] transition"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* -- Main ------------------------------------------------ */
export default function Landing() {
  useReveal();
  const { data: books, isLoading: booksLoading, isFetching: booksFetching } = trpc.book.list.useQuery(
    undefined,
    { staleTime: 5 * 60 * 1000 }
  );
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const utils = trpc.useUtils();
  const buyMutation = trpc.purchase.buy.useMutation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const addToCart = useCallback((book: CartItem) => {
    setCart(prev => {
      if (prev.find(b => b.id === book.id)) return prev;
      setToast(`Added "${book.title}" to cart`);
      return [...prev, book];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(b => b.id !== id));
  }, []);

  const handleCheckoutPay = async () => {
    for (const item of cart) {
      await buyMutation.mutateAsync({ bookId: item.id });
    }
    setCart([]);
    setCartOpen(false);
    setShowPayment(false);
    utils.purchase.myPurchases.invalidate();
    navigate("/my-purchases");
  };

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price || "0"), 0);
  const allBooks =
    books?.map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      coverImage: b.coverImage,
      price: b.price,
      category: b.category,
    })) || [];

  return (
    <div className="bg-background min-h-screen relative">
      <Header cartCount={cart.length} onCartOpen={() => setCartOpen(true)} scrolled={scrolled} />
      {/* Reserve height for the fixed header so content starts below it */}
      <div className="h-[60px] md:h-[68px]" />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onRemove={removeFromCart}
        onCheckout={() => setShowPayment(true)}
      />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <HeroSection onUpload={() => setUploadOpen(true)} />
      <FeaturedBooks books={allBooks} onAdd={addToCart} loading={booksLoading} fetching={booksFetching} />
      <AuthorsStrip />
      <Footer />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {showPayment && cart.length > 0 && (
        <PaymentModal
          price={cartTotal.toFixed(2)}
          title={cart.length === 1 ? cart[0].title : cart.length + " books"}
          onPay={handleCheckoutPay}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
