import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/contexts/SidebarContext";
import { PiList, PiBookOpen, PiUpload, PiUser, PiDotsThree } from "react-icons/pi";

const navItems = [
  { path: "/home", label: "Browse", icon: <PiList size={22} /> },
  { path: "/my-purchases", label: "Books", icon: <PiBookOpen size={22} /> },
  { path: "/submit-book", label: "Sell", icon: <PiUpload size={22} /> },
  { path: "/profile", label: "Account", icon: <PiUser size={22} /> },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { isMobile, collapsed, setCollapsed } = useSidebar();

  // Only on mobile, not on landing, reader, admin pages
  if (!isMobile) return null;
  if (
    location.pathname === "/" ||
    location.pathname.startsWith("/read/") ||
    location.pathname.startsWith("/admin")
  )
    return null;
  // Hide while sidebar is open
  if (!collapsed) return null;

  const active = (path: string) => {
    if (path === "/home") return location.pathname === "/home";
    // Handle dynamic paths — show active if current path starts with the item path
    // For /my-purchases, /profile, /submit-book — exact match
    if (path === "/my-purchases") return location.pathname === "/my-purchases";
    if (path === "/profile")
      return (
        location.pathname === "/profile" ||
        location.pathname === "/login" ||
        location.pathname === "/register"
      );
    if (path === "/submit-book")
      return (
        location.pathname === "/submit-book" ||
        location.pathname === "/my-submissions"
      );
    return false;
  };

  const go = (path: string) => {
    if (
      !isAuthLoading &&
      !isAuthenticated &&
      (path === "/my-purchases" || path === "/profile")
    ) {
      navigate("/login");
    } else {
      navigate(path);
    }
    setCollapsed(true);
  };

  const itemClass = (isActive: boolean) =>
    `flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 active:scale-95 ${
      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-border bg-background px-2 pt-1 md:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        minHeight: "calc(60px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {navItems.map(item => {
        const isActive = active(item.path);
        return (
          <button
            key={item.path}
            onClick={() => go(item.path)}
            aria-current={isActive ? "page" : undefined}
            className={itemClass(isActive)}
          >
            <span
              className={`grid h-7 place-items-center rounded-full px-4 transition-colors ${
                isActive ? "bg-accent" : ""
              }`}
            >
              {item.icon}
            </span>
            <span className="text-[11px] font-medium leading-none">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Quick Actions toggle */}
      <button
        onClick={() => setCollapsed(false)}
        aria-label="Open quick actions"
        className={itemClass(false)}
      >
        <span className="grid h-7 place-items-center">
          <PiDotsThree size={22} />
        </span>
        <span className="text-[11px] font-medium leading-none">More</span>
      </button>
    </nav>
  );
}
