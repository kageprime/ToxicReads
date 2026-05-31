import { useState } from "react";
import { X } from "lucide-react";

interface PaymentModalProps {
  price: string;
  title: string;
  onPay: () => Promise<void>;
  onClose: () => void;
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) return digits.slice(0, 2) + " / " + digits.slice(2);
  return digits;
}

export default function PaymentModal({ price, title, onPay, onClose }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const num = cardNumber.replace(/\s/g, "");
    if (num.length !== 16) { setError("Card number must be 16 digits"); return; }
    if (!cardName.trim()) { setError("Cardholder name is required"); return; }
    if (expiry.replace(/\s/g, "").length !== 4) { setError("Invalid expiry date"); return; }
    if (cvc.length !== 3) { setError("Invalid CVC"); return; }

    setProcessing(true);

    // Simulate payment processing delay
    await new Promise((r) => setTimeout(r, 1500));

    // Mock: cards ending in 0000 are declined
    if (num.endsWith("0000")) {
      setProcessing(false);
      setError("Card declined. Please try a different card.");
      return;
    }

    try {
      await onPay();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mx-4"
        style={{
          backgroundColor: "var(--bg-warm-white)",
          border: "1px solid var(--border-light)",
          animation: "modalIn 0.25s ease-out both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <h2 style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-charcoal)" }}>
            Complete Payment
          </h2>
          <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity">
            <X size={16} style={{ color: "var(--text-grey)" }} />
          </button>
        </div>

        <div className="px-5 py-3">
          <p style={{ fontSize: "11px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace", marginBottom: "2px" }}>
            {title}
          </p>
          <p style={{ fontSize: "16px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)" }}>
            ${price}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
          <div>
            <label style={{ fontSize: "10px", color: "var(--text-grey)", display: "block", marginBottom: "3px", fontFamily: "'Space Mono', monospace" }}>
              Card Number
            </label>
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
              style={{
                width: "100%", fontSize: "12px", padding: "8px 10px",
                border: "1px solid var(--border-light)", outline: "none",
                color: "var(--text-charcoal)", fontFamily: "'Space Mono', monospace",
                background: "transparent",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "10px", color: "var(--text-grey)", display: "block", marginBottom: "3px", fontFamily: "'Space Mono', monospace" }}>
              Cardholder Name
            </label>
            <input
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="John Doe"
              style={{
                width: "100%", fontSize: "12px", padding: "8px 10px",
                border: "1px solid var(--border-light)", outline: "none",
                color: "var(--text-charcoal)", fontFamily: "'Space Mono', monospace",
                background: "transparent",
              }}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label style={{ fontSize: "10px", color: "var(--text-grey)", display: "block", marginBottom: "3px", fontFamily: "'Space Mono', monospace" }}>
                Expiry
              </label>
              <input
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM / YY"
                style={{
                  width: "100%", fontSize: "12px", padding: "8px 10px",
                  border: "1px solid var(--border-light)", outline: "none",
                  color: "var(--text-charcoal)", fontFamily: "'Space Mono', monospace",
                  background: "transparent",
                }}
              />
            </div>
            <div style={{ width: "80px" }}>
              <label style={{ fontSize: "10px", color: "var(--text-grey)", display: "block", marginBottom: "3px", fontFamily: "'Space Mono', monospace" }}>
                CVC
              </label>
              <input
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder="123"
                style={{
                  width: "100%", fontSize: "12px", padding: "8px 10px",
                  border: "1px solid var(--border-light)", outline: "none",
                  color: "var(--text-charcoal)", fontFamily: "'Space Mono', monospace",
                  background: "transparent",
                }}
              />
            </div>
          </div>

          {error && (
            <p style={{ fontSize: "11px", color: "#E74C3C", fontFamily: "'Space Mono', monospace" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={processing}
            style={{
              width: "100%", padding: "12px", fontSize: "12px", fontFamily: "'Space Mono', monospace",
              color: "var(--bg-warm-white)", background: processing ? "#999" : "var(--text-charcoal)",
              border: "none", cursor: processing ? "wait" : "pointer",
              letterSpacing: "0.05em", marginTop: "4px",
            }}
          >
            {processing ? "PROCESSING..." : `PAY $${price}`}
          </button>

          <p style={{ fontSize: "9px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace", textAlign: "center", marginTop: "8px" }}>
            Mock payment — no real charges
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