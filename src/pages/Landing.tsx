import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PARCHMENT = "#F5F0E8";
const INK_BLACK = "#1A1A1A";
const BRONZE = "#CD7F32";
const OXBL000D = "#4A0404";
const STONE = "#9E9A8F";
const IVORY = "#FFF8F0";

const ornamentTop = "▦ ▦ ▦ ▦ ▦ ▦ ▦ ▦ ▦ ▦ ▦ ▦ ▦ ▦ ▦ ▦";
const ornamentBottom = "▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢";

function NoiseOverlay() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.03,
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      backgroundSize: "256px 256px",
    }} />
  );
}

function PageIndicator({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 50, display: "flex", gap: 10, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 28 : 8, height: 8, borderRadius: 4,
          backgroundColor: i === current ? BRONZE : STONE,
          transition: "all 0.4s ease", cursor: "pointer",
        }} />
      ))}
    </div>
  );
}

function ArrowNav({ onPrev, onNext, canPrev, canNext }: { onPrev: () => void; onNext: () => void; canPrev: boolean; canNext: boolean }) {
  return (
    <div style={{ position: "fixed", bottom: 32, right: 40, zIndex: 50, display: "flex", gap: 12 }}>
      <button onClick={onPrev} disabled={!canPrev} style={{
        width: 40, height: 40, borderRadius: "50%", border: `1px solid ${canPrev ? BRONZE : STONE}`,
        backgroundColor: "transparent", cursor: canPrev ? "pointer" : "default", opacity: canPrev ? 1 : 0.3,
        display: "flex", alignItems: "center", justifyContent: "center", color: BRONZE, transition: "all 0.2s",
      }}>
        <ChevronLeft size={18} />
      </button>
      <button onClick={onNext} disabled={!canNext} style={{
        width: 40, height: 40, borderRadius: "50%", border: `1px solid ${canNext ? BRONZE : STONE}`,
        backgroundColor: "transparent", cursor: canNext ? "pointer" : "default", opacity: canNext ? 1 : 0.3,
        display: "flex", alignItems: "center", justifyContent: "center", color: BRONZE, transition: "all 0.2s",
      }}>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function SpreadPage({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{
      minWidth: "100vw", height: "100vh", scrollSnapAlign: "start", position: "relative",
      display: "flex", flexDirection: "column", justifyContent: "center",
      backgroundColor: PARCHMENT, overflow: "hidden", ...style,
    }}>
      <NoiseOverlay />
      {children}
    </section>
  );
}

// ── Page 1: Opening Spread ──────────────────────────────────

function OpeningSpread({ onBrowse }: { onBrowse: () => void }) {
  return (
    <SpreadPage style={{ background: `linear-gradient(135deg, ${INK_BLACK} 0%, ${OXBL000D} 50%, ${INK_BLACK} 100%)` }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.08, background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(245,240,232,0.05) 2px, rgba(245,240,232,0.05) 4px)` }} />

      <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
        <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.3em", color: BRONZE }}>TOXICREADS — EST. 2025</span>
      </div>

      <div style={{ position: "relative", zIndex: 5, padding: "0 10vw" }}>
        <div style={{ marginBottom: 48, borderTop: `1px solid ${BRONZE}40`, borderBottom: `1px solid ${BRONZE}40`, padding: "40px 0" }}>
          <p style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: "0.25em", color: BRONZE, marginBottom: 24, textAlign: "center" }}>
            A MARKETPLACE FOR THE UNCONVENTIONAL
          </p>
          <h1 style={{
            fontSize: "clamp(64px, 14vw, 140px)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 0.88,
            color: IVORY, textAlign: "center", fontFamily: "'Georgia', serif",
          }}>
            TOXIC
            <br />
            READS
          </h1>
          <p style={{ fontSize: 13, fontFamily: "'Space Mono', monospace", color: STONE, textAlign: "center", marginTop: 24, letterSpacing: "0.05em", maxWidth: 500, margin: "24px auto 0" }}>
            Buy, sell, and read uncommon books. Every purchase unlocks the full reading experience.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
          <button onClick={onBrowse} style={{
            padding: "14px 40px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em",
            color: INK_BLACK, backgroundColor: BRONZE, border: "none", cursor: "pointer",
            transition: "opacity 0.2s",
          }} onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
             onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
            EXPLORE COLLECTION
          </button>
          <button onClick={onBrowse} style={{
            padding: "14px 40px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em",
            color: BRONZE, backgroundColor: "transparent", border: `1px solid ${BRONZE}`, cursor: "pointer",
            transition: "all 0.2s",
          }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = BRONZE; e.currentTarget.style.color = INK_BLACK; }}
             onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = BRONZE; }}>
            LEARN MORE
          </button>
        </div>
      </div>

      {/* Decorative bottom band */}
      <div style={{ position: "absolute", bottom: 60, left: "10%", right: "10%", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: `${BRONZE}60`, letterSpacing: "0.15em" }}>◈  VOLUME I  ◈  SPRING 2025</span>
        <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: `${BRONZE}60`, letterSpacing: "0.15em" }}>PRICE: FREE  —  EDITION: OPEN</span>
      </div>
    </SpreadPage>
  );
}

// ── Page 2: Featured Collections ────────────────────────────

function FeaturedCollections({ books }: { books: Array<{ id: number; title: string; author: string; coverImage: string; price: string; category: string }> }) {
  const navigate = useNavigate();

  const displayed = books.slice(0, 6);
  const rows = [displayed.slice(0, 3), displayed.slice(3, 6)];

  return (
    <SpreadPage style={{ padding: "10vh 8vw", justifyContent: "flex-start" }}>
      <div style={{ position: "relative", zIndex: 5 }}>
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.3em", color: BRONZE }}>02 / FEATURED</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 300, fontFamily: "'Georgia', serif", color: INK_BLACK, marginTop: 8, letterSpacing: "-0.02em" }}>
            Selected Works
          </h2>
          <div style={{ width: 60, height: 1, backgroundColor: BRONZE, marginTop: 16 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 24 }}>
              {row.map((book) => (
                <div key={book.id} onClick={() => navigate(`/book/${book.id}`)} style={{
                  flex: 1, cursor: "pointer", position: "relative",
                  transition: "transform 0.3s ease",
                }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                   onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ border: `1px solid ${STONE}40`, aspectRatio: "3/4", overflow: "hidden", marginBottom: 8 }}>
                    <img src={book.coverImage} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <p style={{ fontSize: 11, fontFamily: "'Georgia', serif", color: INK_BLACK, marginBottom: 2, lineHeight: 1.3 }}>{book.title}</p>
                  <p style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: STONE, marginBottom: 2 }}>{book.author}</p>
                  <p style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: BRONZE }}>${book.price}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        <p style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: STONE, marginTop: 32, textAlign: "center", letterSpacing: "0.1em" }}>
          {ornamentTop}
        </p>
      </div>
    </SpreadPage>
  );
}

// ── Page 3: Timeline ────────────────────────────────────────

const timelineItems = [
  { year: "2021", title: "Concept", desc: "The idea of a peer-to-peer marketplace for rare and unconventional books is born." },
  { year: "2022", title: "Prototype", desc: "First version of the platform with basic browsing and purchasing functionality." },
  { year: "2023", title: "Reader Launch", desc: "In-browser reading experience with customizable themes and font controls." },
  { year: "2024", title: "Community", desc: "Over 100 active sellers and 500 unique books listed on the platform." },
  { year: "2025", title: "ToxicReads", desc: "Full relaunch with refined design, enhanced features, and global reach." },
];

function Timeline() {
  return (
    <SpreadPage style={{ padding: "10vh 8vw", justifyContent: "flex-start", backgroundColor: IVORY }}>
      <div style={{ position: "relative", zIndex: 5, width: "100%" }}>
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.3em", color: BRONZE }}>03 / TIMELINE</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 300, fontFamily: "'Georgia', serif", color: INK_BLACK, marginTop: 8, letterSpacing: "-0.02em" }}>
            Historical Archive
          </h2>
          <div style={{ width: 60, height: 1, backgroundColor: BRONZE, marginTop: 16 }} />
        </div>

        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 40, top: 0, bottom: 0, width: 1, backgroundColor: `${STONE}60` }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {timelineItems.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start", paddingLeft: 16 }}>
                <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: BRONZE, border: `3px solid ${IVORY}`, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: BRONZE, minWidth: 40 }}>{item.year}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 14, fontFamily: "'Georgia', serif", color: INK_BLACK, marginBottom: 4 }}>{item.title}</h3>
                  <p style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: STONE, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SpreadPage>
  );
}

// ── Page 4: Global Routes ───────────────────────────────────

const routes = [
  { region: "North America", cities: "New York · San Francisco · Toronto", artifacts: "First editions, indie zines" },
  { region: "Europe", cities: "London · Berlin · Paris · Barcelona", artifacts: "Art books, avant-garde lit" },
  { region: "Asia", cities: "Tokyo · Seoul · Singapore", artifacts: "Manga, design tomes, philosophy" },
  { region: "South America", cities: "Buenos Aires · São Paulo", artifacts: "Latinx poetry, underground press" },
  { region: "Africa & Middle East", cities: "Cape Town · Dubai · Marrakech", artifacts: "Oral histories, archival texts" },
];

function GlobalRoutes() {
  return (
    <SpreadPage style={{ padding: "10vh 8vw", justifyContent: "flex-start", background: `linear-gradient(180deg, ${PARCHMENT} 0%, #EDE8DC 100%)` }}>
      <div style={{ position: "relative", zIndex: 5, width: "100%" }}>
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.3em", color: BRONZE }}>04 / GLOBAL ROUTES</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 300, fontFamily: "'Georgia', serif", color: INK_BLACK, marginTop: 8, letterSpacing: "-0.02em" }}>
            Origins & Journeys
          </h2>
          <p style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: STONE, marginTop: 12, maxWidth: 500 }}>
            Books travel from every corner of the world. Each carries the marks of its origin — marginalia, worn spines, pressed leaves.
          </p>
          <div style={{ width: 60, height: 1, backgroundColor: BRONZE, marginTop: 16 }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {routes.map((r, i) => (
            <div key={i} style={{
              padding: 20, border: `1px solid ${STONE}30`, backgroundColor: `${IVORY}80`,
              transition: "transform 0.3s ease",
            }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.01)"}
               onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: BRONZE, letterSpacing: "0.1em" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: STONE }}>{r.region}</span>
              </div>
              <h3 style={{ fontSize: 15, fontFamily: "'Georgia', serif", color: INK_BLACK, marginBottom: 6, fontWeight: 400 }}>{r.region}</h3>
              <p style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: `${INK_BLACK}99`, marginBottom: 8 }}>{r.cities}</p>
              <p style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: STONE, fontStyle: "italic" }}>{r.artifacts}</p>
            </div>
          ))}
        </div>
      </div>
    </SpreadPage>
  );
}

