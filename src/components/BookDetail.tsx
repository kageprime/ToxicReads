import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  PiCaretLeft,
  PiHeart,
  PiHeartStraight,
  PiStar,
  PiStarFill,
  PiBookOpen,
} from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { bookUrl, authorUrl } from "../../contracts/blog";
import { toast } from "sonner";
import PaymentModal from "./PaymentModal";
import PreviewModal from "./PreviewModal";
import BookCard from "./BookCard";
import { BookDetailSkeleton } from "./Skeleton";
import EmptyState from "./EmptyState";

export default function BookDetail() {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Accept both canonical slugs and legacy numeric IDs (/book/9).
  const isNumeric = !!slugParam && /^\d+$/.test(slugParam);
  const idQuery = trpc.book.byId.useQuery(
    { id: isNumeric ? Number(slugParam) : 0 },
    { enabled: isNumeric }
  );
  const slugQuery = trpc.book.bySlug.useQuery(
    { slug: slugParam ?? "" },
    { enabled: !isNumeric && !!slugParam }
  );
  const book = (isNumeric ? idQuery.data : slugQuery.data) ?? undefined;
  const isLoading = isNumeric ? idQuery.isLoading : slugQuery.isLoading;

  // Legacy numeric URL → canonical slug URL.
  useEffect(() => {
    if (isNumeric && idQuery.data?.slug) {
      navigate(`/book/${idQuery.data.slug}`, { replace: true });
    }
  }, [isNumeric, idQuery.data, navigate]);

  const bookId = book?.id ?? (isNumeric ? Number(slugParam) : NaN);

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

  const addWishlist = trpc.wishlistItems.add.useMutation({
    onSuccess: () => {
      utils.wishlistItems.check.invalidate();
      toast.success("Saved to wishlist");
    },
  });

  const removeWishlist = trpc.wishlistItems.remove.useMutation({
    onSuccess: () => {
      utils.wishlistItems.check.invalidate();
      toast.success("Removed from wishlist");
    },
  });

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      utils.reviews.byBook.invalidate();
      utils.reviews.myReview.invalidate();
      setReviewText("");
      setReviewRating(5);
      toast.success("Review published");
    },
  });

  const incrementView = trpc.book.incrementView.useMutation();

  useEffect(() => {
    if (!isNaN(bookId)) {
      incrementView.mutate({ id: bookId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const [showPayment, setShowPayment] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const { data: previewData, isLoading: previewLoading } =
    trpc.book.preview.useQuery(
      { slug: book?.slug ?? "" },
      { enabled: showPreview && !!book?.slug }
    );

  if (isLoading) {
    return <BookDetailSkeleton />;
  }

  if (!book) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background px-4 py-24">
        <EmptyState
          icon={<PiBookOpen size={24} />}
          title="Book not found"
          body="It may have been removed, or the link is incorrect. Browse the library to find something else."
          actionLabel="Back to library"
          onAction={() => navigate("/home")}
        />
      </div>
    );
  }

  const isFree = book.price === "0" || book.price === "0.00";
  const isOwner = hasPurchased || isFree;
  const canRead = (isOwner || isFree) && !!book.content;

  const similar =
    similarBooks
      ?.filter(b => b.category === book.category && b.id !== book.id)
      .slice(0, 4) || [];

  const reviews = reviewData?.reviews || [];
  const reviewStats = reviewData?.stats || { avg: 0, count: 0 };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (wishlisted) {
      removeWishlist.mutate({ bookId });
    } else {
      addWishlist.mutate({ bookId });
    }
  };

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    createReview.mutate({
      bookId,
      rating: reviewRating,
      text: reviewText || undefined,
    });
  };

  const shareUrl = () => window.location.origin + bookUrl(book);

  const copyLink = async () => {
    const url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-[880px] animate-fade-up px-4 pb-24 pt-6 sm:px-8 md:pt-10">
        {/* Back */}
        <button
          onClick={() => navigate("/home")}
          className="mb-6 flex items-center gap-1 text-muted-foreground transition-opacity hover:opacity-70"
        >
          <PiCaretLeft size={14} />
          <span className="text-[17px]">Back</span>
        </button>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Cover */}
          <div className="relative w-full max-w-[320px] shrink-0 self-start overflow-hidden border border-border bg-card shadow-soft">
            <img
              src={book.coverImage}
              alt={`Cover of ${book.title} by ${book.author}`}
              className="block aspect-[3/4] w-full object-cover"
              loading="eager"
            />
            <button
              onClick={handleToggleWishlist}
              className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/90 transition-colors hover:bg-accent"
              title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={!!wishlisted}
            >
              {wishlisted ? (
                <PiHeartStraight size={18} className="text-p-red-fg" />
              ) : (
                <PiHeart size={18} className="text-foreground" />
              )}
            </button>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="border border-border px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {book.category}
              </span>
              {book.content && (
                <span className="border border-border px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Includes reading
                </span>
              )}
            </div>

            <h1 className="text-balance mb-1.5 font-serif text-3xl leading-[1.2] tracking-tight text-baobab md:text-4xl">
              {book.title}
            </h1>
            <p className="mb-1 text-xl text-muted-foreground">
              by{" "}
              <button
                onClick={() => navigate(authorUrl(book))}
                className="underline underline-offset-[3px] transition-opacity hover:opacity-70"
              >
                {book.author}
              </button>
            </p>

            {/* Rating */}
            {reviewStats.count > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <div className="flex items-center gap-0.5" aria-label={`Rated ${reviewStats.avg} out of 5`}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span
                      key={s}
                      className={
                        s <= Math.round(reviewStats.avg)
                          ? "text-p-yellow-fg"
                          : "text-muted-foreground"
                      }
                    >
                      <PiStarFill size={14} />
                    </span>
                  ))}
                </div>
                <span className="tnum font-mono text-sm text-muted-foreground">
                  {reviewStats.avg} ({reviewStats.count})
                </span>
              </div>
            )}

            <p className="tnum mb-1 font-mono text-xl text-foreground">
              {isFree ? "Free" : `₦${book.price}`}
            </p>
            <p className="tnum mb-6 font-mono text-sm text-muted-foreground">
              {book.views} view{book.views !== 1 ? "s" : ""}
            </p>

            {/* Actions */}
            {canRead ? (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/read/${book.id}`)}
                  className="flex-1 bg-foreground p-3 text-lg text-background transition hover:opacity-90 active:scale-[0.98]"
                >
                  Read
                </button>
                <div className="flex items-center border border-p-green-fg bg-p-green px-4 py-3 text-lg text-p-green-fg">
                  Purchased
                </div>
              </div>
            ) : isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowPayment(true)}
                  className="mb-3 w-full bg-foreground p-3 text-lg text-background transition hover:opacity-90 active:scale-[0.98]"
                >
                  Buy now
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className="mb-4 w-full border border-border bg-transparent p-3 text-lg text-foreground transition hover:bg-accent active:scale-[0.98]"
                >
                  Read a free sample
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="mb-3 w-full border border-border bg-transparent p-3 text-lg text-muted-foreground transition hover:bg-accent"
                >
                  {isFree ? "Log in to read" : "Log in to buy"}
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className="mb-4 w-full border border-border bg-transparent p-3 text-lg text-foreground transition hover:bg-accent active:scale-[0.98]"
                >
                  Read a free sample
                </button>
              </>
            )}

            <div className="border-t border-border pt-4">
              <h3 className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Description
              </h3>
              <p className="text-pretty text-[19px] leading-[1.8] text-foreground">
                {book.description}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section
          aria-label="Reviews"
          className="mt-12 border-t border-border pt-6"
        >
          <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Reviews{reviewStats.count > 0 ? ` (${reviewStats.count})` : ""}
          </h3>

          {isAuthenticated && !myReview && (
            <div className="mb-6 border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-1" role="radiogroup" aria-label="Your rating">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setReviewRating(s)}
                    role="radio"
                    aria-checked={s === reviewRating}
                    aria-label={`${s} star${s > 1 ? "s" : ""}`}
                    className="cursor-pointer border-none bg-none p-0.5 transition-opacity hover:opacity-80"
                  >
                    {s <= reviewRating ? (
                      <PiStarFill size={18} className="text-p-yellow-fg" />
                    ) : (
                      <PiStar size={18} className="text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
              <textarea
                className="field-input mb-2"
                rows={2}
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Share what you thought (optional)"
                aria-label="Review text"
              />
              <button
                onClick={handleSubmitReview}
                disabled={createReview.isPending}
                className="bg-foreground px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-background transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              >
                {createReview.isPending ? "Submitting…" : "Submit review"}
              </button>
              {createReview.error && (
                <p role="alert" className="mt-2 text-sm text-p-red-fg">
                  {createReview.error.message}
                </p>
              )}
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-border py-3">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex items-center gap-0.5" aria-label={`Rated ${review.rating} out of 5`}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <PiStarFill
                          key={s}
                          size={12}
                          className={
                            s <= review.rating
                              ? "text-p-yellow-fg"
                              : "text-border"
                          }
                        />
                      ))}
                    </div>
                    <span className="tnum font-mono text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.text && (
                    <p className="text-pretty text-[17px] leading-[1.6] text-foreground">
                      {review.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base text-muted-foreground">
              No reviews yet.{" "}
              {isAuthenticated ? "Be the first to share your thoughts." : ""}
            </p>
          )}
        </section>

        {/* Share */}
        <section
          aria-label="Share this book"
          className="mt-8 border-t border-border pt-6"
        >
          <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Share this book
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => {
                window.open(
                  "https://www.facebook.com/sharer/sharer.php?u=" +
                    encodeURIComponent(shareUrl()),
                  "fb-share",
                  "width=600,height=400"
                );
              }}
              className="flex-1 border border-border bg-transparent p-2.5 text-sm font-medium tracking-[0.1em] text-foreground transition hover:bg-accent active:scale-[0.98]"
            >
              Facebook
            </button>
            <button
              onClick={() => {
                const text = "Check out this book: " + book.title + " - ";
                window.open(
                  "https://wa.me/?text=" + encodeURIComponent(text + shareUrl()),
                  "wa-share",
                  "width=600,height=400"
                );
              }}
              className="flex-1 border border-border bg-transparent p-2.5 text-sm font-medium tracking-[0.1em] text-foreground transition hover:bg-accent active:scale-[0.98]"
            >
              WhatsApp
            </button>
            <button
              onClick={copyLink}
              className="flex-1 border border-border bg-transparent p-2.5 text-sm font-medium tracking-[0.1em] text-foreground transition hover:bg-accent active:scale-[0.98]"
            >
              Copy link
            </button>
          </div>
        </section>

        {/* Similar books */}
        {similar.length > 0 && (
          <section
            aria-label="Similar books"
            className="mt-12 border-t border-border pt-6"
          >
            <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Similar books
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {similar.map((similarBook, i) => (
                <BookCard
                  key={similarBook.id}
                  id={similarBook.id}
                  title={similarBook.title}
                  author={similarBook.author}
                  price={similarBook.price}
                  coverImage={similarBook.coverImage}
                  category={similarBook.category}
                  slug={similarBook.slug}
                  authorSlug={similarBook.authorSlug}
                  createdAt={similarBook.createdAt}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {showPayment && book && (
        <PaymentModal
          bookId={book.id}
          price={book.price}
          title={book.title}
          onClose={() => setShowPayment(false)}
        />
      )}

      {showPreview && book && previewData && (
        <PreviewModal
          title={previewData.title}
          author={previewData.author}
          price={previewData.price}
          coverImage={previewData.coverImage}
          preview={previewData.preview}
          totalChars={previewData.totalChars}
          onClose={() => setShowPreview(false)}
          onBuy={() => {
            setShowPreview(false);
            if (isAuthenticated) setShowPayment(true);
            else navigate("/login");
          }}
        />
      )}

      {showPreview && book && !previewData && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowPreview(false)}
        >
          <p className="text-lg text-white">
            {previewLoading ? "Loading sample…" : "Sample unavailable."}
          </p>
        </div>
      )}
    </div>
  );
}
