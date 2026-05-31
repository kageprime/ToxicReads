import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function Reader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const { data: book, isLoading, error } = trpc.book.read.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id },
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme === "dark" ? "#1a1a1a" : "#faf8f5" }}>
        <span style={{ fontSize: "12px", fontFamily: "'Space Mono', monospace", color: theme === "dark" ? "#999" : "#999" }}>LOADING...</span>
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 z-50" style={{ height: "48px", backgroundColor: headerBg, borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/my-purchases")} className="p-1.5 rounded hover:bg-gray-100 transition-colors" style={theme === "dark" ? { backgroundColor: "#2a2a2a" } : {}}>
            <ChevronLeft size={18} style={{ color: textColor }} />
          </button>
          <span style={{ fontSize: "11px", color: theme === "dark" ? "#999" : "#666", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: textColor, background: "none", border: `1px solid ${borderColor}`, padding: "4px 8px", cursor: "pointer" }}>A-</button>
          <span style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: theme === "dark" ? "#666" : "#999", minWidth: "24px", textAlign: "center" }}>{fontSize}</span>
          <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: textColor, background: "none", border: `1px solid ${borderColor}`, padding: "4px 8px", cursor: "pointer" }}>A+</button>
          <span style={{ fontSize: "10px", color: theme === "dark" ? "#666" : "#999" }}>|</span>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: textColor, background: "none", border: `1px solid ${borderColor}`, padding: "4px 10px", cursor: "pointer" }}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button onClick={logout} className="p-1.5 rounded hover:bg-gray-100 transition-colors" style={theme === "dark" ? { backgroundColor: "#2a2a2a" } : {}}>
            <LogOut size={16} style={{ color: textColor }} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ paddingTop: "80px", paddingBottom: "120px" }}>
        <article style={{ maxWidth: "680px", margin: "0 auto", padding: "0 32px" }}>
          {/* Book header */}
          <div style={{ marginBottom: "48px", paddingBottom: "32px", borderBottom: `1px solid ${borderColor}` }}>
            <h1 style={{ fontSize: "28px", fontWeight: 400, color: textColor, marginBottom: "8px", lineHeight: 1.3, fontFamily: "'Georgia', serif" }}>{book.title}</h1>
            <p style={{ fontSize: "14px", color: theme === "dark" ? "#888" : "#888", fontStyle: "italic" }}>by {book.author}</p>
          </div>

          {/* Book content */}
          <div style={{ fontSize: `${fontSize}px`, lineHeight: 1.8, color: textColor, fontFamily: "'Georgia', serif" }}>
            {book.content ? (
              book.content.split("\n\n").map((paragraph, i) => (
                <p key={i} style={{ marginBottom: "1.5em" }}>{paragraph}</p>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: theme === "dark" ? "#666" : "#999" }}>
                <p style={{ fontSize: "14px" }}>Content not available for this book.</p>
              </div>
            )}
          </div>
        </article>
      </main>

      {/* Progress indicator */}
      <div className="fixed bottom-0 left-0 right-0 h-1" style={{ backgroundColor: borderColor }}>
        <div style={{ width: "30%", height: "100%", backgroundColor: theme === "dark" ? "#666" : "#ccc" }} />
      </div>
    </div>
  );
}