// ── Page 5: Closing CTA ─────────────────────────────────────

function ClosingCTA({ onBrowse, isAuthenticated }: { onBrowse: () => void; isAuthenticated: boolean }) {
  const navigate = useNavigate();

  return (
    <SpreadPage style={{ background: `linear-gradient(135deg, ${INK_BLACK} 0%, ${OXBL000D} 50%, ${INK_BLACK} 100%)` }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.06, background: `radial-gradient(circle at 30% 50%, ${BRONZE} 0%, transparent 60%)` }} />

      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "0 10vw" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.3em", color: BRONZE, marginBottom: 24 }}>
            EPILOGUE
          </p>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 300, fontFamily: "'Georgia', serif", color: IVORY, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Begin Your Collection
          </h2>
          <p style={{ fontSize: 13, fontFamily: "'Space Mono', monospace", color: STONE, maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>
            Every book tells a story before you even open it. The annotations, the worn edges, the faint scent of paper and ink.
            <br /><br />
            Join a community of readers and collectors who value the uncommon.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          <button onClick={onBrowse} style={{
            padding: "14px 40px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em",
            color: INK_BLACK, backgroundColor: BRONZE, border: "none", cursor: "pointer",
            transition: "opacity 0.2s",
          }} onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
             onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
            BROWSE COLLECTION
          </button>
          {!isAuthenticated && (
            <button onClick={() => navigate("/register")} style={{
              padding: "14px 40px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em",
              color: BRONZE, backgroundColor: "transparent", border: `1px solid ${BRONZE}`, cursor: "pointer",
              transition: "all 0.2s",
            }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = BRONZE; e.currentTarget.style.color = INK_BLACK; }}
               onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = BRONZE; }}>
              CREATE ACCOUNT
            </button>
          )}
        </div>

        <div style={{ marginTop: 64, borderTop: `1px solid ${BRONZE}40`, paddingTop: 32, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: `${STONE}80` }}>
            TOXICREADS — 2025
          </span>
          <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: `${STONE}80` }}>
            EDITION 001 / OPEN EDITION
          </span>
          <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: `${STONE}80` }}>
            ALL RIGHTS RESERVED
          </span>
        </div>
      </div>
    </SpreadPage>
  );
}

