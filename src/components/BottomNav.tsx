import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/contexts/SidebarContext";

const navItems = [
  { path: "/home", label: "Browse", icon: "☰" },
  { path: "/my-purchases", label: "Books", icon: "○" },
  { path: "/submit-book", label: "Sell", icon: "✎" },
  { path: "/profile", label: "Account", icon: "◇" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isMobile, collapsed, setCollapsed } = useSidebar();

  // Only on mobile, not on landing, reader, admin pages
  if (!isMobile) return null;
  if (location.pathname === "/" || location.pathname.startsWith("/read/") || location.pathname.startsWith("/admin")) return null;
  // Hide while sidebar is open
  if (!collapsed) return null;

  const active = (path: string) => {
    if (path === "/home") return location.pathname === "/home";
    // Handle dynamic paths — show active if current path starts with the item path
    // For /my-purchases, /profile, /submit-book — exact match
    if (path === "/my-purchases") return location.pathname === "/my-purchases";
    if (path === "/profile") return location.pathname === "/profile" || location.pathname === "/login" || location.pathname === "/register";
    if (path === "/submit-book") return location.pathname === "/submit-book" || location.pathname === "/my-submissions";
    return false;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t md:hidden"
      style={{
        backgroundColor: "var(--bg-warm-white)",
        borderColor: "var(--border-light)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        height: "calc(56px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => {
            if (!isAuthenticated && (item.path === "/my-purchases" || item.path === "/profile")) {
              navigate("/login");
            } else {
              navigate(item.path);
            }
            setCollapsed(true);
          }}
          className="flex flex-col items-center justify-center gap-0.5 transition-opacity hover:opacity-70"
          style={{
            minWidth: "56px", minHeight: "44px", background: "none", border: "none", cursor: "pointer",
          }}
        >
          <span style={{
            fontSize: "16px",
            color: active(item.path) ? "var(--text-charcoal)" : "var(--text-grey)",
          }}>
            {item.icon}
          </span>
          <span style={{
            fontSize: "9px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.05em",
            color: active(item.path) ? "var(--text-charcoal)" : "var(--text-grey)",
          }}>
            {item.label.toUpperCase()}
          </span>
        </button>
      ))}

      {/* Quick Actions toggle */}
      <button
        onClick={() => setCollapsed(false)}
        className="flex flex-col items-center justify-center gap-0.5 transition-opacity hover:opacity-70"
        style={{
          minWidth: "56px", minHeight: "44px", background: "none", border: "none", cursor: "pointer",
        }}
      >
        <span style={{ fontSize: "16px", color: "var(--text-charcoal)" }}>···</span>
        <span style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.05em", color: "var(--text-grey)" }}>
          MORE
        </span>
      </button>
    </nav>
  );
}
