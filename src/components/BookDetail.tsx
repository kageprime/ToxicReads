import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { PiCaretLeft, PiHeart, PiHeartStraight, PiStar, PiStarFill } from "react-icons/pi";
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

  const { data: wishlisted } = trpc.wishlistItems.check.useQuery(
    { bookId },
    { enabled: isAuthenticated && !isNaN(bookId) }
  );

  const { data: reviewData } = trpc.reviews.byBook.useQuery(
    { bookId },
    { enabled: !isNaN(bookId) }
  );

  const { data: myReview } = trpc.reviews.myReview.useQuery(
    { bookId },
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
    onError: (err: { message: string }) => {
      setBuyError(err.message);
    },
  });

  const addWishlist = trpc.wishlistItems.add.useMutation({
    onSuccess: () => utils.wishlistItems.check.invalidate(),
  });

  const removeWishlist = trpc.wishlistItems.remove.useMutation({
    onSuccess: () => utils.wishlistItems.check.invalidate(),
  });

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      utils.reviews.byBook.invalidate();
      utils.reviews.myReview.invalidate();
      setReviewText("");
      setReviewRating(5);
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
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const handlePay = async (): Promise<void> => {
    if (!book) return;
    await buyMutation.mutateAsync({ bookId: book.id });
    setShowPayment(false);
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "100vh", backgroundColor: "hsl(var(--background))" }}
      >
        <p style={{ fontSize: "18px", color: "hsl(var(--muted-foreground))", fontFamily: "'SF Pro Text', sans-serif" }}>
          LOADING...
        </p>
      </div>
    );
  }

  if (!book) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "100vh", backgroundColor: "hsl(var(--background))" }}
      >
        <div className="text-center">
          <p style={{ fontSize: "20px", color: "hsl(var(--muted-foreground))" }}>
            Book not found
          </p>
          <button
            onClick={() => navigate("/home")}
            style={{
              marginTop: "16px",
              fontSize: "18px",
              color: "hsl(var(--foreground))",
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

  const reviews = reviewData?.reviews || [];
  const reviewStats = reviewData?.stats || { avg: 0, count: 0 };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (wishlisted) {
      removeWishlist.mutate({ bookId });
    } else {
      addWishlist.mutate({ bookId });
    }
  };

  const handleSubmitReview = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    createReview.mutate({ bookId, rating: reviewRating, text: reviewText || undefined });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
      <div
        className="mx-auto"
        style={{
          maxWidth: "880px",
          padding: "40px 32px 96px",
          animation: "pageIn 0.4s ease-out both",
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-1 mb-6 hover:opacity-70 transition-opacity"
        >
          <PiCaretLeft size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
          <span style={{ fontSize: "17px", color: "hsl(var(--muted-foreground))" }}>
            Back
          </span>
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Image */}
          <div style={{ border: "1px solid hsl(var(--border))", flexShrink: 0, width: "100%", maxWidth: "320px", position: "relative" }}>
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-auto block"
              style={{ aspectRatio: "3/4", objectFit: "cover" }}
              loading="eager"
            />
            <button
              onClick={handleToggleWishlist}
              className="absolute top-2 left-2 flex items-center justify-center w-9 h-9 rounded-full bg-background/90 border border-border hover:bg-accent transition-colors"
              title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              {wishlisted ? (
                <PiHeartStraight size={18} style={{ color: "rgb(var(--color-p-red-fg))" }} />
              ) : (
                <PiHeart size={18} style={{ color: "hsl(var(--foreground))" }} />
              )}
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="font-mono uppercase tracking-[0.14em] text-muted-foreground"
                style={{ fontSize: "11px", border: "1px solid hsl(var(--border))", padding: "3px 8px" }}
              >
                {book.category}
              </span>
              {book.content && (
                <span
                  className="font-mono uppercase tracking-[0.14em] text-muted-foreground"
                  style={{ fontSize: "11px", border: "1px solid hsl(var(--border))", padding: "3px 8px" }}
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
                color: "hsl(var(--foreground))",
                marginBottom: "6px",
              }}
            >
              {book.title}
            </h1>
            <p
              style={{
                fontSize: "20px",
                color: "hsl(var(--muted-foreground))",
                marginBottom: "4px",
              }}
            >
              by{" "}
              <span
                style={{ cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}
                onClick={() => navigate(`/author/${encodeURIComponent(book.author)}`)}
              >
                {book.author}
              </span>
            </p>

            {/* Rating */}
            {reviewStats.count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ color: s <= Math.round(reviewStats.avg) ? "rgb(var(--color-p-yellow-fg))" : "hsl(var(--muted-foreground))" }}>
                      <PiStarFill size={14} />
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: "14px", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
                  {reviewStats.avg} ({reviewStats.count})
                </span>
              </div>
            )}

            <p className="font-mono text-foreground" style={{ fontSize: "20px", marginBottom: "4px" }}>
              {isFree ? "Free" : `₦${book.price}`}
            </p>
            <p className="font-mono text-muted-foreground" style={{ fontSize: "14px", marginBottom: "24px" }}>
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
                    color: "hsl(var(--background))",
                    background: "hsl(var(--foreground))",
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
                    color: "rgb(var(--color-p-green-fg))",
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
                  color: "rgb(var(--color-p-green-fg))",
                  border: "1px solid var(--color-p-green-fg)",
                  textAlign: "center",
                  marginBottom: "16px",
                }}
              >
                Purchased
              </div>
            ) : isAuthenticated ? (
              <button
                onClick={() => { setBuyError(""); setShowPayment(true); }}
                className="hover:opacity-90 active:scale-[0.98] transition"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "18px",
                  color: "hsl(var(--background))",
                  background: "hsl(var(--foreground))",
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
                  color: "hsl(var(--muted-foreground))",
                  background: "transparent",
                  border: "1px solid hsl(var(--border))",
                  cursor: "pointer",
                  marginBottom: "16px",
                }}
              >
                {isFree ? "Log in to read" : "Log in to buy"}
              </button>
            )}

            {(buyMutation.error?.message || buyError) && (
              <p style={{ fontSize: "17px", color: "rgb(var(--color-p-red-fg))", marginBottom: "12px" }}>
                {buyError || buyMutation.error?.message}
              </p>
            )}

            <div style={{ borderTop: "1px solid hsl(var(--border))", paddingTop: "16px" }}>
              <h3 className="font-mono uppercase tracking-[0.14em] text-muted-foreground" style={{ fontSize: "12px", marginBottom: "8px" }}>
                Description
              </h3>
              <p style={{ fontSize: "19px", lineHeight: 1.8, color: "hsl(var(--foreground))" }}>
                {book.description}
              </p>
            </div>
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <div style={{ borderTop: "1px solid hsl(var(--border))", marginTop: "48px", paddingTop: "24px" }}>
          <h3 className="font-mono uppercase tracking-[0.14em] text-muted-foreground" style={{ fontSize: "12px", marginBottom: "16px" }}>
            Reviews {reviewStats.count > 0 ? `(${reviewStats.count})` : ""}
          </h3>

          {/* Review Form */}
          {isAuthenticated && !myReview && (
            <div style={{ marginBottom: "24px", border: "1px solid hsl(var(--border))", padding: "16px" }}>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setReviewRating(s)}
                    className="hover:opacity-80 transition-opacity"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                  >
                    {s <= reviewRating ? (
                      <PiStarFill size={18} style={{ color: "rgb(var(--color-p-yellow-fg))" }} />
                    ) : (
                      <PiStar size={18} style={{ color: "hsl(var(--muted-foreground))" }} />
                    )}
                  </button>
                ))}
              </div>
              <textarea
                className="field-input"
                rows={2}
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Write your review (optional)"
                style={{ marginBottom: "8px" }}
              />
              <button
                onClick={handleSubmitReview}
                disabled={createReview.isPending}
                className="hover:opacity-90 active:scale-[0.98] transition font-mono uppercase tracking-[0.1em] text-[12px]"
                style={{
                  padding: "8px 16px",
                  color: "hsl(var(--background))",
                  background: "hsl(var(--foreground))",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {createReview.isPending ? "Submitting..." : "Submit Review"}
              </button>
              {createReview.error && (
                <p style={{ fontSize: "14px", color: "rgb(var(--color-p-red-fg))", marginTop: "8px" }}>
                  {createReview.error.message}
                </p>
              )}
            </div>
          )}

          {/* Existing Reviews */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid hsl(var(--border))",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <PiStarFill
                          key={s}
                          size={12}
                          style={{
                            color: s <= review.rating
                              ? "rgb(var(--color-p-yellow-fg))"
                              : "hsl(var(--border))",
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: "14px", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.text && (
                    <p style={{ fontSize: "17px", color: "hsl(var(--foreground))", lineHeight: 1.6 }}>
                      {review.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "16px", color: "hsl(var(--muted-foreground))" }}>
              No reviews yet. {isAuthenticated ? "Be the first to review!" : ""}
            </p>
          )}
        </div>

        {/* Share */}
        <div style={{ borderTop: "1px solid hsl(var(--border))", marginTop: "32px", paddingTop: "24px" }}>
          <h3 className="font-mono uppercase tracking-[0.14em] text-muted-foreground" style={{ fontSize: "12px", marginBottom: "16px" }}>
            Share this book
          </h3>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => {
                const url = window.location.origin + "/book/" + book.id;
                window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "fb-share", "width=600,height=400");
              }}
              className="hover:bg-accent transition"
              style={{ flex: 1, padding: "10px", fontSize: "16px", color: "hsl(var(--foreground))", background: "transparent", border: "1px solid hsl(var(--border))", cursor: "pointer", letterSpacing: "0.1em" }}
            >
              FACEBOOK
            </button>
            <button
              onClick={() => {
                const url = window.location.origin + "/book/" + book.id;
                const text = "Check out this book: " + book.title + " - ";
                window.open("https://wa.me/?text=" + encodeURIComponent(text + url), "wa-share", "width=600,height=400");
              }}
              className="hover:bg-accent transition"
              style={{ flex: 1, padding: "10px", fontSize: "16px", color: "hsl(var(--foreground))", background: "transparent", border: "1px solid hsl(var(--border))", cursor: "pointer", letterSpacing: "0.1em" }}
            >
              WHATSAPP
            </button>
            <button
              onClick={async () => {
                const url = window.location.origin + "/book/" + book.id;
                const text = "Check out this book: " + book.title;
                if (navigator.share) {
                  try { await navigator.share({ title: book.title, text, url }); } catch {}
                } else {
                  try { await navigator.clipboard.writeText(url); alert("Link copied!"); } catch {}
                }
              }}
              className="hover:bg-accent transition"
              style={{ flex: 1, padding: "10px", fontSize: "16px", color: "hsl(var(--foreground))", background: "transparent", border: "1px solid hsl(var(--border))", cursor: "pointer", letterSpacing: "0.1em" }}
            >
              INSTAGRAM
            </button>
          </div>
        </div>

        {/* Similar Books */}
        {similar.length > 0 && (
          <div style={{ borderTop: "1px solid hsl(var(--border))", marginTop: "48px", paddingTop: "24px" }}>
            <h3 className="font-mono uppercase tracking-[0.14em] text-muted-foreground" style={{ fontSize: "12px", marginBottom: "16px" }}>
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
