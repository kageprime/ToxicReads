import { useState } from "react";
import { PiX, PiLockSimple } from "react-icons/pi";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

interface PaymentModalProps {
  bookId: number;
  price: string;
  title: string;
  onClose: () => void;
}

/** Paystack hosted checkout: order summary → redirect to Paystack. */
export default function PaymentModal({
  bookId,
  price,
  title,
  onClose,
}: PaymentModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();

  const initMutation = trpc.purchase.paystackInit.useMutation({
    onSuccess: async data => {
      if (data.free) {
        await utils.book.hasPurchased.invalidate();
        await utils.purchase.myPurchases.invalidate();
        toast.success("Added to your library");
        onClose();
        return;
      }
      // Hand off to Paystack; we return via /payment/callback.
      window.location.href = data.authorizationUrl;
    },
    onError: err => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email for your receipt");
      return;
    }
    initMutation.mutate({
      bookId,
      email: email.trim(),
      callbackBase: window.location.origin,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Complete payment"
    >
      <div
        className="w-full max-w-sm bg-background border border-border"
        style={{ animation: "modalIn 0.25s ease-out both" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <h2 className="text-lg tracking-wide text-foreground">
            Complete payment
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <PiX size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-border">
          <p className="text-pretty text-[17px] text-muted-foreground leading-snug">
            {title}
          </p>
          <p className="tnum mt-1 font-mono text-2xl text-foreground">
            ₦{price}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label htmlFor="pay-email" className="field-label mb-1.5">
              Email for receipt
            </label>
            <input
              id="pay-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="field-input"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-p-red-fg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={initMutation.isPending}
            className="w-full p-3 text-lg bg-foreground text-background transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
          >
            {initMutation.isPending ? "Starting checkout…" : `Pay ₦${price}`}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-[13px] text-muted-foreground">
            <PiLockSimple size={14} />
            Cards, transfer &amp; USSD — secured by Paystack
          </p>
        </form>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
