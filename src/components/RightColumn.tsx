import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useSidebar } from "@/contexts/SidebarContext";
import { useSwipe } from "@/hooks/useSwipe";

export default function RightColumn() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, setCollapsed, isMobile } = useSidebar();
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: purchases } = trpc.purchase.myPurchases.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );

  const recentPurchases = purchases?.slice(0, 3) || [];

  // Mobile: swipe on panel to close
  useSwipe({
    element: panelRef,
    onSwipeLeft: () => { if (isMobile) setCollapsed(true); },
    threshold: 30,
  });

  // Mobile: swipe from right edge to open
  useSwipe({
    onSwipeRight: () => { if (isMobile && collapsed) setCollapsed(false); },
    edgeOnly: "right",
    threshold: 30,
  });

  // Prevent body scroll when mobile overlay is open
  useEffect(() => {
    if (isMobile && !collapsed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, collapsed]);

  const content = (
    <div className="h-full overflow-y-auto" style={{ padding: isMobile ? "32px 24px calc(4rem + env(safe-area-inset-bottom, 16px))" : "24px" }}>
      <button
        onClick={() => setCollapsed(true)}
        className="w-full flex items-center justify-between mb-6 hover:opacity-70 transition-opacity"
        style={{ minHeight: "44px" }}
      >
        <h2 style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-grey)", lineHeight: 1.4 }}>
          QUICK ACTIONS
        </h2>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-grey)" }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="space-y-3 mb-6">
        {isAdmin && (
          <button
            onClick={() => { navigate("/admin"); if (isMobile) setCollapsed(true); }}
            style={{
              width: "100%", padding: "12px", fontSize: "11px", minHeight: "44px",
              fontFamily: "'VT323', monospace",
              color: "var(--bg-warm-white)", background: "var(--text-charcoal)",
              border: "none", cursor: "pointer", letterSpacing: "0.05em", textAlign: "left",
            }}
          >
            ADMIN
          </button>
        )}

        {isAuthenticated ? (
          <>
            <button onClick={() => { navigate("/submit-book"); if (isMobile) setCollapsed(true); }} style={{ width: "100%", padding: "12px", fontSize: "11px", minHeight: "44px", fontFamily: "'VT323', monospace", color: "var(--text-charcoal)", background: "transparent", border: "1px solid var(--border-light)", cursor: "pointer", letterSpacing: "0.05em", textAlign: "left" }}>
              SELL
            </button>
            <button onClick={() => { navigate("/my-purchases"); if (isMobile) setCollapsed(true); }} style={{ width: "100%", padding: "12px", fontSize: "11px", minHeight: "44px", fontFamily: "'VT323', monospace", color: "var(--text-charcoal)", background: "transparent", border: "1px solid var(--border-light)", cursor: "pointer", letterSpacing: "0.05em", textAlign: "left" }}>
              MY BOOKS
            </button>
            <button onClick={() => { navigate("/my-submissions"); if (isMobile) setCollapsed(true); }} style={{ width: "100%", padding: "12px", fontSize: "11px", minHeight: "44px", fontFamily: "'VT323', monospace", color: "var(--text-charcoal)", background: "transparent", border: "1px solid var(--border-light)", cursor: "pointer", letterSpacing: "0.05em", textAlign: "left" }}>
              SUBMISSIONS
            </button>
            <button onClick={() => { navigate("/profile"); if (isMobile) setCollapsed(true); }} style={{ width: "100%", padding: "12px", fontSize: "11px", minHeight: "44px", fontFamily: "'VT323', monospace", color: "var(--text-charcoal)", background: "transparent", border: "1px solid var(--border-light)", cursor: "pointer", letterSpacing: "0.05em", textAlign: "left" }}>
              ACCOUNT
            </button>
            <button onClick={logout} style={{ width: "100%", padding: "12px", fontSize: "11px", minHeight: "44px", fontFamily: "'VT323', monospace", color: "var(--text-grey)", background: "transparent", border: "1px solid var(--border-light)", cursor: "pointer", letterSpacing: "0.05em", textAlign: "left" }}>
              LOG OUT
            </button>
          </>
        ) : (
          <button onClick={() => { navigate("/login"); if (isMobile) setCollapsed(true); }} style={{ width: "100%", padding: "12px", fontSize: "11px", minHeight: "44px", fontFamily: "'VT323', monospace", color: "var(--text-charcoal)", background: "transparent", border: "1px solid var(--border-light)", cursor: "pointer", letterSpacing: "0.05em", textAlign: "left" }}>
            LOG IN
          </button>
        )}
      </div>

      {isAuthenticated && recentPurchases.length > 0 && (
        <div className="mb-6">
          <h3 style={{ fontSize: "10px", fontFamily: "'VT323', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-grey)", marginBottom: "12px" }}>
            RECENT
          </h3>
          <div className="space-y-3">
            {recentPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => { navigate(`/book/${purchase.book?.id}`); if (isMobile) setCollapsed(true); }}
                style={{ minHeight: "44px" }}
              >
                <p style={{ fontSize: "11px", color: "var(--text-charcoal)", lineHeight: 1.4 }}>
                  {purchase.book?.title || "Unknown Book"}
                </p>
                <p style={{ fontSize: "10px", color: "var(--text-grey)", fontFamily: "'VT323', monospace" }}>
                  ${purchase.purchasePrice}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: "10px", fontFamily: "'VT323', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-grey)", marginBottom: "12px" }}>
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
              <span style={{ fontSize: "10px", color: "var(--text-grey)", fontFamily: "'VT323', monospace", flexShrink: 0 }}>
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
  );

  // Mobile: overlay with backdrop
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {!collapsed && (
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setCollapsed(true)}
          />
        )}
        {/* Panel */}
        <aside
          ref={panelRef}
          className="fixed top-0 right-0 z-50 h-full transition-transform duration-300 ease-out"
          style={{
            width: "min(85vw, 320px)",
            backgroundColor: "var(--bg-warm-white)",
            borderLeft: "1px solid var(--border-light)",
            transform: collapsed ? "translateX(100%)" : "translateX(0)",
          }}
        >
          {content}
        </aside>
      </>
    );
  }

  // Desktop: inline push sidebar
  return (
    <aside
      className="h-screen flex-shrink-0 transition-all duration-300 ease-out overflow-hidden"
      style={{
        width: collapsed ? "0px" : "280px",
        backgroundColor: "var(--bg-warm-white)",
        borderLeft: collapsed ? "none" : "1px solid var(--border-light)",
      }}
    >
      {content}
    </aside>
  );
}
