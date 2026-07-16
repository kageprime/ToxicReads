import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { PiSignOut, PiCaretLeft, PiTrash } from "react-icons/pi";

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
  const { isAdmin, logout } = useAuth();

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
          onClick={() => navigate("/home")}
          className="font-sans text-sm font-normal tracking-wider uppercase text-charcoal hover:opacity-70 transition-opacity"
        >
          TOXICREADS
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
