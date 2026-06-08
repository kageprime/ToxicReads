import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import SafeImage from "@/components/SafeImage";

const RAW_LINEN = "#FAF5EB";
const KILN_CHARCOAL = "#2C1810";
const TERRACOTTA = "#B85C3C";
const STONEWARE = "#8B7355";
const WARM_SAND = "#D4C4A8";
const CLAY = "#C86848";

interface CartItem {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  price: string;
  category?: string;
}

/* ── Rain Sound Easter Egg ───────────────────────────────────── */

function useRainSound() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<{ ctx: AudioContext; whiteNoise: AudioBufferSourceNode; gain: GainNode } | null>(null);

  const toggle = useCallback(() => {
    if (!audioRef.current) {
      // Create rain noise using Web Audio API
      const AC = window.AudioContext;
      const wAC = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const AudioContextCtor = AC || wAC;
      if (!AudioContextCtor) return;
      const ctx = new AudioContextCtor();
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 800;
      const gain = ctx.createGain();
      gain.gain.value = 0.08;
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
      audioRef.current = { ctx, whiteNoise, gain };
      setPlaying(true);
    } else {
      const { ctx, whiteNoise } = audioRef.current!;
      whiteNoise.stop();
      ctx.close();
      audioRef.current = null;
      setPlaying(false);
    }
  }, []);

  return { playing, toggle };
}

/* ── Cart Drawer ───────────────────────────────────────────── */

interface CartItem {
  id: number;
  title: string;
  author: string;
  price: string;
  coverImage: string;
}

