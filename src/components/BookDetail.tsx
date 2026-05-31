import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { conditionLabels, conditionColors } from "../../contracts/blog";
import PaymentModal from "./PaymentModal";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const bookId = Number(id);
  const { data: book, isLoading } = trpc.book.byId.useQuery(
    { id: bookId },
    { enabled: !isNaN(bookId) },
  );

  const { data: hasPurchased } = trpc.book.hasPurchased.useQuery(
    { id: bookId },
    { enabled: isAuthenticated && !isNaN(bookId) },
  );

  const { data: similarBooks } = trpc.book.list.useQuery(
    undefined,
    { enabled: !!book },
  );

  const utils = trpc.useUtils();

  const buyMutation = trpc.purchase.buy.useMutation({
    onSuccess: () => {
      utils.purchase.myPurchases.invalidate();
      utils.book.hasPurchased.invalidate();
      setBought(true);
    },
    onError: (err) => {
      setBuyError(err.message);
    },
  });

  const incrementView = trpc.book.incrementView.useMutation();

  useEffect(() => {
    if (!isNaN(bookId)) {
      incrementView.mutate({ id: bookId });
    }
  }, [bookId]);

  const [bought, setBought] = useState(false);
  const [buyError, setBuyError] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const handlePay = async (): Promise<void> => {
    if (!book) return;
    await buyMutation.mutateAsync({ bookId: book.id });
    setShowPayment(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "100vh", backgroundColor: "var(--bg-warm-white)" }}>
        <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>LOADING...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center" style={{ height: "100vh", backgroundColor: "var(--bg-warm-white)" }}>
        <div className="text-center">
          <p style={{ fontSize: "14px", color: "var(--text-grey)" }}>Book not found</p>
          <button onClick={() => navigate("/home")} style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const isFree = book.price === "0" || book.price === "0.00";
  const isOwner = hasPurchased || bought || isFree;
  const canRead = (isOwner || isFree) && !!book.content;
  const conditionLabel = conditionLabels[book.condition] || book.condition.toUpperCase();
  const conditionColor = conditionColors[book.condition] || "var(--text-grey)";

  const similar = similarBooks?.filter(b => b.category === book.category && b.id !== book.id).slice(0, 4) || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-warm-white)" }}>
      <header 
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 z-50"
        style={{ 
          height: "48px", 
          backgroundColor: "var(--bg-warm-white)", 
          borderBottom: "1px solid var(--border-light)" 
        }}
      >
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate("/home")}
            className="text-xs font-normal tracking-wider uppercase text-charcoal hover:opacity-70 transition-opacity"
          >
            TOXICREADS
          </button>
        </div>

        </header>

      <div className="mx-auto" style={{ maxWidth: "720px", padding: "64px 24px 80px", animation: "pageIn 0.4s ease-out both" }}>
        {/* Back Button - Before Image */}
        <button 
          onClick={() => navigate("/home")}
          className="flex items-center gap-1 mb-6 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={14} style={{ color: "var(--text-grey)" }} />
          <span style={{ fontSize: "11px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>
            Back
          </span>
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Image */}
          <div style={{ border: "1px solid var(--border-light)", flexShrink: 0, width: "100%", maxWidth: "320px" }}>
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-auto block"
              style={{ aspectRatio: "3/4", objectFit: "cover" }}
              loading="eager"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: conditionColor, border: `1px solid ${conditionColor}`, padding: "2px 8px" }}>
                {conditionLabel}
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>
                {book.category.toUpperCase()}
              </span>
              {book.content && (
                <span style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "#666", border: "1px solid var(--border-light)", padding: "2px 8px" }}>
                  Includes reading content
                </span>
              )}
            </div>

            <h1 style={{ fontSize: "22px", fontWeight: 400, lineHeight: 1.3, color: "var(--text-charcoal)", marginBottom: "6px" }}>
              {book.title}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-grey)", marginBottom: "16px" }}>
              by {book.author}
            </p>

            <p style={{ fontSize: "14px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", marginBottom: "4px" }}>
              {isFree ? "Free" : `$${book.price}`}
            </p>
            <p style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "var(--text-grey)", marginBottom: "24px" }}>
              {book.views} view{book.views !== 1 ? "s" : ""}
            </p>

            {/* Actions */}
            {canRead ? (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/read/${book.id}`)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "12px",
                    fontFamily: "'Space Mono', monospace",
                    color: "var(--bg-warm-white)",
                    background: "var(--text-charcoal)",
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                  }}
                >
                  READ
                </button>
                <div
                  style={{
                    padding: "12px 16px",
                    fontSize: "12px",
                    fontFamily: "'Space Mono', monospace",
                    color: "#2ECC71",
                    border: "1px solid #2ECC71",
                    letterSpacing: "0.05em",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  PURCHASED
                </div>
              </div>
            ) : bought ? (
              <div
                style={{
                  padding: "12px",
                  fontSize: "12px",
                  fontFamily: "'Space Mono', monospace",
                  color: "#2ECC71",
                  border: "1px solid #2ECC71",
                  textAlign: "center",
                  letterSpacing: "0.05em",
                  marginBottom: "16px",
                }}
              >
                PURCHASED
              </div>
            ) : isAuthenticated ? (
              <button
                onClick={() => {
                  setBuyError("");
                  setShowPayment(true);
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "12px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--bg-warm-white)",
                  background: "var(--text-charcoal)",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  marginBottom: "16px",
                }}
              >
                BUY NOW
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "12px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--text-grey)",
                  background: "transparent",
                  border: "1px solid var(--border-light)",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  marginBottom: "16px",
                }}
              >
                {isFree ? "LOG IN TO READ" : "LOG IN TO BUY"}
              </button>
            )}

            {(buyMutation.error?.message || buyError) && (
              <p style={{ fontSize: "11px", color: "#E74C3C", marginBottom: "12px", fontFamily: "'Space Mono', monospace" }}>
                {buyError || buyMutation.error?.message}
              </p>
            )}

            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "16px" }}>
              <h3 style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-grey)", marginBottom: "8px" }}>
                DESCRIPTION
              </h3>
              <p style={{ fontSize: "13px", lineHeight: 1.8, color: "var(--text-charcoal)" }}>
                {book.description}
              </p>
            </div>
          </div>
        </div>

        {/* Similar Books */}
        {similar.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border-light)", marginTop: "48px", paddingTop: "24px" }}>
            <h3 style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-grey)", marginBottom: "16px" }}>
              SIMILAR BOOKS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {similar.map((similarBook) => (
                <div 
                  key={similarBook.id}
                  onClick={() => navigate(`/book/${similarBook.id}`)}
                  className="cursor-pointer"
                >
                  <div style={{ border: "1px solid var(--border-light)", aspectRatio: "3/4", marginBottom: "8px", overflow: "hidden" }}>
                    <img 
                      src={similarBook.coverImage} 
                      alt={similarBook.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-charcoal)", lineHeight: 1.3, marginBottom: "2px" }}>
                    {similarBook.title}
                  </p>
                  <p style={{ fontSize: "10px", color: "var(--text-grey)" }}>
                    ${similarBook.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {showPayment && book && (
        <PaymentModal
          price={book.price}
          title={book.title}
          onPay={handlePay}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}