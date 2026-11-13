import { useEffect, useState } from "react";
import { PiX, PiLockSimple } from "react-icons/pi";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

interface PaymentModalProps {
  bookId: number;
  price: string;
  title: string;
  onClose: () => void;
}

function formatNaira(price: string) {
  const numeric = Number(String(price).replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) {
    return `₦${numeric.toLocaleString("en-NG")}`;
  }
  return `₦${price}`;
}

/** Paystack hosted checkout: order summary -> redirect to Paystack. */
export default function PaymentModal({
  bookId,
  price,
  title,
  onClose,
}: PaymentModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const initMutation = trpc.purchase.paystackInit.useMutation({
    onSuccess: async (data) => {
      if (data.free) {
        await utils.book.hasPurchased.invalidate();
        await utils.purchase.myPurchases.invalidate();
        toast.success("Added to your library");
        onClose();
        return;
      }
      window.location.href = data.authorizationUrl;
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address for your receipt.");
      return;
    }
    initMutation.mutate({
      bookId,
      email: email.trim(),
      callbackBase: window.location.origin,
    });
  };

  const formattedPrice = formatNaira(price);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/75 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground shadow-soft-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2
            id="payment-modal-title"
            className="font-serif text-xl font-medium text-foreground tracking-tight"
          >
            Complete purchase
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close payment modal"
          >
            <PiX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-4 bg-secondary/40 border-b border-border">
          <p className="font-serif text-lg font-medium text-foreground leading-snug text-pretty">
            {title}
          </p>
          <p className="font-mono text-2xl font-medium text-foreground tnum mt-1">
            {formattedPrice}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="pay-email" className="field-label mb-1.5">
              Email for receipt
            </label>
            <input
              id="pay-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="field-input"
              autoFocus
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={initMutation.isPending}
            className="w-full py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-wait"
          >
            {initMutation.isPending
              ? "Starting checkout..."
              : `Pay ${formattedPrice}`}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground pt-1">
            <PiLockSimple className="h-3.5 w-3.5" aria-hidden="true" />
            Cards, bank transfer &amp; USSD secured by Paystack
          </p>
        </form>
      </div>
    </div>
  );
}
