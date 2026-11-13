import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { bookUrl } from "../../contracts/blog";
import NotificationsBell from "@/components/NotificationsBell";
import { useSidebar } from "@/contexts/SidebarContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSwipe } from "@/hooks/useSwipe";
import SafeImage from "@/components/SafeImage";
import BrandMark from "@/components/BrandMark";
import {
  PiCompass,
  PiBookOpen,
  PiUpload,
  PiList,
  PiHeart,
  PiSquaresFour,
  PiUser,
  PiShieldCheck,
  PiSignIn,
  PiSignOut,
  PiSun,
  PiMoon,
  PiSidebarSimple,
  PiX,
} from "react-icons/pi";

interface NavItem {
  label: string;
  path: string;
  icon: typeof PiBookOpen;
  adminOnly?: boolean;
}

export default function LeftColumn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, isAuthLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { collapsed, setCollapsed, isMobile } = useSidebar();

  const { data: purchases } = trpc.purchase.myPurchases.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useSwipe({
    onSwipeLeft: () => {
      if (isMobile && !collapsed) setCollapsed(true);
    },
    threshold: 35,
  });

  useSwipe({
    onSwipeRight: () => {
      if (isMobile && collapsed) setCollapsed(false);
    },
    edgeOnly: "left",
    threshold: 30,
  });

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
    { label: "Browse books", path: "/home", icon: PiCompass },
    { label: "My library", path: "/my-purchases", icon: PiBookOpen },
    { label: "Wishlist", path: "/wishlist", icon: PiHeart },
    { label: "Sell a book", path: "/submit-book", icon: PiUpload },
    { label: "Submissions", path: "/my-submissions", icon: PiList },
    { label: "Sales", path: "/seller", icon: PiSquaresFour },
    { label: "Account", path: "/profile", icon: PiUser },
    { label: "Admin", path: "/admin", icon: PiShieldCheck, adminOnly: true },
  ].filter((item) => !item.adminOnly || isAdmin);

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

  const isMini = collapsed && !isMobile;

  const content = (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground overflow-hidden">
      {/* Header */}
      <div
        className={`flex items-center flex-shrink-0 px-4 py-4 border-b border-sidebar-border ${
          isMini ? "justify-center" : "justify-between"
        }`}
      >
        {!isMini && (
          <button
            type="button"
            onClick={goLogo}
            aria-label={
              location.pathname === "/home"
                ? "Go to landing page"
                : "Browse books"
            }
            className="hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            <BrandMark to={null} size="sm" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={
            isMobile
              ? "Close menu"
              : collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
          }
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          {isMobile ? (
            <PiX className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PiSidebarSimple className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Primary navigation */}
      <nav
        aria-label="Primary sidebar"
        className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => go(item.path)}
              title={isMini ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={`group relative w-full flex items-center rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                isMini ? "justify-center px-0" : "gap-3"
              } ${
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
              }`}
            >
              {active && !isMini && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2.5px] rounded-r-full bg-signal"
                  aria-hidden="true"
                />
              )}
              <Icon
                className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                  active ? "text-signal" : "text-current"
                }`}
                aria-hidden="true"
              />
              {!isMini && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}

        {/* Recent purchases mini-shelf */}
        {!isMini && purchases && purchases.length > 0 && (
          <div className="pt-5 mt-4 border-t border-sidebar-border">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11.5px] font-medium text-muted-foreground">
                Recent reads
              </span>
              <button
                type="button"
                onClick={() => go("/my-purchases")}
                className="text-[11.5px] text-muted-foreground hover:text-foreground transition-colors"
              >
                All
              </button>
            </div>
            <div className="space-y-1">
              {purchases.slice(0, 3).map((purchase) => (
                <button
                  key={purchase.id}
                  type="button"
                  onClick={() =>
                    go(purchase.book ? bookUrl(purchase.book) : "/home")
                  }
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left hover:bg-sidebar-accent/60 transition-colors"
                >
                  <div className="w-6 aspect-[2/3] rounded-[2px] overflow-hidden bg-secondary cover-frame shrink-0">
                    {purchase.book?.coverImage && (
                      <SafeImage
                        src={purchase.book.coverImage}
                        alt={purchase.book.title || "Book cover"}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground/90 truncate">
                    {purchase.book?.title || "Untitled"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Utility footer */}
      <div
        className={`flex-shrink-0 border-t border-sidebar-border p-3 ${
          isMini ? "flex flex-col items-center gap-2" : "space-y-2.5"
        }`}
      >
        <div
          className={`flex items-center ${
            isMini ? "flex-col gap-2" : "justify-between px-1"
          }`}
        >
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="h-9 w-9 rounded-full flex items-center justify-center border border-sidebar-border bg-background/60 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            {theme === "dark" ? (
              <PiSun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PiMoon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {!isMini && <NotificationsBell />}
        </div>

        {isAuthLoading ? (
          <div className="flex justify-center py-2">
            <span className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
          </div>
        ) : isAuthenticated ? (
          <button
            type="button"
            onClick={() => {
              logout();
              if (isMobile) setCollapsed(true);
            }}
            title={isMini ? "Sign out" : undefined}
            className={`w-full flex items-center rounded-lg px-3 py-2 text-[13.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors ${
              isMini ? "justify-center px-0" : "gap-3"
            }`}
          >
            <PiSignOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {!isMini && <span>Sign out</span>}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => go("/login")}
            title={isMini ? "Sign in" : undefined}
            className={`w-full flex items-center justify-center rounded-full bg-primary text-primary-foreground py-2 text-[13.5px] font-medium hover:opacity-90 transition-opacity ${
              isMini ? "h-9 w-9 px-0" : "gap-2 px-4"
            }`}
          >
            <PiSignIn className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!isMini && <span>Sign in</span>}
          </button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {!collapsed && (
          <div
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-xs"
            onClick={() => setCollapsed(true)}
            aria-hidden="true"
          />
        )}
        <aside
          aria-label="Mobile menu"
          className={`fixed top-0 left-0 z-50 h-full w-[268px] border-r border-sidebar-border shadow-soft-lg transition-transform duration-300 ease-spring ${
            collapsed ? "-translate-x-full pointer-events-none" : "translate-x-0"
          }`}
        >
          {content}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={`flex-shrink-0 h-full border-r border-sidebar-border transition-[width] duration-250 ease-spring ${
        collapsed ? "w-[68px]" : "w-[244px]"
      }`}
    >
      {content}
    </aside>
  );
}
