import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import SafeImage from "@/components/SafeImage";
import PaymentModal from "@/components/PaymentModal";
import {
  ShoppingCart,
  Menu,
  X,
  Upload,
  BookOpen,
  Coins,
  FolderOpen,
  AlignLeft,
  BarChart3,
  Baby,
  Globe,
  ChevronRight,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";

/* ── Constants ───────────────────────────────────────────── */

const BOOK_GRADIENTS_LIGHT = [
  "linear-gradient(160deg, #5C3A21 0%, #B85C38 100%)",
  "linear-gradient(160deg, #1A1A1A 0%, #5C3A21 60%, #B85C38 100%)",
  "linear-gradient(160deg, #D4A017 0%, #B85C38 100%)",
  "linear-gradient(160deg, #B85C38 0%, #D4A017 100%)",
  "linear-gradient(160deg, #5C3A21 0%, #1A1A1A 100%)",
  "repeating-linear-gradient(135deg, #B85C38 0 18px, #D4A017 18px 36px, #5C3A21 36px 54px)",
];

const BOOK_GRADIENTS_DARK = [
  "linear-gradient(160deg, #D4A574 0%, #E07850 100%)",
  "linear-gradient(160deg, #F4EDE4 0%, #D4A574 60%, #E07850 100%)",
  "linear-gradient(160deg, #E8B84A 0%, #E07850 100%)",
  "linear-gradient(160deg, #E07850 0%, #E8B84A 100%)",
  "linear-gradient(160deg, #D4A574 0%, #F4EDE4 100%)",
  "repeating-linear-gradient(135deg, #E07850 0 18px, #E8B84A 18px 36px, #D4A574 36px 54px)",
];

function getGradients(theme: string) {
  return theme === "dark" ? BOOK_GRADIENTS_DARK : BOOK_GRADIENTS_LIGHT;
}

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

/* ── Scroll Reveal Hook ──────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("active");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ── Toast ───────────────────────────────────────────────── */

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]">
      <div className="px-5 py-3 rounded-2xl bg-charcoal text-cream shadow-2xl text-sm flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-ochre animate-pulse" />
        <span>{message}</span>
      </div>
    </div>
  );
}

/* ── Upload Modal ────────────────────────────────────────── */

function UploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-charcoal/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-[640px] mx-auto mt-[6vh] bg-cream rounded-[28px] shadow-2xl border border-baobab/10 p-6 md:p-8 mx-4 max-h-[88vh] overflow-auto">
        <button onClick={onClose} className="absolute right-4 top-4 w-9 h-9 grid place-items-center rounded-full hover:bg-black/5">
          <X size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-terracotta text-cream grid place-items-center shadow-md">
            <Upload size={22} />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-extrabold text-baobab">Upload Your Book</h3>
            <p className="text-xs text-charcoal/60 -mt-0.5">Takes 3 minutes. We review within 24 hours.</p>
          </div>
        </div>
        <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-charcoal/70">Book Title</label><input required placeholder="e.g., Salt and Rain" className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-baobab/20 bg-cream focus:ring-2 focus:ring-terracotta/30 outline-none" /></div>
            <div><label className="text-xs font-medium text-charcoal/70">Author / Pen Name</label><input required placeholder="Your name" className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-baobab/20 bg-cream focus:ring-2 focus:ring-terracotta/30 outline-none" /></div>
          </div>
          <div><label className="text-xs font-medium text-charcoal/70">Description</label><textarea rows={3} placeholder="What is your story about? 2-3 sentences" className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-baobab/20 bg-cream focus:ring-2 focus:ring-terracotta/30 outline-none" /></div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="text-xs font-medium text-charcoal/70">Price (₦)</label><input type="number" min="500" placeholder="2500" className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-baobab/20 bg-cream" /></div>
            <div><label className="text-xs font-medium text-charcoal/70">Category</label><select className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-baobab/20 bg-cream"><option>Fiction</option><option>Poetry</option><option>Folklore</option><option>Children</option><option>Non-fiction</option></select></div>
            <div><label className="text-xs font-medium text-charcoal/70">Condition</label><select className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-baobab/20 bg-cream"><option>New</option><option>Like New</option><option>Good</option><option>Fair</option></select></div>
          </div>
          <div>
            <label className="text-xs font-medium text-charcoal/70">Cover Image URL</label>
            <input placeholder="https://..." className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-baobab/20 bg-cream" />
          </div>
          <div className="pt-2 flex items-center justify-between gap-4">
            <p className="text-[11px] leading-snug text-charcoal/60">By uploading, you confirm you own the rights. Admin reviews within 24 hours.</p>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-terracotta text-cream font-semibold hover:bg-baobab transition whitespace-nowrap">Submit for Review</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Kente Strip ──────────────────────────────────────────── */