function CartDrawer({ open, onClose, items, onRemove }: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: number) => void;
}) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const total = items.reduce((sum, item) => sum + parseFloat(item.price || "0"), 0);

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        />
      )}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 201,
        width: "min(420px, 85vw)",
        backgroundColor: RAW_LINEN,
        borderLeft: `1px solid ${STONEWARE}30`,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: `1px solid ${STONEWARE}20`,
        }}>
          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em", color: KILN_CHARCOAL }}>
            {t("购物车", "CART")}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: STONEWARE }}>
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {items.length === 0 ? (
            <p style={{ fontSize: 12, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: STONEWARE, textAlign: "center", marginTop: 40 }}>
              {t("您的购物车是空的", "Your cart is empty")}
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${STONEWARE}15` }}>
                <div style={{ width: 56, aspectRatio: "3/4", border: `1px solid ${STONEWARE}20`, overflow: "hidden", flexShrink: 0 }}>
                  <SafeImage src={item.coverImage} alt={item.title} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: KILN_CHARCOAL, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                  <p style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: STONEWARE }}>{item.author}</p>
                  <p style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: TERRACOTTA, marginTop: 4 }}>${item.price}</p>
                </div>
                <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: STONEWARE, fontSize: 14, alignSelf: "flex-start" }}>
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: `1px solid ${STONEWARE}20` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: STONEWARE }}>{t("合计", "Total")}</span>
              <span style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", color: KILN_CHARCOAL }}>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => navigate("/my-purchases")}
              style={{
                width: "100%", padding: "14px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em",
                color: RAW_LINEN, backgroundColor: KILN_CHARCOAL, border: "none", cursor: "pointer",
              }}
            >
              {t("去结算", "CHECKOUT")} →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Shared Components ─────────────────────────────────────── */

function GlazeDot({ color }: { color: string }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      backgroundColor: color, marginRight: 6,
    }} />
  );
}

/* ── Header ──────────────────────────────────────────────────── */

function Header({ cartCount, onCartOpen }: { cartCount: number; onCartOpen: () => void }) {
  const { lang, toggle, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 52, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px",
      backgroundColor: "transparent",
    }}>
      <span style={{
        fontSize: 11, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic",
        letterSpacing: "0.05em", color: RAW_LINEN, mixBlendMode: "difference",
      }}>
        TOXICREADS
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <button onClick={toggle} style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em",
          color: RAW_LINEN, background: "none", border: "none", cursor: "pointer",
          mixBlendMode: "difference",
        }}>
          {lang === "zh" ? "EN" : "中文"}
        </button>
        <button onClick={() => navigate("/home")} style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em",
          color: RAW_LINEN, background: "none", border: "none", cursor: "pointer",
          mixBlendMode: "difference",
        }}>
          {t("浏览", "BROWSE")} →
        </button>
        <button onClick={onCartOpen} style={{
          position: "relative", background: "none", border: "none", cursor: "pointer",
          color: RAW_LINEN, mixBlendMode: "difference", fontSize: 16,
        }}>
          🛒
          {cartCount > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -8,
              fontSize: 9, fontFamily: "'Space Mono', monospace",
              backgroundColor: TERRACOTTA, color: RAW_LINEN,
              borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

/* ── Hero ───────────────────────────────────────────────────── */

function HeroSection() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section style={{
      minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      background: `linear-gradient(160deg, ${KILN_CHARCOAL} 0%, #3D2010 40%, ${TERRACOTTA}50 70%, ${STONEWARE}30 100%)`,
      overflow: "hidden",
    }}>
      {/* Animated ambient gradient overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.2,
        background: `radial-gradient(ellipse at 70% 40%, ${CLAY}40 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, ${WARM_SAND}30 0%, transparent 50%)`,
        animation: "ambientShift 12s ease-in-out infinite alternate",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
        background: `linear-gradient(0deg, ${RAW_LINEN}15 0%, transparent 100%)`,
      }} />

      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "0 8vw" }}>
        <p style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.35em",
          color: WARM_SAND, marginBottom: 32, textTransform: "uppercase",
        }}>
          {t(" uncommon 之书市集", "A MARKET FOR THE UNCOMMON BOOK")}
        </p>

        <h1 style={{
          fontSize: "clamp(48px, 10vw, 96px)", fontWeight: 300,
          fontFamily: "'Libre Baskerville', 'Noto Serif SC', serif", fontStyle: "italic",
          color: RAW_LINEN, letterSpacing: "0.02em", lineHeight: 1.1,
          WebkitTextStroke: "2px rgba(26,26,26,0.3)",
        }}>
          TOXICREADS
        </h1>

        <p style={{
          fontSize: 14, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif",
          color: WARM_SAND, marginTop: 32, maxWidth: 520,
          margin: "32px auto 0", lineHeight: 1.8, fontWeight: 300,
        }}>
          {t("买卖 uncommon 之书。每一次购买，解锁完整的阅读体验。", "Buy, sell, and read uncommon books. Every purchase unlocks the full reading experience.")}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", marginTop: 48 }}>
          <button onClick={() => navigate("/home")} style={{
            padding: "14px 40px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em",
            color: KILN_CHARCOAL, backgroundColor: TERRACOTTA, border: "none", cursor: "pointer",
            transition: "opacity 0.2s",
          }} onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
             onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
            {t("探索藏品", "EXPLORE COLLECTION")}
          </button>
          <button onClick={() => navigate("/home")} style={{
            padding: "14px 40px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em",
            color: TERRACOTTA, backgroundColor: "transparent", border: `1px solid ${TERRACOTTA}`, cursor: "pointer",
            transition: "all 0.2s",
          }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = TERRACOTTA; e.currentTarget.style.color = KILN_CHARCOAL; }}
             onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = TERRACOTTA; }}>
            {t("了解更多", "LEARN MORE")}
          </button>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 48, left: "10%", right: "10%", zIndex: 5, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: `${WARM_SAND}60`, letterSpacing: "0.15em" }}>
          {t("TOXICREADS — 创立于 2025", "TOXICREADS — EST. 2025")}
        </span>
        <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: `${WARM_SAND}60`, letterSpacing: "0.15em" }}>
          {t("开放版本", "OPEN EDITION")}
        </span>
      </div>

      <style>{`
        @keyframes ambientShift {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.1) translate(-2%, -1%); }
        }
      `}</style>
    </section>
  );
}

/* ── Seasonal Collection ───────────────────────────────────── */

function SeasonalCollection({ books, onAdd }: { books: Array<{ id: number; title: string; author: string; coverImage: string; price: string; category: string }>; onAdd: (b: CartItem) => void }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section style={{ backgroundColor: RAW_LINEN, padding: "10vh 0", position: "relative" }}>
      <div style={{ padding: "0 4vw", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.3em", color: TERRACOTTA }}>
              {t("季节精选", "SEASONAL")}
            </span>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 300, fontFamily: "'Libre Baskerville', 'Noto Serif SC', serif", fontStyle: "italic", color: KILN_CHARCOAL, marginTop: 8, letterSpacing: "-0.01em" }}>
              {t("本季之书", "This Season's Reads")}
            </h2>
            <div style={{ width: 48, height: 1, backgroundColor: TERRACOTTA, marginTop: 16 }} />
          </div>
          <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: STONEWARE, letterSpacing: "0.05em" }}>
            {t("左右滑动", "Scroll →")}
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          display: "flex", gap: 16, overflowX: "auto", padding: "0 4vw",
          scrollSnapType: "x mandatory", scrollbarWidth: "none",
        }}
      >
        {books.slice(0, 8).map((book) => (
          <div
            key={book.id}
            style={{
              flex: "0 0 220px", scrollSnapAlign: "start",
              cursor: "pointer",
            }}
          >
            <div
              onClick={() => navigate(`/book/${book.id}`)}
              style={{ border: `1px solid ${STONEWARE}30`, aspectRatio: "3/4", overflow: "hidden", marginBottom: 8, position: "relative" }}
            >
              <SafeImage src={book.coverImage} alt={book.title} />
              <div style={{
                position: "absolute", top: 8, left: 8,
                display: "flex", alignItems: "center",
              }}>
                <GlazeDot color={TERRACOTTA} />
                <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: RAW_LINEN, letterSpacing: "0.1em" }}>
                  {book.category?.toUpperCase?.() || "BOOK"}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: KILN_CHARCOAL, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</p>
            <p style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: STONEWARE }}>{book.author}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
              <p style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: TERRACOTTA }}>${book.price}</p>
              <button
                onClick={(e) => { e.stopPropagation(); onAdd(book); }}
                style={{
                  fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em",
                  color: KILN_CHARCOAL, background: "none", border: `1px solid ${STONEWARE}40`,
                  cursor: "pointer", padding: "2px 8px",
                }}
              >
                {t("加入", "ADD")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── All Products ───────────────────────────────────────────── */

const CATEGORIES = [
  { key: "fiction", zh: "小说", en: "Fiction", color: "#B85C3C" },
  { key: "non-fiction", zh: "非虚构", en: "Non-fiction", color: "#8B7355" },
  { key: "poetry", zh: "诗歌", en: "Poetry", color: "#C86848" },
  { key: "philosophy", zh: "哲学", en: "Philosophy", color: "#D4C4A8" },
  { key: "all", zh: "全部", en: "All", color: "#2C1810" },
];

function AllProducts({ books, onAdd }: { books: Array<{ id: number; title: string; author: string; coverImage: string; price: string; category: string }>; onAdd: (b: CartItem) => void }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? books : books.filter((b) => b.category?.toLowerCase() === filter);

  return (
    <section style={{ backgroundColor: RAW_LINEN, padding: "10vh 4vw", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.3em", color: TERRACOTTA }}>
            {t("全部藏品", "ALL WORKS")}
          </span>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 300, fontFamily: "'Libre Baskerville', 'Noto Serif SC', serif", fontStyle: "italic", color: KILN_CHARCOAL, marginTop: 8, letterSpacing: "-0.01em" }}>
            {t("藏书阁", "The Library")}
          </h2>
          <div style={{ width: 48, height: 1, backgroundColor: TERRACOTTA, margin: "16px auto 0" }} />
        </div>

        {/* Category filters */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "6px 14px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.05em",
                border: filter === cat.key ? "1px solid var(--text-charcoal)" : "1px solid var(--border-light)",
                background: filter === cat.key ? KILN_CHARCOAL : "transparent",
                color: filter === cat.key ? RAW_LINEN : STONEWARE,
                cursor: "pointer", textTransform: "uppercase",
              }}
            >
              <GlazeDot color={cat.color} />
              {t(cat.zh, cat.en)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {filtered.map((book) => (
            <div
              key={book.id}
              onClick={() => navigate(`/book/${book.id}`)}
              style={{ cursor: "pointer", transition: "transform 0.3s ease" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ border: `1px solid ${STONEWARE}30`, aspectRatio: "3/4", overflow: "hidden", marginBottom: 8, position: "relative" }}>
                <SafeImage src={book.coverImage} alt={book.title} />
                <div style={{ position: "absolute", top: 8, left: 8, display: "flex", alignItems: "center" }}>
                  <GlazeDot color={TERRACOTTA} />
                  <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: RAW_LINEN, letterSpacing: "0.1em" }}>
                    {book.category?.toUpperCase?.() || "BOOK"}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 12, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: KILN_CHARCOAL, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</p>
              <p style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: STONEWARE }}>{book.author}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <p style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: TERRACOTTA }}>${book.price}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); onAdd(book); }}
                  style={{
                    fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em",
                    color: KILN_CHARCOAL, background: "none", border: `1px solid ${STONEWARE}40`,
                    cursor: "pointer", padding: "2px 8px",
                  }}
                >
                  {t("加入", "ADD")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Maker's Story ──────────────────────────────────────────── */

function MakersStory() {
  const { t } = useLanguage();

  return (
    <section style={{ backgroundColor: KILN_CHARCOAL, padding: "12vh 4vw", position: "relative" }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        background: `radial-gradient(circle at 30% 50%, ${CLAY} 0%, transparent 60%)`,
      }} />
      <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.3em", color: TERRACOTTA }}>
            {t("关于", "ABOUT")}
          </span>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 300, fontFamily: "'Libre Baskerville', 'Noto Serif SC', serif", fontStyle: "italic", color: RAW_LINEN, marginTop: 8, letterSpacing: "-0.01em" }}>
            {t("匠人之书", "The Maker's Story")}
          </h2>
          <div style={{ width: 48, height: 1, backgroundColor: TERRACOTTA, margin: "16px auto 0" }} />
        </div>

        <p style={{ fontSize: 15, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: WARM_SAND, lineHeight: 1.9, fontWeight: 300, textAlign: "center" }}>
          {t(
            "每一本书都是一位匠人的独白。页边的批注、磨损的折角、纸张与墨水的气息——这些都是时间留下的痕迹。我们相信，uncommon 之书不应被埋没，每一本都值得被重新阅读、被重新珍藏。",
            "Every book is a maker's monologue. The annotations in the margins, the worn dog-ears, the scent of paper and ink—these are traces left by time. We believe that uncommon books should not be forgotten; each one deserves to be read again and treasured anew."
          )}
        </p>
      </div>
    </section>
  );
}

