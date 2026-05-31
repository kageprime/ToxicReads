import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, List, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { parseOutline, type OutlineEntry } from "@/lib/outline";

export default function Reader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showOutline, setShowOutline] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [loadedChunks, setLoadedChunks] = useState<Record<number, string>>({});
  const [token, setToken] = useState<string | null>(null);
  const [totalChunks, setTotalChunks] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingChunksRef = useRef<Set<number>>(new Set());
  const hasMoreRef = useRef(false);
  const loadedCountRef = useRef(0);
  const isRestoringRef = useRef(false);
  const lastSaveRef = useRef(0);
  const savedChunkRef = useRef(0);
  const savedScrollRef = useRef(0);

  const { data: readData, isLoading, error, refetch: refetchBook } = trpc.book.read.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id && isAuthenticated },
  );

  const readChunk = trpc.book.readChunk.useMutation();
  const saveMutation = trpc.book.saveProgress.useMutation();

  const book = readData;

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Bootstrap from book.read response
  useEffect(() => {
    if (readData) {
      setLoadedChunks({ 0: readData.chunk });
      setToken(readData.token);
      setTotalChunks(readData.chunks);
    }
  }, [readData]);

  // Re-fetch book.read when token becomes null (expired)
  useEffect(() => {
    if (token === null && !isLoading && id) {
      refetchBook();
    }
  }, [token, isLoading, id, refetchBook]);

  // Restore saved reading progress (localStorage + server)
  useEffect(() => {
    if (!token || !id || !isAuthenticated || !readData) return;
    const bookId = parseInt(id);
    let savedChunk = 0;
    let savedScroll = 0;

    try {
      const cached = localStorage.getItem(`tr_progress_${bookId}`);
      if (cached) {
        const p = JSON.parse(cached);
        savedChunk = p.chunk || 0;
        savedScroll = p.scrollPercent || 0;
      }
    } catch {}

    (async () => {
      try {
        const res = await fetch(`/api/trpc/book.getProgress?batch=1&input=${encodeURIComponent(JSON.stringify([{ bookId }]))}`, { credentials: "include" });
        const json = await res.json();
        const server = json?.[0]?.result?.data;
        if (server && server.chunk > 0 && (!savedChunk || server.updatedAt > savedChunk)) {
          savedChunk = server.chunk;
          savedScroll = server.scrollPercent;
        }
      } catch {}

      if (savedChunk <= 0) return;
      isRestoringRef.current = true;
      savedChunkRef.current = savedChunk;
      savedScrollRef.current = savedScroll;

      const loading = loadingChunksRef.current;
      const needed: number[] = [];
      for (let i = 1; i <= savedChunk; i++) {
        if (!loading.has(i)) loading.add(i);
        needed.push(i);
      }

      try {
        const results = await Promise.all(
          needed.map((chunkIdx) =>
            readChunk.mutateAsync({ token, chunk: chunkIdx }),
          ),
        );
        const additions: Record<number, string> = {};
        for (const r of results) {
          loading.delete(r.index);
          additions[r.index] = r.chunk;
        }
        setLoadedChunks((prev) => ({ ...prev, ...additions }));
      } catch {
        for (const i of needed) loading.delete(i);
        isRestoringRef.current = false;
        return;
      }
    })();
  }, [token, id, isAuthenticated, readData, readChunk]);

  // Scroll to saved position once enough chunks are loaded
  useEffect(() => {
    if (!isRestoringRef.current || !savedChunkRef.current) return;
    const loaded = Object.keys(loadedChunks).length;
    if (loaded <= savedChunkRef.current) return;
    const scrollTarget = savedScrollRef.current;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        if (doc.scrollHeight > window.innerHeight) {
          window.scrollTo(0, Math.round((scrollTarget / 100) * (doc.scrollHeight - window.innerHeight)));
        }
        isRestoringRef.current = false;
      });
    });
  }, [loadedChunks]);

  // Single persistent observer — rebuilt only when token or loadedChunks changes meaningfully
  useEffect(() => {
    if (!token) return;

    const loading = loadingChunksRef.current;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!hasMoreRef.current) continue;
          if (isRestoringRef.current) continue;

          // Read current loadedChunks from a ref to avoid stale closure
          setLoadedChunks((prev) => {
            const nextChunk = Object.keys(prev).length;
            if (nextChunk >= totalChunks) {
              hasMoreRef.current = false;
              return prev;
            }

            // Load the next chunk if not already loading
            if (!loading.has(nextChunk)) {
              loading.add(nextChunk);
              readChunk.mutate(
                { token, chunk: nextChunk },
                {
                  onSuccess: (data) => {
                    loading.delete(data.index);
                    setLoadedChunks((p) => ({ ...p, [data.index]: data.chunk }));
                  },
                  onError: () => {
                    loading.delete(nextChunk);
                    setToken(null);
                  },
                },
              );
            }

            // Also prefetch one more ahead
            const ahead = nextChunk + 1;
            if (ahead < totalChunks && !loading.has(ahead)) {
              loading.add(ahead);
              readChunk.mutate(
                { token, chunk: ahead },
                {
                  onSuccess: (data) => {
                    loading.delete(data.index);
                    setLoadedChunks((p) => ({ ...p, [data.index]: data.chunk }));
                  },
                  onError: () => {
                    loading.delete(ahead);
                  },
                },
              );
            }

            return prev;
          });
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [token, readChunk, totalChunks]);

  // Determine if more chunks exist after each loadedChunks update
  hasMoreRef.current = Object.keys(loadedChunks).length < totalChunks;
  loadedCountRef.current = Object.keys(loadedChunks).length;

  const allContent = useMemo(() => {
    const indices = Object.keys(loadedChunks).map(Number).sort((a, b) => a - b);
    return indices.map((i) => loadedChunks[i]).join("");
  }, [loadedChunks]);

  const paragraphs = useMemo(() => allContent.split("\n\n"), [allContent]);
  const outline = useMemo(() => allContent ? parseOutline(allContent) : [], [allContent]);

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
  }, [showOutline, outline, paragraphs.length]);

  const scrollToChapter = (entry: OutlineEntry) => {
    const el = contentRef.current?.querySelector(`[data-para="${entry.index}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Anti-scrape: disable copy and context menu ──────────────

  const prevent = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  useEffect(() => {
    document.addEventListener("copy", prevent, true);
    document.addEventListener("contextmenu", prevent, true);
    document.addEventListener("cut", prevent, true);
    return () => {
      document.removeEventListener("copy", prevent, true);
      document.removeEventListener("contextmenu", prevent, true);
      document.removeEventListener("cut", prevent, true);
    };
  }, [prevent]);

  // ── Track scroll position and save reading progress ─────────
  useEffect(() => {
    if (!isAuthenticated || !id) return;
    const bookId = parseInt(id);

    const save = () => {
      if (isRestoringRef.current) return;
      const doc = document.documentElement;
      if (doc.scrollHeight <= window.innerHeight) return;
      const pct = Math.round((window.scrollY / (doc.scrollHeight - window.innerHeight)) * 100);
      const topChunk = Math.max(0, loadedCountRef.current - 1);

      try {
        localStorage.setItem(`tr_progress_${bookId}`, JSON.stringify({
          chunk: topChunk, scrollPercent: pct, updatedAt: Date.now(),
        }));
      } catch {}

      const now = Date.now();
      if (now - lastSaveRef.current < 5000) return;
      lastSaveRef.current = now;
      saveMutation.mutate({ bookId, chunk: topChunk, scrollPercent: pct });
    };

    const onScroll = () => save();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onLeave = () => save();
    window.addEventListener("beforeunload", onLeave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") save();
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeunload", onLeave);
      save();
    };
  }, [isAuthenticated, id, saveMutation]);

  // Clear loaded content on unmount
  useEffect(() => {
    return () => {
      setLoadedChunks({});
      setToken(null);
    };
  }, []);

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
  const watermarkColor = theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const loadedCount = Object.keys(loadedChunks).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, position: "relative" }}>
      {/* Watermark overlay */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none", overflow: "hidden",
          fontSize: "12px", fontFamily: "'Space Mono', monospace", color: watermarkColor,
          whiteSpace: "pre", userSelect: "none",
        }}
      >
        {Array.from({ length: 40 }).map((_, ri) => (
          <div key={ri} style={{ textAlign: "center", lineHeight: "2.5", transform: "rotate(-20deg)", opacity: 0.5 }}>
            {`TOXICREADS · ${user?.name || user?.username || "Reader"} · ${new Date().toISOString().slice(0, 10)} `.repeat(15)}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between px-2 sm:px-4 z-50" style={{ height: "48px", backgroundColor: headerBg, borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <button onClick={() => navigate("/my-purchases")} className="p-1.5 rounded hover:opacity-70 transition-opacity shrink-0">
            <ChevronLeft size={18} style={{ color: textColor }} />
          </button>
          <span className="hidden sm:inline" style={{ fontSize: "11px", color: theme === "dark" ? "#999" : "#666", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</span>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {outline.length > 0 && (
            <button onClick={() => setShowOutline(!showOutline)} style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: textColor, background: "none", border: `1px solid ${showOutline ? textColor : borderColor}`, padding: "4px 6px sm:px-8", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px sm:gap-4px" }} title="Outline">
              <List size={12} /> <span className="hidden sm:inline">Outline</span>
            </button>
          )}
          <span className="hidden sm:flex items-center gap-0.5 sm:gap-1">
            <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: textColor, background: "none", border: `1px solid ${borderColor}`, padding: "4px 5px sm:px-8", cursor: "pointer" }} title="Decrease font">A−</button>
            <span style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: theme === "dark" ? "#666" : "#999", minWidth: "20px sm:min-w-24px", textAlign: "center" }}>{fontSize}</span>
            <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: textColor, background: "none", border: `1px solid ${borderColor}`, padding: "4px 5px sm:px-8", cursor: "pointer" }} title="Increase font">A+</button>
            <span style={{ fontSize: "10px", color: theme === "dark" ? "#666" : "#999" }}>|</span>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: textColor, background: "none", border: `1px solid ${borderColor}`, padding: "4px 6px sm:px-10", cursor: "pointer" }} title={theme === "dark" ? "Light mode" : "Dark mode"}>
              <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
              <span className="sm:hidden">{theme === "dark" ? "☀" : "☾"}</span>
            </button>
          </span>
          <button onClick={logout} className="p-1.5 rounded hover:opacity-70 transition-opacity shrink-0">
            <LogOut size={16} style={{ color: textColor }} />
          </button>
        </div>
      </header>

      <div className="flex" style={{ paddingTop: "48px", minHeight: "100vh" }}>
        {/* Outline Sidebar */}
        {showOutline && outline.length > 0 && (
          <>
            {/* Mobile overlay */}
            <div className="sm:hidden fixed inset-0 z-30" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => setShowOutline(false)} />
            <aside
              className="fixed left-0 z-40 overflow-y-auto sm:block"
              style={{
                top: "48px", bottom: 0, width: "min(80vw, 220px)",
                backgroundColor: outlineBg, borderRight: `1px solid ${borderColor}`,
                transform: "translateX(0)", transition: "transform 0.2s",
              }}
            >
              <div style={{ padding: "16px" }}>
                <div className="flex items-center justify-between sm:justify-start mb-3">
                  <h3 style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: theme === "dark" ? "#666" : "#999" }}>
                    Contents
                  </h3>
                  <button className="sm:hidden p-1" onClick={() => setShowOutline(false)} style={{ color: theme === "dark" ? "#999" : "#666", fontSize: "16px", lineHeight: 1 }}>✕</button>
                </div>
                <div className="space-y-1">
                  {outline.map((entry, i) => (
                    <button
                      key={i}
                      onClick={() => { scrollToChapter(entry); if (window.innerWidth < 640) setShowOutline(false); }}
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
          </>
        )}

        {/* Content */}
        <main style={{ flex: 1, paddingBottom: "120px", transition: "margin-left 0.2s" }} className={showOutline && outline.length > 0 ? "md:ml-[220px]" : ""}>
          <article style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 32px" }}>
            {/* Book header */}
            <div style={{ marginBottom: "48px", paddingBottom: "32px", borderBottom: `1px solid ${borderColor}` }}>
              <h1 style={{ fontSize: "28px", fontWeight: 400, color: textColor, marginBottom: "8px", lineHeight: 1.3, fontFamily: "'Georgia', serif" }}>{book.title}</h1>
              <p style={{ fontSize: "14px", color: theme === "dark" ? "#888" : "#888", fontStyle: "italic" }}>by {book.author}</p>
            </div>

            <div
              ref={contentRef}
              style={{
                fontSize: `${fontSize}px`, lineHeight: 1.8, color: textColor, fontFamily: "'Georgia', serif",
                userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none",
              }}
            >
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

            {/* Sentinel — triggers next chunk load */}
            {hasMoreRef.current && (
              <div ref={sentinelRef} style={{ height: 1 }} />
            )}
          </article>
        </main>
      </div>

      {/* Mobile bottom toolbar (font controls) */}
      <div className="sm:hidden fixed bottom-1 left-0 right-0 z-40 flex items-center justify-center gap-2" style={{ paddingBottom: "env(safe-area-inset-bottom, 4px)" }}>
        <div style={{ backgroundColor: headerBg, border: `1px solid ${borderColor}`, borderRadius: "20px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} style={{ fontSize: "13px", fontFamily: "'Space Mono', monospace", color: textColor, background: "none", border: "none", cursor: "pointer", padding: "4px", lineHeight: 1 }} title="Decrease font">A−</button>
          <span style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: theme === "dark" ? "#666" : "#999", minWidth: "22px", textAlign: "center" }}>{fontSize}</span>
          <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} style={{ fontSize: "13px", fontFamily: "'Space Mono', monospace", color: textColor, background: "none", border: "none", cursor: "pointer", padding: "4px", lineHeight: 1 }} title="Increase font">A+</button>
          <span style={{ fontSize: "14px", color: theme === "dark" ? "#444" : "#ddd" }}>|</span>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ fontSize: "13px", background: "none", border: "none", cursor: "pointer", padding: "4px", lineHeight: 1 }} title={theme === "dark" ? "Light mode" : "Dark mode"}>
            {theme === "dark" ? <span style={{ color: "#e8e6e3" }}>☀</span> : <span style={{ color: "#555" }}>☾</span>}
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="fixed bottom-0 left-0 right-0 h-1" style={{ backgroundColor: borderColor, marginBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div style={{ width: `${Math.min(100, (loadedCount / Math.max(totalChunks, 1)) * 100)}%`, height: "100%", backgroundColor: theme === "dark" ? "#666" : "#ccc" }} />
      </div>
    </div>
  );
}