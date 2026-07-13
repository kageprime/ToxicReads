import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { PiCaretLeft } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import PaymentModal from "./PaymentModal";
import BookCard from "./BookCard";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const bookId = Number(id);
  const { data: book, isLoading } = trpc.book.byId.useQuery(
    { id: bookId },
    { enabled: !isNaN(bookId) }
  );

  const { data: hasPurchased } = trpc.book.hasPurchased.useQuery(
    { id: bookId },
    { enabled: isAuthenticated && !isNaN(bookId) }
  );

  const { data: similarBooks } = trpc.book.list.useQuery(undefined, {
    enabled: !!book,
  });

  const utils = trpc.useUtils();

  const buyMutation = trpc.purchase.buy.useMutation({
    onSuccess: () => {
      utils.purchase.myPurchases.invalidate();
      utils.book.hasPurchased.invalidate();
      setBought(true);
    },
    onError: err => {
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
      <div
        className="flex items-center justify-center"
        style={{ height: "100vh", backgroundColor: "var(--background)" }}
      >
        <p
          style={{
            fontSize: "18px",
            color: "var(--muted-foreground)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          LOADING...
        </p>
      </div>
    );
  }

  if (!book) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "100vh", backgroundColor: "var(--background)" }}
      >
        <div className="text-center">
          <p style={{ fontSize: "20px", color: "var(--muted-foreground)" }}>
            Book not found
          </p>
          <button
            onClick={() => navigate("/home")}
            style={{
              marginTop: "16px",
              fontSize: "18px",
              color: "var(--foreground)",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const isFree = book.price === "0" || book.price === "0.00";
  const isOwner = hasPurchased || bought || isFree;
  const canRead = (isOwner || isFree) && !!book.content;

  const similar =
    similarBooks
      ?.filter(b => b.category === book.category && b.id !== book.id)
      .slice(0, 4) || [];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: "720px",
          padding: "32px 24px 80px",
          animation: "pageIn 0.4s ease-out both",
        }}
      >
        {/* Back Button - Before Image */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-1 mb-6 hover:opacity-70 transition-opacity"
        >
          <PiCaretLeft size={14} style={{ color: "var(--muted-foreground)" }} />
          <span
            style={{
              fontSize: "17px",
              color: "var(--muted-foreground)",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            Back
          </span>
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Image */}
          <div
            style={{
              border: "1px solid var(--border)",
              flexShrink: 0,
              width: "100%",
              maxWidth: "320px",
            }}
          >
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
              <span
                className="font-mono uppercase tracking-[0.14em] text-muted-foreground"
                style={{ fontSize: "11px", border: "1px solid var(--border)", padding: "3px 8px" }}
              >
                {book.category}
              </span>
              {book.content && (
                <span
                  className="font-mono uppercase tracking-[0.14em] text-muted-foreground"
                  style={{ fontSize: "11px", border: "1px solid var(--border)", padding: "3px 8px" }}
                >
                  Includes reading
                </span>
              )}
            </div>

            <h1
              style={{
                fontSize: "30px",
                fontWeight: 400,
                lineHeight: 1.25,
                fontFamily: "'NewsReader', Georgia, serif",
                color: "var(--foreground)",
                marginBottom: "6px",
              }}
            >
              {book.title}
            </h1>
            <p
              style={{
                fontSize: "20px",
                color: "var(--muted-foreground)",
                marginBottom: "16px",
              }}
            >
              by {book.author}
            </p>

              <p
                className="font-mono text-foreground"
                style={{ fontSize: "20px", marginBottom: "4px" }}
              >
                {isFree ? "Free" : `₦${book.price}`}
              </p>
              <p
                className="font-mono text-muted-foreground"
                style={{ fontSize: "14px", marginBottom: "24px" }}
              >
                {book.views} view{book.views !== 1 ? "s" : ""}
              </p>

            {/* Actions */}
            {canRead ? (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/read/${book.id}`)}
                  className="hover:opacity-90 active:scale-[0.98] transition"
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "18px",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                    color: "var(--background)",
                    background: "var(--foreground)",
                    border: "none",
                    cursor: "pointer",
                    }}
                >
                  Read
                </button>
                <div
                  style={{
                    padding: "12px 16px",
                    fontSize: "18px",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                    color: "var(--color-p-green-fg)",
                    border: "1px solid var(--color-p-green-fg)",
                      display: "flex",
                    alignItems: "center",
                  }}
                >
                  Purchased
                </div>
              </div>
            ) : bought ? (
              <div
                style={{
                  padding: "12px",
                  fontSize: "18px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                  color: "var(--color-p-green-fg)",
                  border: "1px solid var(--color-p-green-fg)",
                  textAlign: "center",
                  marginBottom: "16px",
                }}
              >
                Purchased
              </div>
            ) : isAuthenticated ? (
              <button
                onClick={() => {
                  setBuyError("");
                  setShowPayment(true);
                }}
                className="hover:opacity-90 active:scale-[0.98] transition"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "18px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                  color: "var(--background)",
                  background: "var(--foreground)",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: "16px",
                }}
              >
                Buy now
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hover:bg-accent transition"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "18px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                  color: "var(--muted-foreground)",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  marginBottom: "16px",
                }}
              >
                {isFree ? "Log in to read" : "Log in to buy"}
              </button>
            )}

            {(buyMutation.error?.message || buyError) && (
              <p
                style={{
                  fontSize: "17px",
                  color: "var(--color-p-red-fg)",
                  marginBottom: "12px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
              >
                {buyError || buyMutation.error?.message}
              </p>
            )}

            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "16px",
              }}
            >
              <h3
                className="font-mono uppercase tracking-[0.14em] text-muted-foreground"
                style={{ fontSize: "12px", marginBottom: "8px" }}
              >
                Description
              </h3>
              <p
                style={{
                  fontSize: "19px",
                  lineHeight: 1.8,
                  color: "var(--foreground)",
                }}
              >
                {book.description}
              </p>
            </div>
          </div>
        </div>

        {/* Share */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            marginTop: "32px",
            paddingTop: "24px",
          }}
        >
            <h3
              className="font-mono uppercase tracking-[0.14em] text-muted-foreground"
              style={{ fontSize: "12px", marginBottom: "16px" }}
            >
              Share this book
            </h3>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => {
                const url = window.location.origin + "/book/" + book.id;
                window.open(
                  "https://www.facebook.com/sharer/sharer.php?u=" +
                    encodeURIComponent(url),
                  "fb-share",
                  "width=600,height=400"
                );
              }}
              className="hover:bg-accent transition"
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "16px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: "var(--foreground)",
                background: "transparent",
                border: "1px solid var(--border)",
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              FACEBOOK
            </button>
            <button
              onClick={() => {
                const url = window.location.origin + "/book/" + book.id;
                const text = "Check out this book: " + book.title + " - ";
                window.open(
                  "https://wa.me/?text=" + encodeURIComponent(text + url),
                  "wa-share",
                  "width=600,height=400"
                );
              }}
              className="hover:bg-accent transition"
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "16px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: "var(--foreground)",
                background: "transparent",
                border: "1px solid var(--border)",
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              WHATSAPP
            </button>
            <button
              onClick={async () => {
                const url = window.location.origin + "/book/" + book.id;
                const text = "Check out this book: " + book.title;
                if (navigator.share) {
                  try {
                    await navigator.share({ title: book.title, text, url });
                  } catch {
                  /* ignore */
                }
                } else {
                  try {
                    await navigator.clipboard.writeText(url);
                    alert("Link copied to clipboard!");
                  } catch {
                  /* ignore */
                }
                }
              }}
              className="hover:bg-accent transition"
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "16px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: "var(--foreground)",
                background: "transparent",
                border: "1px solid var(--border)",
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              INSTAGRAM
            </button>
          </div>
        </div>

        {/* Similar Books */}
        {similar.length > 0 && (
          <div
            style={{
              borderTop: "1px solid var(--border)",
              marginTop: "48px",
              paddingTop: "24px",
            }}
          >
            <h3
              className="font-mono uppercase tracking-[0.14em] text-muted-foreground"
              style={{ fontSize: "12px", marginBottom: "16px" }}
            >
              Similar books
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {similar.map((similarBook, i) => (
                <BookCard
                  key={similarBook.id}
                  id={similarBook.id}
                  title={similarBook.title}
                  author={similarBook.author}
                  price={similarBook.price}
                  coverImage={similarBook.coverImage}
                  category={similarBook.category}
                  index={i}
                />
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