/* ── The Process ──────────────────────────────────────────── */

const STEPS = [
  { zh: "浏览", en: "Browse", descZh: "在藏书阁中发现 uncommon 之书", descEn: "Discover uncommon books in the library" },
  { zh: "选择", en: "Select", descZh: "找到触动你的那一本", descEn: "Find the one that moves you" },
  { zh: "购买", en: "Purchase", descZh: "每一次购买解锁完整阅读", descEn: "Every purchase unlocks the full read" },
  { zh: "阅读", en: "Read", descZh: "沉浸于文字的世界", descEn: "Immerse yourself in the world of words" },
  { zh: "分享", en: "Share", descZh: "将你的书传递给下一位读者", descEn: "Pass your book to the next reader" },
];

function TheProcess() {
  const { t } = useLanguage();

  return (
    <section style={{ backgroundColor: RAW_LINEN, padding: "10vh 4vw", position: "relative" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.3em", color: TERRACOTTA }}>
            {t("流程", "PROCESS")}
          </span>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 300, fontFamily: "'Libre Baskerville', 'Noto Serif SC', serif", fontStyle: "italic", color: KILN_CHARCOAL, marginTop: 8, letterSpacing: "-0.01em" }}>
            {t("五步法", "The Five Steps")}
          </h2>
          <div style={{ width: 48, height: 1, backgroundColor: TERRACOTTA, margin: "16px auto 0" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 24 }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                border: `1px solid ${STONEWARE}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 14, fontFamily: "'Libre Baskerville', serif", color: TERRACOTTA,
              }}>
                {i + 1}
              </div>
              <h3 style={{ fontSize: 14, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: KILN_CHARCOAL, marginBottom: 8 }}>
                {t(step.zh, step.en)}
              </h3>
              <p style={{ fontSize: 11, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: STONEWARE, lineHeight: 1.6 }}>
                {t(step.descZh, step.descEn)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Gift Sets ─────────────────────────────────────────────── */

function GiftSets({ onAdd }: { onAdd: (b: CartItem) => void }) {
  const { t } = useLanguage();
  const { data: books } = trpc.book.list.useQuery();

  const bundles = [
    { nameZh: "入门三册", nameEn: "Starter Trio", ids: [0, 1, 2], color: TERRACOTTA },
    { nameZh: "深夜阅读", nameEn: "Late Night Reads", ids: [1, 3, 4], color: STONEWARE },
    { nameZh: "经典重读", nameEn: "Classics Revisited", ids: [0, 2, 4], color: CLAY },
  ];

  const available = books?.slice(0, 5) || [];

  return (
    <section style={{ backgroundColor: KILN_CHARCOAL, padding: "10vh 4vw", position: "relative" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.3em", color: TERRACOTTA }}>
            {t("礼品", "GIFTS")}
          </span>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 300, fontFamily: "'Libre Baskerville', 'Noto Serif SC', serif", fontStyle: "italic", color: RAW_LINEN, marginTop: 8, letterSpacing: "-0.01em" }}>
            {t("书礼套装", "Gift Sets")}
          </h2>
          <div style={{ width: 48, height: 1, backgroundColor: TERRACOTTA, margin: "16px auto 0" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {bundles.map((bundle, i) => {
            const items = bundle.ids.map((idx) => available[idx]).filter(Boolean);
            const total = items.reduce((sum, b) => sum + parseFloat(b?.price || "0"), 0);
            return (
              <div key={i} style={{ border: `1px solid ${TERRACOTTA}30`, padding: 24 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {items.map((b) => (
                    <div key={b.id} style={{ flex: 1, border: `1px solid ${STONEWARE}30`, aspectRatio: "3/4", overflow: "hidden" }}>
                      <SafeImage src={b.coverImage} alt={b.title} />
                    </div>
                  ))}
                </div>
                <h3 style={{ fontSize: 14, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: RAW_LINEN, marginBottom: 4 }}>
                  {t(bundle.nameZh, bundle.nameEn)}
                </h3>
                <p style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: WARM_SAND, marginBottom: 12 }}>
                  {items.length} {t("本书", "books")} · ${total.toFixed(2)}
                </p>
                <button
                  onClick={() => items.forEach((b) => onAdd(b))}
                  style={{
                    width: "100%", padding: "10px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em",
                    color: RAW_LINEN, backgroundColor: bundle.color, border: "none", cursor: "pointer",
                  }}
                >
                  {t("加入套装", "ADD SET")} →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ─────────────────────────────────────────────────── */

function Footer() {
  const { t } = useLanguage();
  const { playing, toggle } = useRainSound();
  const navigate = useNavigate();

  return (
    <footer style={{ backgroundColor: KILN_CHARCOAL, padding: "8vh 4vw 4vh", borderTop: `1px solid ${TERRACOTTA}20` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40 }}>
        <div>
          <h4 style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", color: RAW_LINEN, marginBottom: 16 }}>
            TOXICREADS
          </h4>
          <p style={{ fontSize: 11, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: WARM_SAND, lineHeight: 1.6 }}>
            {t(" uncommon 之书市集", "A market for the uncommon book")}
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em", color: TERRACOTTA, marginBottom: 16 }}>
            {t("导航", "NAVIGATE")}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => navigate("/home")} style={{ fontSize: 11, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: WARM_SAND, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
              {t("浏览", "Browse")}
            </button>
            <button onClick={() => navigate("/submit-book")} style={{ fontSize: 11, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: WARM_SAND, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
              {t("卖书", "Sell")}
            </button>
            <button onClick={() => navigate("/my-purchases")} style={{ fontSize: 11, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: WARM_SAND, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
              {t("我的购买", "My Purchases")}
            </button>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em", color: TERRACOTTA, marginBottom: 16 }}>
            {t("账户", "ACCOUNT")}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => navigate("/login")} style={{ fontSize: 11, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: WARM_SAND, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
              {t("登录", "Login")}
            </button>
            <button onClick={() => navigate("/register")} style={{ fontSize: 11, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: WARM_SAND, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
              {t("注册", "Register")}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "48px auto 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${TERRACOTTA}20`, paddingTop: 24 }}>
        <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: `${WARM_SAND}60` }}>
          © 2025 TOXICREADS
        </span>
        <button
          onClick={toggle}
          style={{
            fontSize: 9, fontFamily: "'Space Mono', monospace", color: playing ? TERRACOTTA : `${WARM_SAND}60`,
            background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em",
          }}
          title={t("雨声", "Rain sound")}
        >
          {playing ? "⏸ " + t("雨声", "RAIN") : "▶ " + t("雨声", "RAIN")}
        </button>
      </div>
    </footer>
  );
}

/* ── Main ───────────────────────────────────────────────────── */

export default function Landing() {
  const { data: books } = trpc.book.list.useQuery();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = useCallback((book: CartItem) => {
    setCart((prev) => {
      if (prev.find((b) => b.id === book.id)) return prev;
      return [...prev, book];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const allBooks = books?.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    coverImage: b.coverImage,
    price: b.price,
    category: b.category,
  })) || [];

  return (
    <div style={{ backgroundColor: RAW_LINEN }}>
      <Header cartCount={cart.length} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cart} onRemove={removeFromCart} />
      <HeroSection />
      <SeasonalCollection books={allBooks} onAdd={addToCart} />
      <AllProducts books={allBooks} onAdd={addToCart} />
      <MakersStory />
      <TheProcess />
      <GiftSets onAdd={addToCart} />
      <Footer />
    </div>
  );
}
