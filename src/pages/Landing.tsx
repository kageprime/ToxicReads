import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import SafeImage from "@/components/SafeImage";

const RAW_LINEN = "#FAF5EB";
const KILN_CHARCOAL = "#2C1810";
const TERRACOTTA = "#B85C3C";
const STONEWARE = "#8B7355";
const WARM_SAND = "#D4C4A8";
const CLAY = "#C86848";

function NoiseOverlay() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.025,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundSize: "256px 256px",
    }} />
  );
}

function SpreadPage({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{
      minHeight: "100vh", position: "relative",
      display: "flex", flexDirection: "column", justifyContent: "center",
      backgroundColor: RAW_LINEN, overflow: "hidden", ...style,
    }}>
      {children}
    </section>
  );
}

function ToxicLogo() {
  const letterStyle: React.CSSProperties = {
    fontSize: "clamp(48px, 10vw, 96px)",
    fontWeight: 700,
    fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif",
    color: RAW_LINEN,
    WebkitTextStroke: "3px #1A1A1A",
    letterSpacing: "0.02em",
    lineHeight: 1,
  };

  const part1 = "TOXIC".split("").map((ch, i) => (
    <span key={`t${i}`} style={{
      ...letterStyle,
      display: "inline-block",
      transform: `rotate(${(Math.sin(i * 1.7) * 5).toFixed(1)}deg) translateY(${Math.abs(Math.cos(i * 1.3)) * 2}px)`,
    }}>
      {ch}
    </span>
  ));

  const part2 = "READS".split("").map((ch, i) => (
    <span key={`r${i}`} style={{
      ...letterStyle,
      display: "inline-block",
      transform: `rotate(${(Math.sin((i + 5) * 1.4) * 6).toFixed(1)}deg) translateY(${Math.abs(Math.cos((i + 5) * 1.2)) * 3}px)`,
    }}>
      {ch}
    </span>
  ));

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: "0.04em",
      rowGap: "8px",
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.02em" }}>{part1}</span>
      <span style={{
        fontFamily: "'Libre Baskerville', serif",
        fontStyle: "italic",
        fontSize: "clamp(32px, 7vw, 72px)",
        color: RAW_LINEN,
        WebkitTextStroke: "2px #1A1A1A",
        display: "inline-block",
        transform: "rotate(8deg) translateY(-4px)",
        padding: "0 0.1em",
        lineHeight: 1,
      }}>
        &amp;
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.02em" }}>{part2}</span>
    </div>
  );
}

function HeroBg() {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 1, overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(160deg, ${KILN_CHARCOAL} 0%, #3D2010 35%, ${TERRACOTTA}60 65%, ${STONEWARE}40 100%)`,
      }} />
      <div style={{
        position: "absolute", inset: 0, opacity: 0.15,
        background: `radial-gradient(ellipse at 70% 40%, ${CLAY}40 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, ${WARM_SAND}30 0%, transparent 50%)`,
        animation: "ambientShift 12s ease-in-out infinite alternate",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
        background: `linear-gradient(0deg, ${RAW_LINEN}15 0%, transparent 100%)`,
      }} />
      <style>{`
        @keyframes ambientShift {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.1) translate(-2%, -1%); }
        }
      `}</style>
    </div>
  );
}

