import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function MyPurchases() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: purchases, isLoading } = trpc.purchase.myPurchases.useQuery(
    undefined,
    { enabled: isAuthenticated },
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
          <span style={{ fontSize: "11px", color: "var(--text-grey)", marginLeft: "8px" }}>/ My Purchases</span>
        </div>
        </header>

      <div className="mx-auto" style={{ maxWidth: "900px", padding: "64px 24px 80px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 400, color: "var(--text-charcoal)", marginBottom: "32px" }}>My Purchases</h1>

        {isLoading ? (
          <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>LOADING...</p>
        ) : purchases && purchases.length > 0 ? (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center gap-4"
                style={{ padding: "16px 0", borderBottom: "1px solid var(--border-light)" }}
              >
                <img
                  src={purchase.book?.coverImage || ""}
                  alt={purchase.book?.title || ""}
                  style={{ width: "60px", height: "80px", objectFit: "cover", border: "1px solid var(--border-light)", flexShrink: 0, cursor: "pointer" }}
                  onClick={() => navigate(`/book/${purchase.book?.id}`)}
                />
                <div className="flex-1 min-w-0">
                  <p 
                    style={{ fontSize: "15px", fontWeight: 400, color: "var(--text-charcoal)", marginBottom: "4px", cursor: "pointer" }}
                    onClick={() => navigate(`/book/${purchase.book?.id}`)}
                  >
                    {purchase.book?.title}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-grey)", marginBottom: "2px" }}>{purchase.book?.author}</p>
                  <p style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "var(--text-grey)" }}>
                    ${purchase.purchasePrice} · {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
                {purchase.book?.content && (
                  <button
                    onClick={() => navigate(`/read/${purchase.book?.id}`)}
                    style={{
                      fontSize: "10px",
                      fontFamily: "'Space Mono', monospace",
                      letterSpacing: "0.1em",
                      color: "var(--bg-warm-white)",
                      background: "var(--text-charcoal)",
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
            <p style={{ fontSize: "13px", color: "var(--text-grey)", marginBottom: "16px" }}>No purchases yet</p>
            <button
              onClick={() => navigate("/home")}
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
              Browse books
            </button>
          </div>
        )}
      </div>
    </div>
  );
}