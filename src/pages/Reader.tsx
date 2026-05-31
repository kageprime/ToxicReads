import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, List, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { parseOutline, type OutlineEntry } from "@/lib/outline";

export default function Reader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showOutline, setShowOutline] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: book, isLoading, error } = trpc.book.read.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id },
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const paragraphs = useMemo(() => book?.content?.split("\n\n") ?? [], [book?.content]);
  const outline = useMemo(() => book?.content ? parseOutline(book.content) : [], [book?.content]);

  // Track visible chapter via IntersectionObserver
  useEffect(() => {
    if (!showOutline || !contentRef.current) return;

    const markers = contentRef.current.querySelectorAll("[data-para]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.getAttribute("data-para") || "0");
            let chapterIdx = 0;
            for (let i = outline.length - 1; i >= 0; i--) {
              if (outline[i].index <= idx) { chapterIdx = i; break; }
            }
            setActiveChapter(chapterIdx);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );

    markers.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [showOutline, outline]);

  const scrollToChapter = (entry: OutlineEntry) => {
    const el = contentRef.current?.querySelector(`[data-para="${entry.index}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme === "dark" ? "#1a1a1a" : "#faf8f5" }}>
        <span style={{ fontSize: "12px", fontFamily: "'Space Mono', monospace", color: "#999" }}>LOADING...</span>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: theme === "dark" ? "#1a1a1a" : "#faf8f5" }}>
        <span style={{ fontSize: "14px", color: theme === "dark" ? "#999" : "#666" }}>Unable to load book</span>
        <button onClick={() => navigate("/my-purchases")} style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: theme === "dark" ? "#ccc" : "#333", background: "none", border: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, padding: "8px 16px", cursor: "pointer" }}>
          Back
        </button>
      </div>
    );
  }

  const bgColor = theme === "dark" ? "#1a1a1a" : "#faf8f5";
  const textColor = theme === "dark" ? "#e8e6e3" : "#2a2520";
  const headerBg = theme === "dark" ? "#141414" : "#fff";
  const borderColor = theme === "dark" ? "#333" : "#e8e4df";
  const outlineBg = theme === "dark" ? "#141414" : "#fff";

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 z-50" style={{ height: "48px", backgroundColor: headerBg, borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/my-purchases")} className="p-1.5 rounded hover:opacity-70 transition-opacity">
            <ChevronLeft size={18} style={{ color: textColor }} />
          </button>
          <span style={{ fontSize: "11px", color: theme === "dark" ? "#999" : "#666", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</span>
        </div>
        <div className="flex items-center gap-1">
          {outline.length > 0 && (
            <button onClick={() => setShowOutline(!showOutline)} style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: textColor, background: "none", border: `1px solid ${showOutline ? textColor : borderColor}`, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
              <List size={12} /> Outline
            </button>
          )}
          <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: textColor, background: "none", border: `1px solid ${borderColor}`, padding: "4px 8px", cursor: "pointer" }}>A-</button>
          <span style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: theme === "dark" ? "#666" : "#999", minWidth: "24px", textAlign: "center" }}>{fontSize}</span>
          <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: textColor, background: "none", border: `1px solid ${borderColor}`, padding: "4px 8px", cursor: "pointer" }}>A+</button>
          <span style={{ fontSize: "10px", color: theme === "dark" ? "#666" : "#999" }}>|</span>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: textColor, background: "none", border: `1px solid ${borderColor}`, padding: "4px 10px", cursor: "pointer" }}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button onClick={logout} className="p-1.5 rounded hover:opacity-70 transition-opacity">
            <LogOut size={16} style={{ color: textColor }} />
          </button>
        </div>
      </header>

      <div className="flex" style={{ paddingTop: "48px", minHeight: "100vh" }}>
        {/* Outline Sidebar */}
        {showOutline && outline.length > 0 && (
          <aside
            className="fixed left-0 z-40 overflow-y-auto"
            style={{
              top: "48px", bottom: 0, width: "220px",
              backgroundColor: outlineBg, borderRight: `1px solid ${borderColor}`,
            }}
          >
            <div style={{ padding: "16px" }}>
              <h3 style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: theme === "dark" ? "#666" : "#999", marginBottom: "12px" }}>
                Contents
              </h3>
              <div className="space-y-1">
                {outline.map((entry, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToChapter(entry)}
                    style={{
                      display: "block", width: "100%", textAlign: "left", padding: "6px 8px",
                      fontSize: "11px", lineHeight: 1.4, fontFamily: "'Georgia', serif",
                      color: i === activeChapter ? textColor : theme === "dark" ? "#888" : "#888",
                      background: i === activeChapter ? (theme === "dark" ? "#2a2a2a" : "#f0ede8") : "none",
                      border: "none", cursor: "pointer", borderRadius: "2px",
                    }}
                  >
                    {entry.title}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Content */}
        <main style={{ flex: 1, paddingBottom: "120px", marginLeft: showOutline && outline.length > 0 ? "220px" : "0", transition: "margin-left 0.2s" }}>
          <article style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 32px" }}>
            {/* Book header */}
            <div style={{ marginBottom: "48px", paddingBottom: "32px", borderBottom: `1px solid ${borderColor}` }}>
              <h1 style={{ fontSize: "28px", fontWeight: 400, color: textColor, marginBottom: "8px", lineHeight: 1.3, fontFamily: "'Georgia', serif" }}>{book.title}</h1>
              <p style={{ fontSize: "14px", color: theme === "dark" ? "#888" : "#888", fontStyle: "italic" }}>by {book.author}</p>
            </div>

            <div ref={contentRef} style={{ fontSize: `${fontSize}px`, lineHeight: 1.8, color: textColor, fontFamily: "'Georgia', serif" }}>
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, i) => (
                  <p key={i} data-para={i} style={{ marginBottom: "1.5em" }}>{paragraph}</p>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: theme === "dark" ? "#666" : "#999" }}>
                  <p style={{ fontSize: "14px" }}>Content not available for this book.</p>
                </div>
              )}
            </div>
          </article>
        </main>
      </div>

      {/* Progress indicator */}
      <div className="fixed bottom-0 left-0 right-0 h-1" style={{ backgroundColor: borderColor }}>
        <div style={{ width: "30%", height: "100%", backgroundColor: theme === "dark" ? "#666" : "#ccc" }} />
      </div>
    </div>
  );
}