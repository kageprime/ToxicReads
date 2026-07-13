import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useSidebar } from "@/contexts/SidebarContext";
import { useSwipe } from "@/hooks/useSwipe";
import SafeImage from "@/components/SafeImage";
import {
  PiCaretLeft,
  PiUpload,
  PiBookOpen,
  PiList,
  PiUser,
  PiSignOut,
  PiSquaresFour,
} from "react-icons/pi";

interface NavItem {
  label: string;
  path: string;
  icon: typeof PiBookOpen;
  primary?: boolean;
  adminOnly?: boolean;
}

export default function LeftColumn() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, setCollapsed, isMobile } = useSidebar();
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: purchases } = trpc.purchase.myPurchases.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const recentPurchases = purchases?.slice(0, 4) || [];

  // Mobile: swipe on panel to close
  useSwipe({
    element: panelRef,
    onSwipeRight: () => {
      if (isMobile) setCollapsed(true);
    },
    threshold: 30,
  });

  // Mobile: swipe from left edge to open
  useSwipe({
    onSwipeLeft: () => {
      if (isMobile && collapsed) setCollapsed(false);
    },
    edgeOnly: "left",
    threshold: 30,
  });

  // Prevent body scroll when mobile overlay is open
  useEffect(() => {
    if (isMobile && !collapsed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, collapsed]);

  const navItems: NavItem[] = [
    { label: "Sell your book", path: "/submit-book", icon: PiUpload, primary: true },
    { label: "My books", path: "/my-purchases", icon: PiBookOpen },
    { label: "Submissions", path: "/my-submissions", icon: PiList },
    { label: "Account", path: "/profile", icon: PiUser },
    { label: "Admin", path: "/admin", icon: PiSquaresFour, adminOnly: true },
  ].filter(item => !item.adminOnly || isAdmin);

  const isActive = (path: string) =>
    path === "/profile"
      ? location.pathname === "/profile"
      : location.pathname.startsWith(path);

  const go = (path: string) => {
    navigate(path);
    if (isMobile) setCollapsed(true);
  };

  const goLogo = () => {
    navigate(location.pathname === "/home" ? "/" : "/home");
    if (isMobile) setCollapsed(true);
  };

  const howItWorks = [
    "Browse curated books",
    "Buy books you love",
    "Submit your own",
    "Admin reviews",
  ];

  const content = (
    <div
      className="h-full overflow-y-auto"
      style={{
        padding: isMobile
          ? "32px 24px calc(4rem + env(safe-area-inset-bottom, 16px))"
          : "28px 20px",
      }}
    >
      {/* ── Brand header ── */}
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={goLogo}
          aria-label={location.pathname === "/home" ? "Go to landing page" : "Browse books"}
          className="flex items-center gap-2 min-w-0 group hover:opacity-80 transition-opacity focus:outline-none"
        >
          <span className="live-dot inline-block w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-p-green-fg))]" />
          <span className="font-serif text-[22px] leading-none tracking-tight text-foreground truncate">
            ToxicReads
          </span>
        </button>
        <button
          onClick={() => setCollapsed(true)}
          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors focus:outline-none"
          aria-label="Collapse menu"
        >
          <PiCaretLeft
            size={16}
            className="text-muted-foreground transition-transform duration-300"
          />
        </button>
      </div>

      {/* ── Primary nav ── */}
      <nav className="space-y-1 mb-8">
        {navItems.map((item, i) => {
          const active = isActive(item.path) && !item.primary;
          const Icon = item.icon;
          if (item.primary) {
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className="sidebar-item group flex items-center justify-center gap-2 w-full py-3 rounded-md bg-foreground text-background font-mono uppercase tracking-[0.12em] text-[12px] hover:opacity-90 active:scale-[0.98] transition disabled:opacity-70"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <Icon size={16} weight="bold" />
                {item.label}
              </button>
            );
          }
          return (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className="sidebar-item group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-left hover:bg-accent transition-colors duration-200 focus:outline-none"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-full bg-foreground transition-opacity duration-200"
                style={{ opacity: active ? 1 : 0 }}
              />
              <Icon
                size={19}
                weight={active ? "fill" : "regular"}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
                style={{
                  color: active
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
                }}
              />
              <span
                className="font-mono uppercase text-[12px] tracking-[0.1em] transition-colors"
                style={{
                  color: active ? "var(--foreground)" : "var(--muted-foreground)",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Recent ── */}
      {isAuthenticated && recentPurchases.length > 0 && (
        <div className="mb-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
            Recent
          </p>
          <div className="space-y-1">
            {recentPurchases.map((purchase, i) => (
              <button
                key={purchase.id}
                onClick={() => {
                  navigate(`/book/${purchase.book?.id}`);
                  if (isMobile) setCollapsed(true);
                }}
                className="sidebar-item group flex items-center gap-3 w-full text-left py-1.5 px-1 rounded-md hover:bg-accent transition-colors focus:outline-none"
                style={{ animationDelay: `${120 + i * 45}ms` }}
              >
                <div
                  className="w-9 h-12 border border-border overflow-hidden flex-shrink-0"
                  style={{ transition: "transform 0.2s" }}
                >
                  <SafeImage
                    src={purchase.book?.coverImage || ""}
                    alt={purchase.book?.title || ""}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[14px] text-foreground truncate group-hover:underline underline-offset-2"
                    style={{ textUnderlineOffset: "2px" }}
                  >
                    {purchase.book?.title || "Unknown Book"}
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    ₦{purchase.purchasePrice}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── How it works ── */}
      <div className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
          How it works
        </p>
        <div>
          {howItWorks.map((step, i) => (
            <div
              key={i}
              className="sidebar-item flex items-start gap-3 py-2"
              style={{ animationDelay: `${180 + i * 40}ms` }}
            >
              <span className="font-mono text-[11px] text-muted-foreground pt-0.5 w-5 flex-shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[14px] text-foreground/90 leading-snug">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer / auth ── */}
      <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="sidebar-item group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-left hover:bg-accent transition-colors duration-200 focus:outline-none"
          >
            <PiSignOut
              size={19}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              style={{ color: "var(--muted-foreground)" }}
            />
            <span
              className="font-mono uppercase text-[12px] tracking-[0.1em]"
              style={{ color: "var(--muted-foreground)" }}
            >
              Log out
            </span>
          </button>
        ) : (
          <button
            onClick={() => {
              navigate("/login");
              if (isMobile) setCollapsed(true);
            }}
            className="sidebar-item flex items-center justify-center gap-2 w-full py-3 rounded-md bg-foreground text-background font-mono uppercase tracking-[0.12em] text-[12px] hover:opacity-90 active:scale-[0.98] transition"
          >
            Log in
          </button>
        )}
      </div>
    </div>
  );

  // Mobile: overlay with backdrop
  if (isMobile) {
    return (
      <>
        {!collapsed && (
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setCollapsed(true)}
          />
        )}
        <aside
          ref={panelRef}
          className="fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-out"
          style={{
            width: "min(85vw, 320px)",
            backgroundColor: "var(--background)",
            borderRight: "1px solid var(--border)",
            transform: collapsed ? "translateX(-100%)" : "translateX(0)",
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
        backgroundColor: "var(--background)",
        borderRight: collapsed ? "none" : "1px solid var(--border)",
      }}
    >
      {content}
    </aside>
  );
}
