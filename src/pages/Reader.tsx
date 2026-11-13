import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PiCaretLeft, PiList, PiSignOut, PiSun, PiMoon, PiX, PiHeadphones } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { parseOutline, type OutlineEntry } from "@/lib/outline";
import { ReaderSkeleton } from "@/components/Skeleton";
import ListenBar from "@/components/ListenBar";
import {
  buildSpeakQueue,
  useTextToSpeechEngine,
  useTTSVoices,
} from "@/hooks/useTextToSpeech";

export default function Reader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [fontSize, setFontSize] = useState(24);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showOutline, setShowOutline] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [loadedChunks, setLoadedChunks] = useState<Record<number, string>>({});
  const [token, setToken] = useState<string | null>(null);
  const [totalChunks, setTotalChunks] = useState(0);
  // ── Listen (TTS) state ──────────────────────────────────────
  const [listenOpen, setListenOpen] = useState(false);
  const [listenPara, setListenPara] = useState(0);
  const [ttsRate, setTtsRate] = useState(() => {
    try {
      const r = Number(localStorage.getItem("tr_tts_rate"));
      return [0.75, 1, 1.25, 1.5, 2].includes(r) ? r : 1;
    } catch {
      /* storage blocked — fall back to 1x */
      return 1;
    }
  });
  const [ttsVoiceURI, setTtsVoiceURI] = useState(() => {
    try {
      return localStorage.getItem("tr_tts_voice") || "";
    } catch {
      /* storage blocked — fall back to default voice */
      return "";
    }
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingChunksRef = useRef<Set<number>>(new Set());
  const hasMoreRef = useRef(false);
  const loadedCountRef = useRef(0);
  const isRestoringRef = useRef(false);
  const lastSaveRef = useRef(0);
  const savedChunkRef = useRef(0);
  const savedScrollRef = useRef(0);

  const {
    data: readData,
    isLoading,
    error,
    refetch: refetchBook,
  } = trpc.book.read.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id && isAuthenticated }
  );

  const readChunk = trpc.book.readChunk.useMutation();
  const saveMutation = trpc.book.saveProgress.useMutation();
  const saveListenMutation = trpc.book.saveListenProgress.useMutation();

  const book = readData;
  const bookId = id ? parseInt(id) : 0;

  const { data: listenProgressData } = trpc.book.getListenProgress.useQuery(
    { bookId },
    { enabled: !!id && isAuthenticated && bookId > 0 }
  );

  const ttsVoices = useTTSVoices();
  const ttsVoice = useMemo(
    () => ttsVoices.find(v => v.voiceURI === ttsVoiceURI) ?? null,
    [ttsVoices, ttsVoiceURI]
  );

  const listenParaRef = useRef(0);
  const lastQueuedParaRef = useRef(-1);
  const lastListenSaveRef = useRef(0);
  const paragraphsRef = useRef<string[]>([]);

  useEffect(() => {
    listenParaRef.current = listenPara;
  }, [listenPara]);

  const persistListenPosition = useCallback(
    (para: number) => {
      if (!bookId) return;
      try {
        localStorage.setItem(
          `tr_audio_${bookId}`,
          JSON.stringify({ paragraph: para, updatedAt: Date.now() })
        );
      } catch {
        /* storage unavailable — server copy still saves below */
      }
      const now = Date.now();
      if (now - lastListenSaveRef.current < 5000) return;
      lastListenSaveRef.current = now;
      saveListenMutation.mutate({ bookId, paragraph: para });
    },
    [bookId, saveListenMutation]
  );

  const tts = useTextToSpeechEngine({
    voice: ttsVoice,
    rate: ttsRate,
    onParagraph: useCallback(
      (paraIndex: number) => {
        setListenPara(paraIndex);
        persistListenPosition(paraIndex);
      },
      [persistListenPosition]
    ),
    onEnd: useCallback(() => {
      // Queue exhausted — the append effect resumes if more chunks stream
      // in; otherwise playback simply stops. Intentionally a no-op.
      return undefined;
    }, []),
  });

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
        const res = await fetch(
          `/api/trpc/book.getProgress?batch=1&input=${encodeURIComponent(JSON.stringify([{ bookId }]))}`,
          { credentials: "include" }
        );
        const json = await res.json();
        const server = json?.[0]?.result?.data;
        if (
          server &&
          server.chunk > 0 &&
          (!savedChunk || server.updatedAt > savedChunk)
        ) {
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
          needed.map(chunkIdx =>
            readChunk.mutateAsync({ token, chunk: chunkIdx })
          )
        );
        const additions: Record<number, string> = {};
        for (const r of results) {
          loading.delete(r.index);
          additions[r.index] = r.chunk;
        }
        setLoadedChunks(prev => ({ ...prev, ...additions }));
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
          window.scrollTo(
            0,
            Math.round(
              (scrollTarget / 100) * (doc.scrollHeight - window.innerHeight)
            )
          );
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
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!hasMoreRef.current) continue;
          if (isRestoringRef.current) continue;

          // Read current loadedChunks from a ref to avoid stale closure
          setLoadedChunks(prev => {
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
                  onSuccess: data => {
                    loading.delete(data.index);
                    setLoadedChunks(p => ({ ...p, [data.index]: data.chunk }));
                  },
                  onError: () => {
                    loading.delete(nextChunk);
                    setToken(null);
                  },
                }
              );
            }

            // Also prefetch one more ahead
            const ahead = nextChunk + 1;
            if (ahead < totalChunks && !loading.has(ahead)) {
              loading.add(ahead);
              readChunk.mutate(
                { token, chunk: ahead },
                {
                  onSuccess: data => {
                    loading.delete(data.index);
                    setLoadedChunks(p => ({ ...p, [data.index]: data.chunk }));
                  },
                  onError: () => {
                    loading.delete(ahead);
                  },
                }
              );
            }

            return prev;
          });
        }
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [token, readChunk, totalChunks]);

  // Determine if more chunks exist after each loadedChunks update
  hasMoreRef.current = Object.keys(loadedChunks).length < totalChunks;
  loadedCountRef.current = Object.keys(loadedChunks).length;

  const allContent = useMemo(() => {
    const indices = Object.keys(loadedChunks)
      .map(Number)
      .sort((a, b) => a - b);
    return indices.map(i => loadedChunks[i]).join("");
  }, [loadedChunks]);

  const paragraphs = useMemo(() => allContent.split("\n\n"), [allContent]);
  const outline = useMemo(
    () => (allContent ? parseOutline(allContent) : []),
    [allContent]
  );

  useEffect(() => {
    paragraphsRef.current = paragraphs;
  }, [paragraphs]);

  // Restore saved listening position (localStorage wins, server as fallback).
  useEffect(() => {
    if (!bookId) return;
    let saved = 0;
    try {
      const cached = localStorage.getItem(`tr_audio_${bookId}`);
      if (cached) saved = JSON.parse(cached).paragraph || 0;
    } catch {
      /* no cached position — fall back to server value below */
    }
    const serverPara = listenProgressData?.paragraph ?? 0;
    if (serverPara > saved) saved = serverPara;
    if (saved > 0) setListenPara(Math.max(0, saved));
  }, [bookId, listenProgressData]);

  // When more text streams in mid-playback, append it to the TTS queue.
  useEffect(() => {
    if (!tts.isSpeaking) return;
    const lastQueued = lastQueuedParaRef.current;
    if (lastQueued < 0) return;
    if (paragraphs.length - 1 <= lastQueued) return;
    const extra = buildSpeakQueue(paragraphs, lastQueued + 1);
    if (extra.length > 0) {
      lastQueuedParaRef.current = paragraphs.length - 1;
      tts.append(extra);
    }
  }, [paragraphs, tts]);

  // Lock-screen / background controls.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!listenOpen || !book) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: book.title,
        artist: book.author,
        album: "ToxicReads",
      });
      navigator.mediaSession.setActionHandler("play", () => tts.resume());
      navigator.mediaSession.setActionHandler("pause", () => tts.pause());
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        const prev = Math.max(0, listenParaRef.current - 1);
        setListenPara(prev);
        const q = buildSpeakQueue(paragraphsRef.current, prev);
        lastQueuedParaRef.current = paragraphsRef.current.length - 1;
        tts.speak(q);
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        const next = listenParaRef.current + 1;
        if (next >= paragraphsRef.current.length) return;
        setListenPara(next);
        const q = buildSpeakQueue(paragraphsRef.current, next);
        lastQueuedParaRef.current = paragraphsRef.current.length - 1;
        tts.speak(q);
      });
    } catch {
      /* mediaSession unsupported — system controls simply unavailable */
    }
    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      } catch {
        /* ignore cleanup on browsers without mediaSession */
      }
    };
  }, [listenOpen, book, tts]);

  // Keep the spoken paragraph in view while listening.
  useEffect(() => {
    if (!listenOpen || !tts.isSpeaking) return;
    const el = contentRef.current?.querySelector(`[data-para="${listenPara}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [listenPara, listenOpen, tts.isSpeaking]);

  const startListening = useCallback(
    (fromPara?: number) => {
      const start = Math.max(
        0,
        Math.min(fromPara ?? listenParaRef.current, Math.max(0, paragraphsRef.current.length - 1))
      );
      setListenPara(start);
      const queue = buildSpeakQueue(paragraphsRef.current, start);
      lastQueuedParaRef.current = paragraphsRef.current.length - 1;
      tts.speak(queue);
    },
    [tts]
  );

  const handleListenPrev = useCallback(() => {
    const prev = Math.max(0, listenParaRef.current - 1);
    setListenPara(prev);
    persistListenPosition(prev);
    if (tts.isSpeaking) {
      const q = buildSpeakQueue(paragraphsRef.current, prev);
      lastQueuedParaRef.current = paragraphsRef.current.length - 1;
      tts.speak(q);
    } else {
      contentRef.current
        ?.querySelector(`[data-para="${prev}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [tts, persistListenPosition]);

  const handleListenNext = useCallback(() => {
    const next = listenParaRef.current + 1;
    if (next >= paragraphsRef.current.length) return;
    setListenPara(next);
    persistListenPosition(next);
    if (tts.isSpeaking) {
      const q = buildSpeakQueue(paragraphsRef.current, next);
      lastQueuedParaRef.current = paragraphsRef.current.length - 1;
      tts.speak(q);
    } else {
      contentRef.current
        ?.querySelector(`[data-para="${next}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [tts, persistListenPosition]);

  const handleListenPauseResume = useCallback(() => {
    if (tts.isPaused) tts.resume();
    else if (tts.isSpeaking) tts.pause();
    else startListening();
  }, [tts, startListening]);

  const handleListenStop = useCallback(() => {
    tts.stop();
    lastQueuedParaRef.current = -1;
  }, [tts]);

  const handleListenClose = useCallback(() => {
    tts.stop();
    lastQueuedParaRef.current = -1;
    setListenOpen(false);
  }, [tts]);

  const handleRateChange = useCallback(
    (r: number) => {
      setTtsRate(r);
      try {
        localStorage.setItem("tr_tts_rate", String(r));
      } catch {
        /* private mode — rate still applies for this session */
      }
      // Restart from current paragraph so the new rate applies immediately.
      if (tts.isSpeaking) startListening(listenParaRef.current);
    },
    [tts, startListening]
  );

  const handleVoiceChange = useCallback(
    (uri: string) => {
      setTtsVoiceURI(uri);
      try {
        localStorage.setItem("tr_tts_voice", uri);
      } catch {
        /* private mode — voice still applies for this session */
      }
      if (tts.isSpeaking) startListening(listenParaRef.current);
    },
    [tts, startListening]
  );

  const openListen = useCallback(() => {
    setListenOpen(true);
    // Defer one tick so ListenBar mounts before speech starts (mobile policy).
    window.setTimeout(() => startListening(listenParaRef.current), 50);
  }, [startListening]);

  // Track visible chapter via IntersectionObserver
  useEffect(() => {
    if (!showOutline || !contentRef.current) return;

    const markers = contentRef.current.querySelectorAll("[data-para]");
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute("data-para") || "0");
            let chapterIdx = 0;
            for (let i = outline.length - 1; i >= 0; i--) {
              if (outline[i].index <= idx) {
                chapterIdx = i;
                break;
              }
            }
            setActiveChapter(chapterIdx);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    markers.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [showOutline, outline, paragraphs.length]);

  const scrollToChapter = (entry: OutlineEntry) => {
    const el = contentRef.current?.querySelector(
      `[data-para="${entry.index}"]`
    );
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
      const pct = Math.round(
        (window.scrollY / (doc.scrollHeight - window.innerHeight)) * 100
      );
      const topChunk = Math.max(0, loadedCountRef.current - 1);

      try {
        localStorage.setItem(
          `tr_progress_${bookId}`,
          JSON.stringify({
            chunk: topChunk,
            scrollPercent: pct,
            updatedAt: Date.now(),
          })
        );
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

  const bgColor = theme === "dark" ? "#121211" : "#F7F7F4";
  const textColor = theme === "dark" ? "#F2F1EC" : "#141413";
  const mutedInk = theme === "dark" ? "#A09D94" : "#5C5A55";
  const headerBg = theme === "dark" ? "#1A1A18" : "#FFFFFF";
  const borderColor = theme === "dark" ? "#2C2B27" : "#E4E3DD";
  const activeBg = theme === "dark" ? "#242320" : "#ECEBE4";
  const accentColor = theme === "dark" ? "#DF5348" : "#B82E24";

  if (isLoading || authLoading) {
    return (
      <div className="min-h-dvh" style={{ backgroundColor: bgColor }}>
        <ReaderSkeleton />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <p className="font-serif text-xl" style={{ color: mutedInk }}>
          This book could not be loaded.
        </p>
        <button
          type="button"
          onClick={() => navigate("/my-purchases")}
          className="rounded-full border px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ borderColor, color: textColor }}
        >
          Back to library
        </button>
      </div>
    );
  }

  const outlineBg = headerBg;
  const watermarkColor =
    theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.035)";
  const loadedCount = Object.keys(loadedChunks).length;
  const audioDisabled =
    paragraphs.length === 0 || !paragraphs.join("").trim();

  return (
    <div
      className="min-h-dvh relative transition-colors duration-200"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Watermark overlay */}
      <div
        className="fixed inset-0 z-[60] pointer-events-none overflow-hidden font-mono text-base whitespace-pre select-none"
        style={{ color: watermarkColor }}
      >
        {Array.from({ length: 40 }).map((_, ri) => (
          <div
            key={ri}
            className="text-center opacity-50"
            style={{
              lineHeight: "2.5",
              transform: "rotate(-20deg)",
            }}
          >
            {`TOXICREADS · ${user?.name || user?.username || "Reader"} · ${new Date().toISOString().slice(0, 10)} `.repeat(
              15
            )}
          </div>
        ))}
      </div>

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-3 sm:px-6 z-50 border-b transition-colors"
        style={{
          backgroundColor: headerBg,
          borderColor,
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => navigate("/my-purchases")}
            aria-label="Back to library"
            className="h-9 w-9 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity shrink-0"
            style={{ color: textColor }}
          >
            <PiCaretLeft size={18} />
          </button>
          <span
            className="hidden sm:inline font-serif text-[16px] max-w-[260px] truncate"
            style={{ color: mutedInk }}
          >
            {book.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => (listenOpen ? handleListenClose() : openListen())}
            disabled={audioDisabled}
            className="h-9 rounded-full border px-3 sm:px-3.5 text-xs font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            style={{
              color: textColor,
              backgroundColor: listenOpen ? activeBg : "transparent",
              borderColor: listenOpen ? textColor : borderColor,
            }}
            title={listenOpen ? "Close audio player" : "Listen to this book"}
          >
            <PiHeadphones size={15} />
            <span className="hidden sm:inline">
              {listenOpen ? "Listening" : "Listen"}
            </span>
          </button>

          {outline.length > 0 && (
            <button
              type="button"
              onClick={() => setShowOutline(!showOutline)}
              className="h-9 rounded-full border px-3 sm:px-3.5 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              style={{
                color: textColor,
                backgroundColor: showOutline ? activeBg : "transparent",
                borderColor: showOutline ? textColor : borderColor,
              }}
              title="Chapters outline"
            >
              <PiList size={15} />
              <span className="hidden sm:inline">Contents</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 rounded-full border px-1.5 h-9" style={{ borderColor }}>
            <button
              type="button"
              onClick={() => setFontSize(Math.max(16, fontSize - 2))}
              className="h-7 w-7 rounded-full font-mono text-xs flex items-center justify-center hover:opacity-75 transition-opacity"
              style={{ color: textColor }}
              title="Decrease font size"
            >
              A-
            </button>
            <span
              className="font-mono text-xs tnum min-w-[24px] text-center"
              style={{ color: mutedInk }}
            >
              {fontSize}
            </span>
            <button
              type="button"
              onClick={() => setFontSize(Math.min(28, fontSize + 2))}
              className="h-7 w-7 rounded-full font-mono text-xs flex items-center justify-center hover:opacity-75 transition-opacity"
              style={{ color: textColor }}
              title="Increase font size"
            >
              A+
            </button>
          </div>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={
              theme === "dark" ? "Switch to light reader" : "Switch to dark reader"
            }
            className="hidden sm:inline-flex h-9 w-9 rounded-full border items-center justify-center hover:opacity-75 transition-opacity"
            style={{ borderColor, color: textColor }}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <PiSun size={16} /> : <PiMoon size={16} />}
          </button>

          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
            className="h-9 w-9 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity shrink-0"
            style={{ color: textColor }}
          >
            <PiSignOut size={16} />
          </button>
        </div>
      </header>

      <div className="flex min-h-dvh pt-14">
        {/* Outline Sidebar */}
        {showOutline && outline.length > 0 && (
          <>
            <div
              className="sm:hidden fixed inset-0 z-30 bg-black/45"
              onClick={() => setShowOutline(false)}
            />
            <aside
              className="fixed left-0 top-14 bottom-0 z-40 w-[min(80vw,240px)] overflow-y-auto border-r"
              style={{
                backgroundColor: outlineBg,
                borderColor,
              }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-xs font-medium tracking-wide"
                    style={{ color: mutedInk }}
                  >
                    Contents
                  </h3>
                  <button
                    type="button"
                    className="sm:hidden h-7 w-7 rounded-full flex items-center justify-center"
                    onClick={() => setShowOutline(false)}
                    style={{ color: mutedInk }}
                    aria-label="Close contents"
                  >
                    <PiX size={15} />
                  </button>
                </div>
                <div className="space-y-1">
                  {outline.map((entry, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        scrollToChapter(entry);
                        if (window.innerWidth < 640) setShowOutline(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-lg font-serif text-[15px] leading-snug transition-colors cursor-pointer"
                      style={{
                        color: i === activeChapter ? textColor : mutedInk,
                        backgroundColor:
                          i === activeChapter ? activeBg : "transparent",
                        fontWeight: i === activeChapter ? 500 : 400,
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
        <main
          className={`flex-1 transition-[margin-left] duration-200 ${
            showOutline && outline.length > 0 ? "md:ml-[240px]" : ""
          } ${listenOpen ? "pb-40" : "pb-28"}`}
        >
          <article className="max-w-[680px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
            {/* Book header */}
            <div
              className="mb-10 pb-7 border-b"
              style={{ borderColor }}
            >
              <h1
                className="font-serif text-3xl sm:text-4xl font-medium leading-[1.18] tracking-tight mb-2 text-balance"
                style={{ color: textColor }}
              >
                {book.title}
              </h1>
              <p className="text-base italic font-serif" style={{ color: mutedInk }}>
                by {book.author}
              </p>
            </div>

            <div
              ref={contentRef}
              className="font-serif select-none"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: 1.8,
                color: textColor,
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
              }}
            >
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, i) => {
                  const isActive = listenOpen && i === listenPara;
                  return (
                    <p
                      key={i}
                      data-para={i}
                      className="mb-[1.45em] rounded-md transition-colors duration-300"
                      style={{
                        backgroundColor: isActive ? activeBg : "transparent",
                        padding: isActive ? "6px 10px" : "2px 0",
                        marginLeft: isActive ? "-10px" : 0,
                        marginRight: isActive ? "-10px" : 0,
                      }}
                    >
                      {paragraph}
                    </p>
                  );
                })
              ) : (
                <div className="py-12 text-center" style={{ color: mutedInk }}>
                  <p className="font-serif text-lg">
                    Content is not available for this book yet.
                  </p>
                </div>
              )}
            </div>

            {/* Sentinel — triggers next chunk load */}
            {hasMoreRef.current && (
              <div ref={sentinelRef} className="h-px" />
            )}
          </article>
        </main>
      </div>

      {/* Mobile bottom font & theme toolbar */}
      {!listenOpen && (
        <div
          className="sm:hidden fixed bottom-3 inset-x-0 z-40 flex items-center justify-center pointer-events-none"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div
            className="pointer-events-auto flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-soft-lg"
            style={{ backgroundColor: headerBg, borderColor }}
          >
            <button
              type="button"
              onClick={() => setFontSize(Math.max(16, fontSize - 2))}
              className="h-8 w-8 rounded-full font-mono text-xs flex items-center justify-center"
              style={{ color: textColor }}
              title="Decrease font"
            >
              A-
            </button>
            <span
              className="font-mono text-xs tnum min-w-[24px] text-center"
              style={{ color: mutedInk }}
            >
              {fontSize}
            </span>
            <button
              type="button"
              onClick={() => setFontSize(Math.min(28, fontSize + 2))}
              className="h-8 w-8 rounded-full font-mono text-xs flex items-center justify-center"
              style={{ color: textColor }}
              title="Increase font"
            >
              A+
            </button>
            <span className="h-4 w-px mx-1" style={{ backgroundColor: borderColor }} />
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ color: textColor }}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <PiSun size={16} /> : <PiMoon size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Reading chunk progress bar */}
      {!listenOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 h-1 z-30"
          style={{
            backgroundColor: borderColor,
            marginBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${Math.min(100, (loadedCount / Math.max(totalChunks, 1)) * 100)}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      )}

      {listenOpen && (
        <ListenBar
          theme={theme}
          isPlaying={tts.isSpeaking}
          isPaused={tts.isPaused}
          isSupported={tts.isSupported}
          currentPara={listenPara}
          totalParas={paragraphs.length}
          rate={ttsRate}
          onRateChange={handleRateChange}
          voices={ttsVoices}
          voiceURI={ttsVoiceURI}
          onVoiceChange={handleVoiceChange}
          onPlay={() => startListening()}
          onPauseResume={handleListenPauseResume}
          onStop={handleListenStop}
          onPrev={handleListenPrev}
          onNext={handleListenNext}
          onClose={handleListenClose}
        />
      )}
    </div>
  );
}
