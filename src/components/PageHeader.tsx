import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, ChevronLeft, Settings } from "lucide-react";

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
        backgroundColor: "var(--bg-warm-white)", 
        borderBottom: "1px solid var(--border-light)" 
      }}
    >
      <div className="flex items-center gap-2">
        {showBack && (
          <button 
            onClick={() => navigate(-1)} 
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={18} style={{ color: "var(--text-charcoal)" }} />
          </button>
        )}
        <button 
          onClick={() => navigate("/home")}
          className="font-sans text-xs font-normal tracking-wider uppercase text-charcoal hover:opacity-70 transition-opacity"
        >
          TOXICREADS
        </button>
        {title && (
          <span style={{ fontSize: "11px", color: "var(--text-grey)", marginLeft: "8px" }}>
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
            <Settings size={16} style={{ color: "#E74C3C" }} />
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
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={16} style={{ color: "var(--text-grey)" }} />
          </button>
        )}
      </div>
    </header>
  );
}