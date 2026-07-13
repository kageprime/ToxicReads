import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function MyPurchases() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: purchases, isLoading } = trpc.purchase.myPurchases.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return null;
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: "1120px", padding: "40px 32px 96px" }}
      >
          <h1
            style={{
              fontSize: "34px",
              fontWeight: 400,
              fontFamily: "var(--font-serif)",
              color: "var(--foreground)",
              marginBottom: "32px",
              letterSpacing: "-0.01em",
            }}
          >
            My Purchases
          </h1>

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
        ) : purchases && purchases.length > 0 ? (
          <div className="space-y-4">
            {purchases.map(purchase => (
              <div
                key={purchase.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 transition-colors hover:bg-accent"
                style={{
                  padding: "20px 16px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={purchase.book?.coverImage || ""}
                    alt={purchase.book?.title || ""}
                    style={{
                      width: "60px",
                      height: "80px",
                      objectFit: "cover",
                      border: "1px solid var(--border)",
                      flexShrink: 0,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/book/${purchase.book?.id}`)}
                  />
                  <div className="flex-1 min-w-0 sm:hidden">
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 400,
                        color: "var(--foreground)",
                        marginBottom: "4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/book/${purchase.book?.id}`)}
                    >
                      {purchase.book?.title}
                    </p>
                    <p
                      style={{
                        fontSize: "18px",
                        color: "var(--muted-foreground)",
                        marginBottom: "2px",
                      }}
                    >
                      {purchase.book?.author}
                    </p>
                    <p
                      style={{
                        fontSize: "17px",
                        fontFamily: "var(--font-mono)",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      ₦{purchase.purchasePrice} ·{" "}
                      {purchase.createdAt
                        ? new Date(purchase.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block flex-1 min-w-0">
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 400,
                      color: "var(--foreground)",
                      marginBottom: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/book/${purchase.book?.id}`)}
                  >
                    {purchase.book?.title}
                  </p>
                  <p
                    style={{
                      fontSize: "18px",
                      color: "var(--muted-foreground)",
                      marginBottom: "2px",
                    }}
                  >
                    {purchase.book?.author}
                  </p>
                  <p
                    style={{
                      fontSize: "17px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    ₦{purchase.purchasePrice} ·{" "}
                    {purchase.createdAt
                      ? new Date(purchase.createdAt).toLocaleDateString()
                      : ""}
                  </p>
                </div>
                {purchase.book?.content && (
                  <button
                    onClick={() => navigate(`/read/${purchase.book?.id}`)}
                    className="w-full sm:w-auto ml-[76px] sm:ml-0 transition-transform active:scale-[0.98] hover:opacity-90"
                    style={{
                      fontSize: "16px",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.1em",
                      color: "var(--background)",
                      background: "var(--foreground)",
                      border: "none",
                      padding: "10px 20px",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    READ
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
              No purchases yet
            </p>
            <button
              onClick={() => navigate("/home")}
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
              Browse books
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
