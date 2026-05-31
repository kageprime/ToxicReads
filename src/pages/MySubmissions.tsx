import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function MySubmissions() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  const { data: submissions, isLoading } = trpc.book.mySubmissions.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );

  const deleteMutation = trpc.book.deleteMySubmission.useMutation({
    onSuccess: () => {
      utils.book.mySubmissions.invalidate();
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return null;
  }

  const statusColors: Record<string, string> = {
    pending: "#F39C12",
    approved: "#2ECC71",
    rejected: "#E74C3C",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-warm-white)" }}>
      <header 
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 z-50"
        style={{ 
          height: "48px", 
          backgroundColor: "var(--bg-warm-white)", 
          borderBottom: "1px solid var(--border-light)" 
        }}
      >
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/home")} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
            <ChevronLeft size={18} style={{ color: "var(--text-charcoal)" }} />
          </button>
          <button onClick={() => navigate("/home")} className="text-xs font-normal tracking-wider uppercase text-charcoal hover:opacity-70 transition-opacity">
            TOXICREADS
          </button>
          <span style={{ fontSize: "11px", color: "var(--text-grey)", marginLeft: "8px" }}>/ My Submissions</span>
        </div>
        </header>

      <div className="mx-auto" style={{ maxWidth: "900px", padding: "64px 24px 80px" }}>
        <div className="flex items-center justify-between mb-8">
          <h1 style={{ fontSize: "22px", fontWeight: 400, color: "var(--text-charcoal)" }}>My Submissions</h1>
          <button
            onClick={() => navigate("/submit-book")}
            style={{
              fontSize: "10px",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.05em",
              color: "var(--bg-warm-white)",
              background: "var(--text-charcoal)",
              border: "none",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            + New
          </button>
        </div>

        {isLoading ? (
          <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>LOADING...</p>
        ) : submissions && submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((book) => (
              <div
                key={book.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
                style={{ padding: "16px 0", borderBottom: "1px solid var(--border-light)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={book.coverImage || ""}
                    alt={book.title || ""}
                    style={{ width: "50px", height: "66px", objectFit: "cover", border: "1px solid var(--border-light)", flexShrink: 0, cursor: "pointer" }}
                    onClick={() => navigate(`/book/${book.id}`)}
                  />
                  <div className="flex-1 min-w-0 sm:hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <p style={{ fontSize: "14px", fontWeight: 400, color: "var(--text-charcoal)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</p>
                      <span className="shrink-0" style={{
                        fontSize: "9px",
                        fontFamily: "'Space Mono', monospace",
                        color: statusColors[book.status] || "var(--text-grey)",
                        border: `1px solid ${statusColors[book.status] || "var(--border-light)"}`,
                        padding: "2px 6px",
                      }}>
                        {book.status?.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-grey)", marginBottom: "2px" }}>{book.author}</p>
                    <p style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "var(--text-grey)" }}>
                      ${book.price} · {book.content ? "Has content" : "No content"}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p style={{ fontSize: "14px", fontWeight: 400, color: "var(--text-charcoal)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</p>
                    <span className="shrink-0" style={{
                      fontSize: "9px",
                      fontFamily: "'Space Mono', monospace",
                      color: statusColors[book.status] || "var(--text-grey)",
                      border: `1px solid ${statusColors[book.status] || "var(--border-light)"}`,
                      padding: "2px 6px",
                    }}>
                      {book.status?.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-grey)", marginBottom: "2px" }}>{book.author}</p>
                  <p style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "var(--text-grey)" }}>
                    ${book.price} · {book.content ? "Has content" : "No content"}
                  </p>
                </div>
                {book.status === "pending" && (
                  <button
                    onClick={() => { if (confirm("Delete this submission?")) deleteMutation.mutate({ id: book.id }); }}
                    disabled={deleteMutation.isPending}
                    className="w-full sm:w-auto ml-[66px] sm:ml-0"
                    style={{
                      fontSize: "9px",
                      fontFamily: "'Space Mono', monospace",
                      color: "#E74C3C",
                      background: "none",
                      border: "1px solid #E74C3C",
                      padding: "6px 12px",
                      cursor: deleteMutation.isPending ? "wait" : "pointer",
                      opacity: deleteMutation.isPending ? 0.7 : 1,
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p style={{ fontSize: "13px", color: "var(--text-grey)", marginBottom: "16px" }}>No submissions yet</p>
            <button
              onClick={() => navigate("/submit-book")}
              style={{
                fontSize: "11px",
                fontFamily: "'Space Mono', monospace",
                color: "var(--text-charcoal)",
                background: "none",
                border: "1px solid var(--border-light)",
                padding: "8px 16px",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              Submit a Book
            </button>
          </div>
        )}
      </div>
    </div>
  );
}