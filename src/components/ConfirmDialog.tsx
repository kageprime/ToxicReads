import { useEffect, useRef } from "react";
import { PiWarningCircle } from "react-icons/pi";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Accessible inline confirmation dialog. Replaces window.confirm(). */
export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-body"
    >
      <div
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-[420px] border border-border bg-card p-6 shadow-soft-lg">
        <div className="flex items-start gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
              danger
                ? "bg-p-red text-p-red-fg"
                : "bg-p-blue text-p-blue-fg"
            }`}
          >
            <PiWarningCircle size={20} />
          </span>
          <div className="min-w-0">
            <h3
              id="confirm-title"
              className="font-serif text-xl tracking-tight text-baobab"
            >
              {title}
            </h3>
            <p
              id="confirm-body"
              className="text-pretty mt-1 text-sm leading-relaxed text-muted-foreground"
            >
              {body}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={busy}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition active:scale-[0.98] disabled:opacity-60 ${
              danger
                ? "bg-p-red-fg text-white hover:opacity-90"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
