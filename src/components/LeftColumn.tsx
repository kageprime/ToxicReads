import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useSidebar } from "@/contexts/SidebarContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSwipe } from "@/hooks/useSwipe";
import SafeImage from "@/components/SafeImage";
import {
  PiCaretLeft,
  PiCompass,
  PiSun,
  PiMoon,
  PiUpload,
  PiBookOpen,
  PiList,
  PiUser,
  PiSignOut,
  PiSquaresFour,
  PiHeart,
} from "react-icons/pi";

interface NavItem {
  label: string;
  path: string;
  icon: typeof PiBookOpen;
  primary?: boolean;
  adminOnly?: boolean;
}

export default function LeftColumn() {
  const { isAuthenticated, isAdmin, isAuthLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    { label: "Sell your book", path: "/submit-book", icon: PiUpload },
    { label: "Browse books", path: "/home", icon: PiCompass },
    { label: "My library", path: "/my-purchases", icon: PiBookOpen },
    { label: "Submissions", path: "/my-submissions", icon: PiList },
    { label: "Wishlist", path: "/wishlist", icon: PiHeart },
    { label: "Sales", path: "/seller", icon: PiSquaresFour },
    { label: "Account", path: "/profile", icon: PiUser },
    { label: "Admin", path: "/admin", icon: PiSquaresFour, adminOnly: true },
  ].filter(item => !item.adminOnly || isAdmin);

  const isActive = (path: string) =>
    path === "/home"
      ? location.pathname === "/home"
      : location.pathname.startsWith(path);

  const go = (path: string) => {
    navigate(path);
    if (isMobile) setCollapsed(true);
  };

  const goLogo = () => {
    navigate(location.pathname === "/home" ? "/" : "/home");
    if (isMobile) setCollapsed(true);
  };

  const content = (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      {/* ── Brand header ── */}
      <div className="flex items-center justify-between flex-shrink-0" style={{ padding: "20px 18px 16px" }}>
        <button
          type="button"
          onClick={goLogo}
          aria-label={location.pathname === "/home" ? "Go to landing page" : "Browse books"}
          className="group flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity focus:outline-none"
        >
          <span className="relative flex-shrink-0">
            <img
              src="/images/hero-bg.png"
              alt="ToxicReads"
              className="w-8 h-8 rounded-lg object-cover border border-border"
            />
          </span>
          <span className="font-serif text-[21px] leading-none tracking-tight text-foreground truncate">
            ToxicReads
          </span>
        </button>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Dark mode" : "Light mode"}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors focus:outline-none"
          >
            {theme === "light" ? (
              <PiMoon size={16} className="text-muted-foreground" />
            ) : (
              <PiSun size={16} className="text-muted-foreground" />
            )}
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
      </div>

      <div
        className="flex-shrink-0"
        style={{ height: "1px", background: "hsl(var(--border))", margin: "0 12px" }}
      />

      {/* ── Scrollable body ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: isMobile
            ? "20px 14px calc(4rem + env(safe-area-inset-bottom, 16px))"
            : "20px 14px 20px",
        }}
      >
        {/* ── Navigation ── */}
        <nav className="mt-5 space-y-0.5">
          {navItems
            .filter(item => !item.primary)
            .map((item, i) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className="sidebar-item group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors duration-200 focus:outline-none"
                  style={{
                    animationDelay: `${i * 40}ms`,
                    backgroundColor: active ? "hsl(var(--accent))" : "transparent",
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.backgroundColor = "hsl(var(--accent))";
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2.5px] rounded-full bg-foreground"
                      style={{ left: "-1px" }}
                    />
                  )}
                  <Icon
                    size={19}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 flex-shrink-0"
                    style={{
                      color: active
                        ? "hsl(var(--foreground))"
                        : "hsl(var(--muted-foreground))",
                    }}
                  />
                  <span
                    className="font-mono uppercase text-[12px] tracking-[0.1em] transition-colors"
                    style={{
                      color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
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
          <div className="mt-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-2.5 px-3">
              Recent
            </p>
            <div className="space-y-0.5">
              {recentPurchases.map((purchase, i) => (
                <button
                  key={purchase.id}
                  onClick={() => {
                    navigate(`/book/${purchase.book?.id}`);
                    if (isMobile) setCollapsed(true);
                  }}
                  className="sidebar-item group flex items-center gap-3 w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent transition-colors focus:outline-none"
                  style={{ animationDelay: `${80 + i * 40}ms` }}
                >
                  <div
                    className="w-8 h-11 rounded border border-border overflow-hidden flex-shrink-0"
                    style={{ transition: "transform 0.2s" }}
                  >
                    <SafeImage
                      src={purchase.book?.coverImage || ""}
                      alt={purchase.book?.title || ""}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] text-foreground truncate group-hover:underline underline-offset-2">
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
      </div>

      {/* ── Footer / auth ── */}
      <div
        className="flex-shrink-0"
        style={{ borderTop: "1px solid hsl(var(--border))" }}
      >
        <div style={{ padding: "12px 14px" }}>
          {isAuthLoading ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-60">
              <span className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
            </div>
          ) : isAuthenticated ? (
            <button
              onClick={logout}
              className="sidebar-item group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left hover:bg-accent transition-colors duration-200 focus:outline-none"
            >
              <PiSignOut
                size={19}
                className="transition-transform duration-200 group-hover:translate-x-0.5 flex-shrink-0"
                style={{ color: "hsl(var(--muted-foreground))" }}
              />
              <span
                className="font-mono uppercase text-[12px] tracking-[0.1em]"
                style={{ color: "hsl(var(--muted-foreground))" }}
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
              className="sidebar-item flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-foreground text-background font-mono uppercase tracking-[0.14em] text-[12px] hover:opacity-90 active:scale-[0.98] transition"
            >
              Log in
            </button>
          )}
        </div>
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
            backgroundColor: "hsl(var(--background))",
            borderRight: "1px solid hsl(var(--border))",
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
        backgroundColor: "hsl(var(--background))",
        borderRight: collapsed ? "none" : "1px solid hsl(var(--border))",
      }}
    >
      {content}
    </aside>
  );
}