// ── Main ────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: books } = trpc.book.list.useQuery();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const totalPages = 5;

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.children[index] as HTMLElement | undefined;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", inline: "start" });
      setPageIndex(index);
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== pageIndex) setPageIndex(index);
  }, [pageIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") scrollTo(Math.min(pageIndex + 1, totalPages - 1));
      if (e.key === "ArrowLeft") scrollTo(Math.max(pageIndex - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pageIndex, scrollTo]);

  const featuredBooks = books?.slice(0, 6) || [];

  return (
    <div style={{ backgroundColor: PARCHMENT, position: "relative" }}>
      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 48, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px",
        mixBlendMode: "difference",
      }}>
        <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em", color: IVORY }}>
          TOXICREADS
        </span>
        <button onClick={() => navigate("/home")} style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em",
          color: IVORY, background: "none", border: "none", cursor: "pointer",
        }}>
          BROWSE →
        </button>
      </header>

      {/* Horizontal scroll container */}
      <div ref={scrollRef} style={{
        display: "flex", overflowX: "auto", overflowY: "hidden", height: "100vh",
        scrollSnapType: "x mandatory", scrollBehavior: "smooth", WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none", msOverflowStyle: "none",
      }}>
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>

        <OpeningSpread onBrowse={() => navigate("/home")} />
        <FeaturedCollections books={featuredBooks} />
        <Timeline />
        <GlobalRoutes />
        <ClosingCTA onBrowse={() => navigate("/home")} isAuthenticated={isAuthenticated} />
      </div>

      {/* Navigation */}
      <div style={{ position: "fixed", bottom: 32, left: 40, zIndex: 50 }}>
        <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: BRONZE, letterSpacing: "0.1em" }}>
          {String(pageIndex + 1).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
        </span>
      </div>

      <PageIndicator total={totalPages} current={pageIndex} />
      <ArrowNav
        onPrev={() => scrollTo(pageIndex - 1)}
        onNext={() => scrollTo(pageIndex + 1)}
        canPrev={pageIndex > 0}
        canNext={pageIndex < totalPages - 1}
      />
    </div>
  );
}