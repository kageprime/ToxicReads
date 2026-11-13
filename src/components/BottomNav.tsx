import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  PiCompass,
  PiBookOpen,
  PiUpload,
  PiUser,
  PiDotsThree,
} from "react-icons/pi";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { isMobile, collapsed, setCollapsed } = useSidebar();

  if (!isMobile) return null;

  const isAuthRoute = (path: string) =>
    path === "/my-purchases" || path === "/submit-book" || path === "/profile";

  const isActive = (path: string) => {
    if (path === "/home") return location.pathname === "/home";
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: "/home", label: "Browse", icon: PiCompass },
    { path: "/my-purchases", label: "Library", icon: PiBookOpen },
    { path: "/submit-book", label: "Publish", icon: PiUpload },
    { path: "/profile", label: "Account", icon: PiUser },
  ];

  const handleTap = (path: string) => {
    if (isAuthRoute(path) && !isAuthLoading && !isAuthenticated) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 inset-x-0 z-30 md:hidden border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => handleTap(item.path)}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <span
                  className="absolute top-0 inset-x-4 h-[2px] rounded-full bg-signal"
                  aria-hidden="true"
                />
              )}
              <Icon
                className={`h-5 w-5 ${active ? "text-signal" : ""}`}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
            !collapsed
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PiDotsThree className="h-5 w-5" aria-hidden="true" />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
