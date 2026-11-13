import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { PiBell, PiBellRinging, PiCheck } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function NotificationsBell() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = trpc.notifications.unreadCount.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 30000 }
  );

  const { data: notifications = [] } = trpc.notifications.list.useQuery(
    undefined,
    { enabled: isAuthenticated && open }
  );

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
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        className="relative h-9 w-9 rounded-full flex items-center justify-center border border-border bg-background/80 text-foreground hover:bg-secondary transition-colors"
      >
        {unreadCount > 0 ? (
          <PiBellRinging className="h-4 w-4 text-signal" aria-hidden="true" />
        ) : (
          <PiBell className="h-4 w-4" aria-hidden="true" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-signal text-signal-foreground text-[10px] font-mono font-medium flex items-center justify-center tnum">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed sm:absolute right-4 sm:right-0 top-16 sm:top-11 w-[calc(100vw-2rem)] sm:w-80 rounded-xl border border-border bg-popover text-popover-foreground shadow-soft-lg z-50 overflow-hidden"
          role="region"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-medium text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <PiCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    if (!n.read) markRead.mutate({ id: n.id });
                    if (n.link) {
                      setOpen(false);
                      navigate(n.link);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-secondary/60 transition-colors flex items-start gap-2.5 ${
                    !n.read ? "bg-secondary/35" : ""
                  }`}
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                      !n.read ? "bg-signal" : "bg-transparent"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground leading-snug">
                      {n.message}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground mt-1 tnum">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