function KenteStrip({ className = "" }: { className?: string }) {
  return <div className={`kente w-full h-[5px] ${className}`} />;
}

/* ── Adinkra SVG Pattern ─────────────────────────────────── */

function AdinkraPattern({ theme }: { theme: string }) {
  const stroke1 = theme === "dark" ? "#D4A574" : "#5C3A21";
  const stroke2 = theme === "dark" ? "#E07850" : "#B85C38";
  const stroke3 = theme === "dark" ? "#E8B84A" : "#D4A017";

  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <defs>
        <pattern id="adinkra" width="180" height="180" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={stroke1} strokeOpacity="0.07" strokeWidth="1.4">
            <circle cx="90" cy="55" r="15" />
            <circle cx="90" cy="55" r="3" fill={stroke1} fillOpacity="0.07" stroke="none" />
            <path d="M90 40 L90 28" />
            <path d="M90 70 L90 82" />
            <path d="M75 55 L63 55" />
            <path d="M105 55 L117 55" />
            <g transform="translate(45 125)" stroke={stroke2} strokeOpacity="0.06">
              <circle cx="0" cy="0" r="14" />
              <path d="M0,-14 L0,-20" />
              <path d="M0,14 L0,20" />
              <path d="M-14,0 L-20,0" />
              <path d="M14,0 L20,0" />
            </g>
            <rect x="135" y="30" width="18" height="18" transform="rotate(45 144 39)" stroke={stroke3} strokeOpacity="0.05" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#adinkra)" />
    </svg>
  );
}

/* ── Header ──────────────────────────────────────────────── */

