import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { PiBell, PiBellRinging } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function NotificationsBell() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: notifications } = trpc.notifications.list.useQuery(undefined, {
    enabled: isAuthenticated && open,
  });

  const utils = trpc.useUtils();

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          if (!isAuthenticated) navigate("/login");
          else setOpen(!open);
        }}
        className="relative p-2 hover:bg-accent rounded-full transition-colors"
        aria-label="Notifications"
      >
        {unreadCount && unreadCount > 0 ? (
          <PiBellRinging size={20} style={{ color: "hsl(var(--foreground))" }} />
        ) : (
          <PiBell size={20} style={{ color: "hsl(var(--muted-foreground))" }} />
        )}
        {unreadCount && unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "rgb(var(--color-p-red-fg))",
              color: "#fff",
              fontSize: "9px",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-[320px] max-h-[400px] overflow-y-auto"
          style={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid hsl(var(--border))" }}
          >
            <span
              className="font-mono uppercase tracking-[0.1em]"
              style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}
            >
              Notifications
            </span>
            {unreadCount && unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="font-mono text-[11px] uppercase tracking-[0.1em] hover:underline"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read) markRead.mutate({ id: n.id });
                  if (n.link) navigate(n.link);
                  setOpen(false);
                }}
                className="px-4 py-3 cursor-pointer transition-colors hover:bg-accent"
                style={{
                  borderBottom: "1px solid hsl(var(--border))",
                  backgroundColor: n.read ? "transparent" : "rgba(var(--color-p-yellow), 0.3)",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    color: "hsl(var(--foreground))",
                    lineHeight: 1.4,
                  }}
                >
                  {n.message}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "hsl(var(--muted-foreground))",
                    marginTop: "4px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center py-8 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              No notifications
            </p>
          )}
        </div>
      )}
    </div>
  );
}
