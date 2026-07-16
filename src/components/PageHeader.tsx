import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/contexts/SidebarContext";
import { PiSignOut, PiCaretLeft, PiTrash, PiList } from "react-icons/pi";

interface PageHeaderProps {
  title?: string;
  showBack?: boolean;
  showLogout?: boolean;
  showAdmin?: boolean;
  onDelete?: () => void;
  showDelete?: boolean;
}

export default function PageHeader({
  title,
  showBack = true,
  showLogout = false,
  showAdmin = false,
  onDelete,
  showDelete = false,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, logout } = useAuth();
  const { setCollapsed, isMobile } = useSidebar();

  const goLogo = () => {
    if (location.pathname === "/home") {
      navigate("/");
    } else {
      navigate("/home");
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 z-50"
      style={{
        height: "48px",
        backgroundColor: "hsl(var(--background))",
        borderBottom: "1px solid hsl(var(--border))",
      }}
    >
      <div className="flex items-center gap-2">
        {isMobile && (
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            aria-label="Open sidebar"
          >
            <PiList size={18} style={{ color: "hsl(var(--foreground))" }} />
          </button>
        )}
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            aria-label="Go back"
          >
            <PiCaretLeft size={18} style={{ color: "hsl(var(--foreground))" }} />
          </button>
        )}
        <button
          type="button"
          onClick={goLogo}
          className="flex items-center gap-2 min-w-0 group hover:opacity-80 transition-opacity focus:outline-none"
        >
          <img
            src="/images/hero-bg.png"
            alt="ToxicReads"
            className="w-6 h-6 rounded-md object-cover border border-border flex-shrink-0"
          />
          <span className="font-serif text-[18px] leading-none tracking-tight text-foreground">
            ToxicReads
          </span>
        </button>
        {title && (
          <span
            style={{
              fontSize: "17px",
              color: "hsl(var(--muted-foreground))",
              marginLeft: "8px",
            }}
          >
            / {title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {showDelete && onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-50 transition-colors"
            aria-label="Delete"
          >
            <PiTrash size={16} style={{ color: "rgb(var(--color-p-red-fg))" }} />
          </button>
        )}
        {showAdmin && isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded border border-border-light hover:border-charcoal transition-colors"
          >
            Admin
          </button>
        )}
        {showLogout && (
          <button
            onClick={logout}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            aria-label="Sign out"
          >
            <PiSignOut size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
          </button>
        )}
      </div>
    </header>
  );
}