function Header({ cartCount, onCartOpen }: { cartCount: number; onCartOpen: () => void }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-cream/85 border-b border-baobab/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-baobab grid place-items-center shadow-md shadow-baobab/20">
            <svg viewBox="0 0 48 48" className="w-6 h-6 text-cream" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M24 7c-5.5 0-10 4.5-10 10 0 4.2 2.6 7.8 6.3 9.2l-2.8 7.8 6.5-4 6.5 4-2.8-7.8c3.7-1.4 6.3-5 6.3-9.2 0-5.5-4.5-10-10-10Z" />
              <circle cx="24" cy="17" r="2.3" fill="currentColor" stroke="none" />
              <path d="M16 21c-2 1.5-3.5 4-3.5 7M32 21c2 1.5 3.5 4 3.5 7" opacity=".7" />
            </svg>
          </span>
          <span className="font-serif text-[22px] font-extrabold tracking-tight text-baobab">Toxic<span className="text-terracotta">Reads</span></span>
        </a>
        <div className="hidden md:flex items-center gap-8 text-[15px] font-medium">
          <a href="/" className="hover:text-terracotta transition">Home</a>
          <a href="/home" className="hover:text-terracotta transition">Browse</a>
          <button onClick={() => navigate("/submit-book")} className="hover:text-terracotta transition">Upload</button>
          <a href="#browse" className="hover:text-terracotta transition">Featured</a>
          <a href="#community" className="hover:text-terracotta transition">Authors</a>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCartOpen} className="relative p-2 hover:bg-baobab/5 rounded-xl transition">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-terracotta text-cream text-[9px] font-bold grid place-items-center">{cartCount}</span>}
          </button>
          <button onClick={toggleTheme} className="p-2 hover:bg-baobab/5 rounded-xl transition" title={theme === "light" ? "Dark mode" : "Light mode"}>
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <a href="/login" className="hidden sm:inline-flex px-4 py-2 rounded-full border border-baobab/15 hover:border-baobab/30 text-sm font-semibold transition">Login</a>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-10 h-10 grid place-items-center rounded-xl border border-baobab/15">
            <Menu size={20} />
          </button>
        </div>
      </nav>
      {mobileOpen && (
        <div className="md:hidden border-t border-baobab/10 bg-cream/95 backdrop-blur">
          <div className="px-4 py-3 flex flex-col text-[15px]">
            <a href="/" className="py-2.5">Home</a>
            <a href="/home" className="py-2.5">Browse</a>
            <button onClick={() => { navigate("/submit-book"); setMobileOpen(false); }} className="py-2.5 text-left">Upload</button>
            <a href="#browse" className="py-2.5">Featured</a>
            <a href="#community" className="py-2.5">Authors</a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Hero ────────────────────────────────────────────────── */

function HeroSection({ onUpload, theme }: { onUpload: () => void; theme: string }) {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <AdinkraPattern theme={theme} />
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-ochre/25 to-terracotta/20 blur-[80px]" />
        <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-baobab/20 to-ochre/15 blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="max-w-3xl">
            <h1 className="mt-6 font-serif text-[44px] leading-[1.05] sm:text-6xl md:text-[80px] font-black tracking-tight text-baobab">
              African Stories,<br />
              <span className="relative inline-block text-terracotta">
                Shared by Us
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 12" fill="none"><path d="M3 8c45-6 90-9 150-6 48 2 95 5 144 0" stroke="var(--color-ochre)" strokeWidth="4" strokeLinecap="round" opacity=".7" /></svg>
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-[20px] leading-relaxed text-charcoal/80 max-w-xl">
              Buy, sell, and read uncommon books. Every purchase unlocks the full reading experience. Every story carries the voice of its maker.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate("/home")} className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-terracotta text-cream font-semibold shadow-lg shadow-terracotta/20 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-terracotta/25 transition">
                <BookOpen size={20} />
                Explore Library
              </button>
              <button onClick={onUpload} className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-baobab text-cream font-semibold hover:bg-charcoal transition">
                Upload Your Book
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {["AB", "CO", "EM"].map((init, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-cream bg-baobab/20 grid place-items-center text-[10px] font-bold text-baobab">
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-sm text-charcoal/70"><strong className="text-charcoal">340+ authors</strong> from Nigeria, Ghana, Kenya & beyond</p>
            </div>
          </div>

          {/* Hero visual — open book illustration */}
          <div className="hidden md:flex justify-center items-center relative">
            <div className="relative w-[380px] h-[380px]">
              {/* Floating Adinkra symbols */}
              <div className="absolute top-0 right-8 animate-bounce" style={{ animationDuration: "3s" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--color-ochre)" strokeWidth="1.5" opacity="0.3">
                  <circle cx="24" cy="24" r="10" />
                  <path d="M24 14 L24 8 M24 34 L24 40 M14 24 L8 24 M34 24 L40 24" />
                </svg>
              </div>
              <div className="absolute bottom-12 left-0 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
                <svg width="36" height="36" viewBox="0 0 48 48" fill="none" stroke="var(--color-terracotta)" strokeWidth="1.5" opacity="0.25">
                  <rect x="14" y="14" width="20" height="20" transform="rotate(45 24 24)" />
                </svg>
              </div>
              <div className="absolute top-20 left-4 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}>
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="var(--color-baobab)" strokeWidth="1.5" opacity="0.2">
                  <circle cx="24" cy="24" r="18" />
                  <circle cx="24" cy="24" r="6" />
                </svg>
              </div>

              {/* Main book */}
              <div className="absolute inset-8 rounded-[28px] bg-gradient-to-br from-baobab to-charcoal shadow-2xl shadow-baobab/30 overflow-hidden flex">
                {/* Left page */}
                <div className="w-1/2 h-full bg-gradient-to-br from-cream to-cream/80 p-6 flex flex-col justify-between relative">
                  <div>
                    <div className="w-12 h-1 rounded-full bg-terracotta/40 mb-4" />
                    <div className="space-y-2">
                      <div className="w-full h-1.5 rounded-full bg-charcoal/10" />
                      <div className="w-4/5 h-1.5 rounded-full bg-charcoal/10" />
                      <div className="w-full h-1.5 rounded-full bg-charcoal/10" />
                      <div className="w-3/4 h-1.5 rounded-full bg-charcoal/10" />
                      <div className="w-full h-1.5 rounded-full bg-charcoal/10" />
                      <div className="w-2/3 h-1.5 rounded-full bg-charcoal/10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-1.5 rounded-full bg-charcoal/10" />
                    <div className="w-4/5 h-1.5 rounded-full bg-charcoal/10" />
                    <div className="w-full h-1.5 rounded-full bg-charcoal/10" />
                  </div>
                  {/* Page curl shadow */}
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-black/5" />
                </div>
                {/* Spine */}
                <div className="w-[2px] bg-gradient-to-b from-baobab/20 via-baobab/40 to-baobab/20" />
                {/* Right page */}
                <div className="w-1/2 h-full bg-gradient-to-br from-cream to-cream/90 p-6 flex flex-col justify-between relative">
                  <div>
                    <div className="space-y-2">
                      <div className="w-full h-1.5 rounded-full bg-charcoal/10" />
                      <div className="w-3/4 h-1.5 rounded-full bg-charcoal/10" />
                      <div className="w-full h-1.5 rounded-full bg-charcoal/10" />
                      <div className="w-5/6 h-1.5 rounded-full bg-charcoal/10" />
                      <div className="w-full h-1.5 rounded-full bg-charcoal/10" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-terracotta/20" />
                    <div>
                      <div className="w-16 h-1.5 rounded-full bg-charcoal/15 mb-1" />
                      <div className="w-10 h-1 rounded-full bg-charcoal/8" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow */}
              <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-terracotta/10 to-ochre/10 blur-xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    { icon: <Upload size={24} />, title: "1. Upload", desc: "Authors upload with cover, blurb, and price in under 5 minutes. Support for multiple languages.", accent: "You keep 100% rights", accentColor: "text-terracotta" },
    { icon: <BookOpen size={24} />, title: "2. Read & Buy", desc: "Readers preview first chapter free. Pay securely. Instant access, no DRM.", accent: "Mobile-first reading", accentColor: "text-ochre" },
    { icon: <Coins size={24} />, title: "3. Earn", desc: "80% goes directly to you. Automatic monthly payouts to banks worldwide.", accent: "Transparent dashboard", accentColor: "text-ochre" },
  ];

  return (
    <section className="py-16 md:py-24 bg-cream/70 mud border-y border-baobab/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto reveal">
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-baobab">No Gatekeepers. Just Fair Publishing.</h2>
          <p className="mt-3 text-charcoal/70">Built for the way stories actually travel — word of mouth, community, shared shelves.</p>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <div key={i} className={`reveal group relative rounded-[28px] p-8 border border-baobab/10 shadow-sm hover:shadow-xl transition ${i === 2 ? "bg-baobab text-cream border-baobab" : "bg-cream hover:border-terracotta/30"}`} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className={`absolute -top-6 left-8 w-12 h-12 rounded-2xl grid place-items-center shadow-lg ${i === 0 ? "bg-terracotta text-cream shadow-terracotta/30" : i === 1 ? "bg-ochre text-baobab shadow-ochre/30" : "bg-cream text-baobab shadow-lg"}`}>
                {step.icon}
              </div>
              <h3 className="mt-6 font-serif text-[22px] font-bold text-baobab">{step.title}</h3>
              <p className={`mt-2 text-[15px] leading-relaxed ${i === 2 ? "text-cream/85" : "text-charcoal/75"}`}>{step.desc}</p>
              <p className={`mt-4 text-xs font-semibold tracking-wide uppercase ${step.accentColor}`}>{step.accent}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Featured Books ──────────────────────────────────────── */

function FeaturedBooks({ books, onAdd, theme }: { books: Array<{ id: number; title: string; author: string; coverImage: string; price: string; category: string }>; onAdd: (b: CartItem) => void; theme: string }) {
  const navigate = useNavigate();

  return (
    <section id="browse" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-baobab">Featured This Week</h2>
            <p className="mt-2 text-charcoal/70">Uncommon books, extraordinary voices</p>
          </div>
          <a href="/home" className="text-sm font-semibold text-terracotta hover:underline inline-flex items-center gap-1">
            View all books <ChevronRight size={16} />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
          {books.slice(0, 6).map((book, idx) => (
            <article key={book.id} className="reveal group bg-cream rounded-[26px] overflow-hidden border border-baobab/10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition" style={{ transitionDelay: `${idx * 0.05}s` }}>
              <div className="relative h-[280px] sm:h-[340px] book-cover" style={{ background: getGradients(theme)[idx % 6] }}>
                {book.coverImage && (
                  <div className="absolute inset-0 z-0">
                    <SafeImage src={book.coverImage} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div className="absolute inset-0 p-5 flex flex-col justify-end z-10">
                  <span className="text-[10px] uppercase tracking-widest bg-black/30 text-white/90 px-2 py-1 rounded-md w-fit backdrop-blur">
                    {book.category || "Book"}
                  </span>
                  <h3 className="mt-2 font-serif text-[26px] leading-tight font-bold text-white drop-shadow">{book.title}</h3>
                </div>
                <div className="absolute inset-0 bg-baobab/90 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 z-20">
                  <button onClick={() => navigate(`/book/${book.id}`)} className="px-4 py-2 rounded-full bg-cream text-baobab text-sm font-semibold">Preview</button>
                  <button onClick={() => onAdd(book)} className="px-4 py-2 rounded-full bg-terracotta text-cream text-sm font-semibold">Buy</button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold truncate">{book.author}</p>
                  <p className="text-xs text-charcoal/60 truncate">{book.category}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-bold text-baobab">{formatNaira(book.price)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Twin Authors Duel ───────────────────────────────────── */

function TwinDuel() {
  const [votes1, setVotes1] = useState(1247);
  const [votes2, setVotes2] = useState(1189);
  const [voted, setVoted] = useState<string | null>(null);

  const handleVote = (choice: "1" | "2") => {
    if (voted) return;
    setVoted(choice);
    if (choice === "1") setVotes1((v) => v + 1);
    else setVotes2((v) => v + 1);
  };

  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <section className="relative py-16 md:py-24 bg-baobab text-cream overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07] mud" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center reveal">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream/10 border border-cream/15 text-[11px] uppercase tracking-[0.18em] font-semibold">Monthly</span>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl font-extrabold">The Twin Authors Duel</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-cream/85">Every month, two authors compete. Readers vote, both win exposure, winner gets featured placement and a prize.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6 lg:gap-10 max-w-5xl mx-auto">
          <div className="reveal bg-cream text-charcoal rounded-[28px] p-7 shadow-2xl border-[3px] border-ochre/40">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-terracotta to-ochre grid place-items-center text-cream font-serif text-3xl shadow-lg shrink-0">AU</div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-baobab">Amara Uchendu</h3>
                <p className="text-sm text-charcoal/60">Lagos, Nigeria · Contemporary Fiction</p>
                <p className="mt-3 text-[15px] leading-snug">"The Red Soil" — three sisters return home after 20 years to settle their father's unfinished library.</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div><span className="font-bold text-3xl text-terracotta">{fmt(votes1)}</span><span className="ml-1 text-sm text-charcoal/60">votes</span></div>
              <button onClick={() => handleVote("1")} disabled={!!voted} className="px-5 py-2.5 rounded-full bg-terracotta text-cream font-semibold hover:bg-baobab transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                {voted === "1" ? "Voted ✓" : "Vote Amara"}
              </button>
            </div>
          </div>

          <div className="reveal bg-cream text-charcoal rounded-[28px] p-7 shadow-2xl border-[3px] border-baobab/20" style={{ transitionDelay: "0.1s" }}>
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-baobab to-charcoal grid place-items-center text-cream font-serif text-3xl shadow-lg shrink-0">TB</div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-baobab">Tunde Bakare</h3>
                <p className="text-sm text-charcoal/60">Accra, Ghana · Historical Fiction</p>
                <p className="mt-3 text-[15px] leading-snug">"Market Day" — 1970s Kumasi through the eyes of a 12-year-old trader who keeps everyone's secrets.</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div><span className="font-bold text-3xl text-terracotta">{fmt(votes2)}</span><span className="ml-1 text-sm text-charcoal/60">votes</span></div>
              <button onClick={() => handleVote("2")} disabled={!!voted} className="px-5 py-2.5 rounded-full bg-baobab text-cream font-semibold hover:bg-charcoal transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                {voted === "2" ? "Voted ✓" : "Vote Tunde"}
              </button>
            </div>
          </div>
        </div>
        <p className="text-center mt-8 text-cream/60 text-sm">Voting ends in 4 days · Live results on social media</p>
      </div>
    </section>
  );
}

/* ── Categories ──────────────────────────────────────────── */

function Categories() {
  const cats = [
    { icon: <Globe size={22} />, label: "Folklore & Myths" },
    { icon: <AlignLeft size={22} />, label: "Contemporary Fiction" },
    { icon: <BarChart3 size={22} />, label: "Poetry" },
    { icon: <BookOpen size={22} />, label: "History & Biography" },
    { icon: <Baby size={22} />, label: "Children's Stories" },
    { icon: <FolderOpen size={22} />, label: "Languages" },
  ];
  const languages = ["Hausa", "Yoruba", "Igbo", "Swahili", "Pidgin", "English"];

  return (
    <section className="py-16 md:py-20 bg-cream/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-baobab text-center">Browse by Category</h2>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {cats.map((cat, i) => (
            <a key={i} href="/home" className="group bg-cream rounded-2xl p-5 border border-baobab/10 hover:shadow-lg hover:-translate-y-0.5 transition text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-ochre/15 text-baobab grid place-items-center group-hover:bg-terracotta group-hover:text-cream transition">
                {cat.icon}
              </div>
              <p className="mt-3 text-sm font-semibold text-baobab">{cat.label}</p>
            </a>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {languages.map((lang) => (
            <span key={lang} className="px-3 py-1.5 rounded-full bg-baobab/5 border border-baobab/10 text-xs font-medium text-baobab">{lang}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Community ───────────────────────────────────────────── */

function Community({ onUpload }: { onUpload: () => void }) {
  return (
    <section id="community" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-baobab rounded-[36px] md:rounded-[48px] p-10 md:p-16 text-cream">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-ochre/20 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-terracotta/20 blur-3xl" />
          <div className="relative grid md:grid-cols-[1.2fr_.8fr] gap-10 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-[40px] font-extrabold leading-tight">Built for writers, by readers</h2>
              <p className="mt-4 text-cream/85 text-[17px] leading-relaxed">We are a community, not a corporation. Profits fund translation grants, school libraries, and writer workshops from Lagos to Nairobi.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={onUpload} className="px-5 py-2.5 rounded-full bg-cream text-baobab font-semibold text-sm hover:translate-y-[-1px] transition">Join as Author</button>
                <a href="#browse" className="px-5 py-2.5 rounded-full border border-cream/30 text-sm font-semibold hover:bg-cream/10 transition">Browse Books</a>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div><div className="font-serif text-5xl font-black text-ochre">1,200+</div><div className="mt-1 text-sm text-cream/70">Books</div></div>
              <div><div className="font-serif text-5xl font-black text-ochre">340</div><div className="mt-1 text-sm text-cream/70">Authors</div></div>
              <div><div className="font-serif text-5xl font-black text-ochre">15</div><div className="mt-1 text-sm text-cream/70">Countries</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-cream border-t border-baobab/10">
      <KenteStrip />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-baobab grid place-items-center">
                <svg viewBox="0 0 48 48" className="w-5 h-5 text-cream" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M24 7c-5.5 0-10 4.5-10 10 0 4.2 2.6 7.8 6.3 9.2l-2.8 7.8 6.5-4 6.5 4-2.8-7.8c3.7-1.4 6.3-5 6.3-9.2 0-5.5-4.5-10-10-10Z" /></svg>
              </span>
              <span className="font-serif text-xl font-extrabold text-baobab">ToxicReads</span>
            </div>
            <p className="mt-3 text-sm text-charcoal/70 max-w-md">A home for uncommon literature. Upload, sell, and discover books that carry the voice of their makers.</p>
            <form className="mt-5 flex gap-2 max-w-md" onSubmit={(e) => e.preventDefault()}>
              <input type="email" required placeholder="Your email for new releases" className="flex-1 px-4 py-2.5 rounded-xl border border-baobab/20 bg-cream/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 text-sm" />
              <button className="px-5 py-2.5 rounded-xl bg-terracotta text-cream text-sm font-semibold hover:bg-baobab transition whitespace-nowrap">Subscribe</button>
            </form>
          </div>
          <div>
            <h4 className="font-semibold text-baobab">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-charcoal/70">
              <li><a href="/home" className="hover:text-terracotta transition">Browse Library</a></li>
              <li><a href="#browse" className="hover:text-terracotta transition">Featured Books</a></li>
              <li><a href="/submit-book" className="hover:text-terracotta transition">Upload</a></li>
              <li><a href="#community" className="hover:text-terracotta transition">For Authors</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-baobab">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-charcoal/70">
              <li><a href="/login" className="hover:text-terracotta transition">Login</a></li>
              <li><a href="/register" className="hover:text-terracotta transition">Register</a></li>
              <li><a href="/my-purchases" className="hover:text-terracotta transition">My Purchases</a></li>
              <li><a href="/my-submissions" className="hover:text-terracotta transition">My Submissions</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-baobab/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-charcoal/60">© 2025 ToxicReads. Every story matters.</p>
        </div>
      </div>
    </footer>
  );
}

/* ── Cart Drawer ─────────────────────────────────────────── */

function CartDrawer({ open, onClose, items, onRemove, onCheckout }: {
  open: boolean; onClose: () => void; items: CartItem[]; onRemove: (id: number) => void; onCheckout: () => void;
}) {
  const total = items.reduce((sum, item) => sum + parseFloat(item.price || "0"), 0);

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-[200] bg-charcoal/70 backdrop-blur-sm" />}
      <div className={`fixed top-0 right-0 bottom-0 z-[201] w-[min(420px,85vw)] bg-cream border-l border-baobab/10 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 border-b border-baobab/10">
          <span className="text-xs font-semibold tracking-widest text-baobab">CART</span>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-full hover:bg-black/5"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <p className="text-sm text-charcoal/50 text-center mt-12">Your cart is empty</p>
          ) : items.map((item) => (
            <div key={item.id} className="flex gap-3 mb-4 pb-4 border-b border-baobab/10">
              <div className="w-14 aspect-[3/4] rounded-lg overflow-hidden bg-baobab/10 shrink-0">
                <SafeImage src={item.coverImage} alt={item.title} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.title}</p>
                <p className="text-xs text-charcoal/60">{item.author}</p>
                <p className="text-sm font-bold text-terracotta mt-1">{formatNaira(item.price)}</p>
              </div>
              <button onClick={() => onRemove(item.id)} className="text-charcoal/40 hover:text-charcoal"><X size={16} /></button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="p-5 border-t border-baobab/10">
            <div className="flex justify-between mb-4">
              <span className="text-sm text-charcoal/60">Total</span>
              <span className="text-lg font-bold text-baobab">{formatNaira(total)}</span>
            </div>
            <button onClick={onCheckout} className="w-full py-3 rounded-xl bg-terracotta text-cream font-semibold hover:bg-baobab transition">Checkout</button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Main ────────────────────────────────────────────────── */

export default function Landing() {
  useReveal();

  const { data: books } = trpc.book.list.useQuery();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const buyMutation = trpc.purchase.buy.useMutation();

  const addToCart = useCallback((book: CartItem) => {
    setCart((prev) => {
      if (prev.find((b) => b.id === book.id)) return prev;
      return [...prev, book];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((b) => b.id !== id));
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

  const allBooks = books?.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    coverImage: b.coverImage,
    price: b.price,
    category: b.category,
  })) || [];

  return (
    <div className="bg-cream min-h-screen">
      <KenteStrip />
      <Header cartCount={cart.length} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cart} onRemove={removeFromCart} onCheckout={() => setShowPayment(true)} />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      <HeroSection onUpload={() => setUploadOpen(true)} theme={theme} />
      <HowItWorks />
      <FeaturedBooks books={allBooks} onAdd={addToCart} theme={theme} />
      <TwinDuel />
      <Categories />
      <Community onUpload={() => setUploadOpen(true)} />
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
