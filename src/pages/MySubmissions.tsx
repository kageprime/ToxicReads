import { useEffect } from "react";
import { useNavigate } from "react-router";
import { PiWarningCircle } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function MySubmissions() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  const { data: submissions, isLoading } = trpc.book.mySubmissions.useQuery(
    undefined,
    { enabled: isAuthenticated }
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
    pending: "var(--color-p-yellow-fg)",
    approved: "var(--color-p-green-fg)",
    rejected: "var(--color-p-red-fg)",
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: "1120px", padding: "40px 32px 96px" }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1
            style={{
              fontSize: "34px",
              fontWeight: 400,
              fontFamily: "var(--font-serif)",
              color: "var(--foreground)",
              letterSpacing: "-0.01em",
            }}
          >
            My Submissions
          </h1>
          <button
            onClick={() => navigate("/submit-book")}
            className="transition-transform active:scale-[0.98] hover:opacity-90"
            style={{
              fontSize: "16px",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.05em",
              color: "var(--background)",
              background: "var(--foreground)",
              border: "none",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            + New
          </button>
        </div>

        <div
          style={{
            border: "1px solid var(--color-p-yellow-fg)",
            padding: "10px 14px",
            marginBottom: "16px",
            backgroundColor: "rgba(243, 156, 18, 0.08)",
          }}
        >
          <div
            style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}
          >
            <PiWarningCircle
              size={12}
              style={{ color: "var(--color-p-yellow-fg)", marginTop: "3px", flexShrink: 0 }}
            />
            <p
              style={{
                fontSize: "15px",
                fontFamily: "var(--font-mono)",
                color: "var(--foreground)",
                lineHeight: 1.6,
              }}
            >
              <strong>NO AI GENERATED CONTENT.</strong> All submissions are reviewed. Violations will be rejected.{" "}
              <span
                style={{ textDecoration: "underline", cursor: "pointer" }}
                onClick={() => navigate("/submit-book")}
              >
                View full submission guidelines.
              </span>
            </p>
          </div>
        </div>

        {isLoading ? (
          <p
            style={{
              fontSize: "18px",
              color: "var(--muted-foreground)",
              fontFamily: "var(--font-mono)",
            }}
          >
            LOADING...
          </p>
        ) : submissions && submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map(book => (
              <div
                key={book.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 transition-colors hover:bg-accent"
                style={{
                  padding: "20px 16px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={book.coverImage || ""}
                    alt={book.title || ""}
                    style={{
                      width: "50px",
                      height: "66px",
                      objectFit: "cover",
                      border: "1px solid var(--border)",
                      flexShrink: 0,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/book/${book.id}`)}
                  />
                  <div className="flex-1 min-w-0 sm:hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <p
                        style={{
                          fontSize: "20px",
                          fontWeight: 400,
                          color: "var(--foreground)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {book.title}
                      </p>
                      <span
                        className="shrink-0"
                        style={{
                          fontSize: "15px",
                          fontFamily: "var(--font-mono)",
                          color:
                            statusColors[book.status] || "var(--muted-foreground)",
                          border: `1px solid ${statusColors[book.status] || "var(--border)"}`,
                          padding: "2px 6px",
                        }}
                      >
                        {book.status?.toUpperCase()}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "18px",
                        color: "var(--muted-foreground)",
                        marginBottom: "2px",
                      }}
                    >
                      {book.author}
                    </p>
                    <p
                      style={{
                        fontSize: "17px",
                        fontFamily: "var(--font-mono)",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      ₦{book.price} ·{" "}
                      {book.content ? "Has content" : "No content"}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      style={{
                        fontSize: "20px",
                        fontWeight: 400,
                        fontFamily: "var(--font-serif)",
                        color: "var(--foreground)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {book.title}
                    </p>
                    <span
                      className="shrink-0"
                      style={{
                        fontSize: "15px",
                        fontFamily: "var(--font-mono)",
                        color: statusColors[book.status] || "var(--muted-foreground)",
                        border: `1px solid ${statusColors[book.status] || "var(--border)"}`,
                        padding: "2px 6px",
                      }}
                    >
                      {book.status?.toUpperCase()}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "18px",
                      color: "var(--muted-foreground)",
                      marginBottom: "2px",
                    }}
                  >
                    {book.author}
                  </p>
                  <p
                    style={{
                      fontSize: "17px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    ₦{book.price} ·{" "}
                    {book.content ? "Has content" : "No content"}
                  </p>
                </div>
                {book.status === "pending" && (
                  <button
                    onClick={() => {
                      if (confirm("Delete this submission?"))
                        deleteMutation.mutate({ id: book.id });
                    }}
                    disabled={deleteMutation.isPending}
                    className="w-full sm:w-auto ml-[66px] sm:ml-0 transition-transform active:scale-[0.98] hover:opacity-90"
                    style={{
                      fontSize: "15px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-p-red-fg)",
                      background: "none",
                      border: "1px solid var(--color-p-red-fg)",
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
            <p
              style={{
                fontSize: "19px",
                color: "var(--muted-foreground)",
                marginBottom: "16px",
              }}
            >
              No submissions yet
            </p>
            <button
              onClick={() => navigate("/submit-book")}
              className="transition-transform active:scale-[0.98] hover:opacity-80"
              style={{
                fontSize: "17px",
                fontFamily: "var(--font-mono)",
                color: "var(--foreground)",
                background: "none",
                border: "1px solid var(--border)",
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
