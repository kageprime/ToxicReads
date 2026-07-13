import { useState } from "react";
import { PiX } from "react-icons/pi";

interface PaymentModalProps {
  price: string;
  title: string;
  onPay: () => Promise<void>;
  onClose: () => void;
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) return digits.slice(0, 2) + " / " + digits.slice(2);
  return digits;
}

export default function PaymentModal({
  price,
  title,
  onPay,
  onClose,
}: PaymentModalProps) {
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
    if (num.length !== 16) {
      setError("Card number must be 16 digits");
      return;
    }
    if (!cardName.trim()) {
      setError("Cardholder name is required");
      return;
    }
    if (expiry.replace(/\s/g, "").length !== 4) {
      setError("Invalid expiry date");
      return;
    }
    if (cvc.length !== 3) {
      setError("Invalid CVC");
      return;
    }

    setProcessing(true);

    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1500));

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
      style={{
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mx-4"
        style={{
          backgroundColor: "var(--background)",
          border: "1px solid var(--border)",
          animation: "modalIn 0.25s ease-out both",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 pt-4 pb-2"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 400,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--foreground)",
            }}
          >
            Complete Payment
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <PiX size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <div className="px-5 py-3">
          <p
            style={{
              fontSize: "17px",
              color: "var(--muted-foreground)",
              fontFamily: "var(--font-mono)",
              marginBottom: "2px",
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontSize: "22px",
              fontFamily: "var(--font-mono)",
              color: "var(--foreground)",
            }}
          >
            ₦{price}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
          <div>
            <label
              className="field-label"
            >
              Card Number
            </label>
            <input
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
              className="field-input"
            />
          </div>

          <div>
            <label
              className="field-label"
            >
              Cardholder Name
            </label>
            <input
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              placeholder="John Doe"
              className="field-input"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label
                style={{
                  fontSize: "16px",
                  color: "var(--muted-foreground)",
                  display: "block",
                  marginBottom: "3px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Expiry
              </label>
              <input
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM / YY"
                style={{
                  width: "100%",
                  fontSize: "18px",
                  padding: "8px 10px",
                  border: "1px solid var(--border)",
                  outline: "none",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-mono)",
                  background: "transparent",
                }}
              />
            </div>
            <div style={{ width: "80px" }}>
              <label
                style={{
                  fontSize: "16px",
                  color: "var(--muted-foreground)",
                  display: "block",
                  marginBottom: "3px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                CVC
              </label>
              <input
                value={cvc}
                onChange={e =>
                  setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))
                }
                placeholder="123"
                style={{
                  width: "100%",
                  fontSize: "18px",
                  padding: "8px 10px",
                  border: "1px solid var(--border)",
                  outline: "none",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-mono)",
                  background: "transparent",
                }}
              />
            </div>
          </div>

          {error && (
            <p
              style={{
                fontSize: "17px",
                color: "var(--color-p-red-fg)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={processing}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "18px",
              fontFamily: "var(--font-mono)",
              color: "var(--background)",
              background: processing ? "#999" : "var(--foreground)",
              border: "none",
              cursor: processing ? "wait" : "pointer",
              letterSpacing: "0.05em",
              marginTop: "4px",
            }}
          >
            {processing ? "PROCESSING..." : `PAY ₦${price}`}
          </button>

          <p
            style={{
              fontSize: "15px",
              color: "var(--muted-foreground)",
              fontFamily: "var(--font-mono)",
              textAlign: "center",
              marginTop: "8px",
            }}
          >
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
