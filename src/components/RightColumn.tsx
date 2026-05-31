import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useSidebar } from "@/contexts/SidebarContext";

export default function RightColumn() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, setCollapsed } = useSidebar();

  const { data: purchases } = trpc.purchase.myPurchases.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );

  const recentPurchases = purchases?.slice(0, 3) || [];

  return (
    <aside
      className="h-screen flex-shrink-0 transition-all duration-300 ease-out overflow-hidden"
      style={{
        width: collapsed ? "0px" : "280px",
        backgroundColor: "var(--bg-warm-white)",
        borderLeft: collapsed ? "none" : "1px solid var(--border-light)",
      }}
    >
      <div className="h-full overflow-y-auto p-6 pb-24">
        <button 
          onClick={() => setCollapsed(true)}
          className="w-full flex items-center justify-between mb-4 hover:opacity-70 transition-opacity"
        >
          <h2 style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-grey)", lineHeight: 1.4 }}>
            QUICK ACTIONS
          </h2>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div className="space-y-2 mb-6">
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "11px",
                fontFamily: "'Space Mono', monospace",
                color: "var(--bg-warm-white)",
                background: "var(--text-charcoal)",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.05em",
                textAlign: "left",
              }}
            >
              ADMIN
            </button>
          )}

          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate("/submit-book")}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "11px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--text-charcoal)",
                  background: "transparent",
                  border: "1px solid var(--border-light)",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  textAlign: "left",
                }}
              >
                SELL
              </button>
              <button
                onClick={() => navigate("/my-purchases")}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "11px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--text-charcoal)",
                  background: "transparent",
                  border: "1px solid var(--border-light)",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  textAlign: "left",
                }}
              >
                MY BOOKS
              </button>
              <button
                onClick={() => navigate("/my-submissions")}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "11px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--text-charcoal)",
                  background: "transparent",
                  border: "1px solid var(--border-light)",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  textAlign: "left",
                }}
              >
                SUBMISSIONS
              </button>
              <button
                onClick={() => navigate("/profile")}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "11px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--text-charcoal)",
                  background: "transparent",
                  border: "1px solid var(--border-light)",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  textAlign: "left",
                }}
              >
                ACCOUNT
              </button>
              <button
                onClick={logout}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "11px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--text-grey)",
                  background: "transparent",
                  border: "1px solid var(--border-light)",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  textAlign: "left",
                }}
              >
                LOG OUT
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "11px",
                fontFamily: "'Space Mono', monospace",
                color: "var(--text-charcoal)",
                background: "transparent",
                border: "1px solid var(--border-light)",
                cursor: "pointer",
                letterSpacing: "0.05em",
                textAlign: "left",
              }}
            >
              LOG IN
            </button>
          )}
        </div>

        {isAuthenticated && recentPurchases.length > 0 && (
          <div>
            <h3 style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-grey)", marginBottom: "12px" }}>
              RECENT
            </h3>
            <div className="space-y-3">
              {recentPurchases.map((purchase) => (
                <div 
                  key={purchase.id} 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/book/${purchase.book?.id}`)}
                >
                  <p style={{ fontSize: "11px", color: "var(--text-charcoal)", lineHeight: 1.4 }}>
                    {purchase.book?.title || "Unknown Book"}
                  </p>
                  <p style={{ fontSize: "10px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>
                    ${purchase.purchasePrice}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-grey)", marginBottom: "12px" }}>
            HOW IT WORKS
          </h3>
          <div className="space-y-3">
            {[
              "Browse curated books",
              "Buy books you love",
              "Submit your own",
              "Admin reviews",
            ].map((step, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span style={{ fontSize: "10px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace", flexShrink: 0 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p style={{ fontSize: "11px", color: "var(--text-charcoal)", lineHeight: 1.5 }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}