function FloatingWords() {
  const words = ["PAGES", "INK", "STORY", "BINDING", "CHAPTER", "MARGIN", "FOLIO", "PRESS"];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {words.map((w, i) => (
        <span key={i} style={{
          position: "absolute",
          fontFamily: "'Source Serif Pro', serif",
          fontSize: `${8 + (i % 3) * 4}px`,
          color: `${RAW_LINEN}15`,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontWeight: 300,
          top: `${15 + i * 9}%`,
          left: `${5 + (i * 11) % 85}%`,
          transform: `rotate(${-15 + i * 12}deg)`,
          animation: `drift ${12 + i * 3}s ease-in-out infinite alternate`,
          whiteSpace: "nowrap",
        }}>
          {w}
        </span>
      ))}
      <style>{`
        @keyframes drift {
          0% { transform: rotate(${-15}deg) translate(0, 0); opacity: 0.3; }
          100% { transform: rotate(${-15 + 8}deg) translate(${10 + 20}px, ${-10 + 15}px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

// ── Page 1: Hero ─────────────────────────────────────────────

function OpeningSpread({ onBrowse }: { onBrowse: () => void }) {
  return (
    <SpreadPage style={{ background: KILN_CHARCOAL }}>
      <HeroBg />
      <FloatingWords />

      <div style={{ position: "relative", zIndex: 5, padding: "0 8vw" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{
            fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.35em",
            color: WARM_SAND, marginBottom: 32, textTransform: "uppercase",
          }}>
            A Market for the Uncommon Book
          </p>

          <ToxicLogo />

          <p style={{
            fontSize: 13, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif",
            color: WARM_SAND, textAlign: "center", marginTop: 32, maxWidth: 480,
            margin: "32px auto 0", lineHeight: 1.7, fontWeight: 300,
          }}>
            Buy, sell, and read uncommon books. Every purchase unlocks&nbsp;the&nbsp;full&nbsp;reading&nbsp;experience.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <button onClick={onBrowse} style={{
            padding: "14px 40px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em",
            color: KILN_CHARCOAL, backgroundColor: TERRACOTTA, border: "none", cursor: "pointer",
            transition: "opacity 0.2s",
          }} onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
             onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
            EXPLORE COLLECTION
          </button>
          <button onClick={onBrowse} style={{
            padding: "14px 40px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em",
            color: TERRACOTTA, backgroundColor: "transparent", border: `1px solid ${TERRACOTTA}`, cursor: "pointer",
            transition: "all 0.2s",
          }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = TERRACOTTA; e.currentTarget.style.color = KILN_CHARCOAL; }}
             onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = TERRACOTTA; }}>
            LEARN MORE
          </button>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 48, left: "10%", right: "10%", zIndex: 5, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: `${WARM_SAND}60`, letterSpacing: "0.15em" }}>TOXICREADS — EST. 2025</span>
        <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: `${WARM_SAND}60`, letterSpacing: "0.15em" }}>OPEN EDITION</span>
      </div>
    </SpreadPage>
  );
}

// ── Page 2: Featured Collections ────────────────────────────

function FeaturedCollections({ books }: { books: Array<{ id: number; title: string; author: string; coverImage: string; price: string; category: string }> }) {
  const navigate = useNavigate();

  const displayed = books.slice(0, 6);

  return (
    <SpreadPage style={{ padding: "10vh 8vw", justifyContent: "flex-start", backgroundColor: RAW_LINEN }}>
      <NoiseOverlay />
      <div style={{ position: "relative", zIndex: 5 }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.3em", color: TERRACOTTA }}>FEATURED</span>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 300, fontFamily: "'Libre Baskerville', 'Noto Serif SC', serif", fontStyle: "italic", color: KILN_CHARCOAL, marginTop: 8, letterSpacing: "-0.01em" }}>
            Selected Works
          </h2>
          <div style={{ width: 48, height: 1, backgroundColor: TERRACOTTA, marginTop: 16 }} />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {displayed.map((book) => (
            <div key={book.id} onClick={() => navigate(`/book/${book.id}`)} style={{
              cursor: "pointer", position: "relative",
              transition: "transform 0.3s ease",
            }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
               onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ border: `1px solid ${STONEWARE}30`, aspectRatio: "3/4", overflow: "hidden", marginBottom: 6 }}>
                <SafeImage src={book.coverImage} alt={book.title} />
              </div>
              <p style={{ fontSize: 11, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: KILN_CHARCOAL, marginBottom: 2, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</p>
              <p style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: STONEWARE, marginBottom: 2 }}>{book.author}</p>
              <p style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TERRACOTTA }}>${book.price}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => navigate("/home")} style={{
            padding: "12px 36px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em",
            color: RAW_LINEN, backgroundColor: KILN_CHARCOAL, border: "none", cursor: "pointer",
            transition: "opacity 0.2s",
          }} onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
             onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
            BROWSE ALL →
          </button>
        </div>
      </div>
    </SpreadPage>
  );
}

// ── Page 3: Closing CTA ─────────────────────────────────────

function ClosingCTA({ onBrowse, isAuthenticated }: { onBrowse: () => void; isAuthenticated: boolean }) {
  const navigate = useNavigate();

  return (
    <SpreadPage style={{ background: `linear-gradient(160deg, ${KILN_CHARCOAL} 0%, #3D2010 50%, ${KILN_CHARCOAL} 100%)` }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, background: `radial-gradient(circle at 30% 50%, ${CLAY} 0%, transparent 60%)` }} />

      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "0 10vw" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: "0.3em", color: TERRACOTTA, marginBottom: 24 }}>
            EPILOGUE
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 56px)", fontWeight: 300, fontFamily: "'Libre Baskerville', 'Noto Serif SC', serif", fontStyle: "italic", color: RAW_LINEN, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Begin Your Collection
          </h2>
          <p style={{ fontSize: 13, fontFamily: "'Source Serif Pro', 'Noto Serif SC', serif", color: WARM_SAND, maxWidth: 480, margin: "0 auto", lineHeight: 1.8, fontWeight: 300 }}>
            Every book tells a story before you even open it. The annotations, the worn edges, the faint scent of paper and ink.
            <br /><br />
            Join a community of readers and collectors who value the uncommon.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <button onClick={onBrowse} style={{
            padding: "14px 40px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em",
            color: KILN_CHARCOAL, backgroundColor: TERRACOTTA, border: "none", cursor: "pointer",
            transition: "opacity 0.2s",
          }} onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
             onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
            BROWSE COLLECTION
          </button>
          {!isAuthenticated && (
            <button onClick={() => navigate("/register")} style={{
              padding: "14px 40px", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em",
              color: TERRACOTTA, backgroundColor: "transparent", border: `1px solid ${TERRACOTTA}`, cursor: "pointer",
              transition: "all 0.2s",
            }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = TERRACOTTA; e.currentTarget.style.color = KILN_CHARCOAL; }}
               onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = TERRACOTTA; }}>
              CREATE ACCOUNT
            </button>
          )}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 40, left: "10%", right: "10%", zIndex: 5, borderTop: `1px solid ${TERRACOTTA}40`, paddingTop: 24, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: `${WARM_SAND}80` }}>
          TOXICREADS — 2025
        </span>
        <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: `${WARM_SAND}80` }}>
          EDITION 001
        </span>
        <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: `${WARM_SAND}80` }}>
          ALL RIGHTS RESERVED
        </span>
      </div>
    </SpreadPage>
  );
}

// ── Main ────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: books } = trpc.book.list.useQuery();

  const featuredBooks = books?.slice(0, 6) || [];

  return (
    <div style={{ backgroundColor: RAW_LINEN }}>
      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 48, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px",
      }}>
        <span style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em",
          color: RAW_LINEN, mixBlendMode: "difference",
        }}>
          TOXICREADS
        </span>
        <button onClick={() => navigate("/home")} style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em",
          color: RAW_LINEN, background: "none", border: "none", cursor: "pointer",
          mixBlendMode: "difference",
        }}>
          BROWSE →
        </button>
      </header>

      {/* Vertical stack */}
      <OpeningSpread onBrowse={() => navigate("/home")} />
      <FeaturedCollections books={featuredBooks} />
      <ClosingCTA onBrowse={() => navigate("/home")} isAuthenticated={isAuthenticated} />
    </div>
  );
}
