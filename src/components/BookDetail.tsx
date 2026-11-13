import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  PiCaretLeft,
  PiHeart,
  PiHeartFill,
  PiStar,
  PiStarFill,
  PiBookOpen,
  PiCopy,
  PiShareNetwork,
  PiWhatsappLogo,
} from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { bookUrl, authorUrl } from "../../contracts/blog";
import { toast } from "sonner";
import PaymentModal from "./PaymentModal";
import PreviewModal from "./PreviewModal";
import BookCard from "./BookCard";
import SafeImage from "./SafeImage";
import { BookDetailSkeleton } from "./Skeleton";
import EmptyState from "./EmptyState";

function formatNaira(price: string) {
  const numeric = Number(String(price).replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) {
    return `₦${numeric.toLocaleString("en-NG")}`;
  }
  return `₦${price}`;
}

export default function BookDetail() {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
      utils.wishlistItems.list.invalidate();
      toast.success("Saved to wishlist");
    },
  });

  const removeWishlist = trpc.wishlistItems.remove.useMutation({
    onSuccess: () => {
      utils.wishlistItems.check.invalidate();
      utils.wishlistItems.list.invalidate();
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
      <div className="min-h-full flex items-center justify-center px-4 py-20">
        <EmptyState
          icon={<PiBookOpen className="h-5 w-5" aria-hidden="true" />}
          title="Edition not found"
          body="This book may have been removed or moved. Browse the catalog to explore current titles."
          actionLabel="Back to catalog"
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
      ?.filter((b) => b.category === book.category && b.id !== book.id)
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
    try {
      await navigator.clipboard.writeText(shareUrl());
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-8 pb-20 animate-fade-up">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <PiCaretLeft className="h-4 w-4" aria-hidden="true" />
          Back to catalog
        </button>

        {/* Main 2-column Editorial Spread */}
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-start">
          {/* Sticky Cover Column */}
          <div className="md:sticky md:top-8 flex flex-col items-center md:items-stretch">
            <div className="w-full max-w-[260px] md:max-w-none aspect-[2/3] rounded-sm overflow-hidden bg-secondary cover-frame shadow-soft-lg">
              <SafeImage
                src={book.coverImage}
                alt={`Cover of ${book.title} by ${book.author}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-4 w-full max-w-[260px] md:max-w-none flex items-center justify-between text-xs text-muted-foreground px-0.5">
              <span>{book.category}</span>
              <span className="font-mono tnum">
                {book.views} {book.views === 1 ? "view" : "views"}
              </span>
            </div>
          </div>

          {/* Info & Reading Actions */}
          <div className="min-w-0 space-y-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-secondary px-3 py-1 font-medium text-foreground">
                  {book.category}
                </span>
                {book.content && (
                  <span className="rounded-full border border-border px-3 py-1 font-medium text-muted-foreground">
                    Digital edition
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-medium leading-[1.08] tracking-tight text-foreground text-balance">
                {book.title}
              </h1>

              <p className="text-base text-muted-foreground">
                By{" "}
                <button
                  type="button"
                  onClick={() => navigate(authorUrl(book))}
                  className="font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
                >
                  {book.author}
                </button>
              </p>

              {reviewStats.count > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <div
                    className="flex items-center gap-0.5"
                    aria-label={`Rated ${reviewStats.avg} out of 5`}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <PiStarFill
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          s <= Math.round(reviewStats.avg)
                            ? "text-p-yellow-fg"
                            : "text-border"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground tnum">
                    {reviewStats.avg} ({reviewStats.count}{" "}
                    {reviewStats.count === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border">
              <p className="font-mono text-2xl sm:text-[28px] font-medium text-foreground tnum">
                {isFree ? "Free" : formatNaira(book.price)}
              </p>
            </div>

            {/* Action Pills */}
            <div className="flex flex-wrap items-center gap-3">
              {canRead ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(`/read/${book.id}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <PiBookOpen className="h-4 w-4" aria-hidden="true" />
                    Read edition
                  </button>
                  {!isFree && (
                    <span className="inline-flex items-center rounded-full bg-p-green text-p-green-fg px-4 py-2 text-xs font-medium">
                      In your library
                    </span>
                  )}
                </>
              ) : isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowPayment(true)}
                    className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-7 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Buy edition
                  </button>
                  {book.content && (
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-card text-foreground px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors"
                    >
                      Read free sample
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-7 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    {isFree ? "Sign in to read" : "Sign in to buy"}
                  </button>
                  {book.content && (
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-card text-foreground px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors"
                    >
                      Read free sample
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-pressed={!!wishlisted}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition-colors ${
                  wishlisted
                    ? "border-signal/40 bg-card text-signal"
                    : "border-border bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {wishlisted ? (
                  <PiHeartFill className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <PiHeart className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{wishlisted ? "Saved" : "Save"}</span>
              </button>
            </div>

            {/* Synopsis */}
            <div className="pt-6 border-t border-border space-y-2.5">
              <h2 className="text-xs font-medium text-muted-foreground">
                About this edition
              </h2>
              <p className="text-base sm:text-[17px] leading-[1.75] text-foreground/90 max-w-[65ch] text-pretty whitespace-pre-line">
                {book.description}
              </p>
            </div>

            {/* Compact Share Bar */}
            <div className="pt-5 border-t border-border flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-medium text-muted-foreground mr-1 inline-flex items-center gap-1.5">
                <PiShareNetwork className="h-3.5 w-3.5" aria-hidden="true" />
                Share
              </span>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <PiCopy className="h-3.5 w-3.5" aria-hidden="true" />
                Copy link
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = `Read ${book.title} by ${book.author} on ToxicReads: `;
                  window.open(
                    "https://wa.me/?text=" + encodeURIComponent(text + shareUrl()),
                    "wa-share",
                    "width=600,height=400"
                  );
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <PiWhatsappLogo className="h-3.5 w-3.5" aria-hidden="true" />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open(
                    "https://www.facebook.com/sharer/sharer.php?u=" +
                      encodeURIComponent(shareUrl()),
                    "fb-share",
                    "width=600,height=400"
                  );
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Facebook
              </button>
            </div>
          </div>
        </div>

        {/* Reader Reviews */}
        <section
          aria-label="Reviews"
          className="mt-14 pt-8 border-t border-border"
        >
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-serif text-2xl font-medium text-foreground tracking-tight">
              Reader reviews
              {reviewStats.count > 0 && (
                <span className="ml-2 font-mono text-sm font-normal text-muted-foreground tnum">
                  ({reviewStats.count})
                </span>
              )}
            </h2>
          </div>

          {isAuthenticated && !myReview && (
            <div className="mb-8 rounded-xl border border-border bg-card p-5 space-y-3.5 max-w-2xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Write a review
                </span>
                <div
                  className="flex items-center gap-1"
                  role="radiogroup"
                  aria-label="Your rating"
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      role="radio"
                      aria-checked={s === reviewRating}
                      aria-label={`${s} star${s > 1 ? "s" : ""}`}
                      className="p-1 rounded hover:bg-secondary transition-colors"
                    >
                      {s <= reviewRating ? (
                        <PiStarFill
                          className="h-4 w-4 text-p-yellow-fg"
                          aria-hidden="true"
                        />
                      ) : (
                        <PiStar
                          className="h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                className="field-input"
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts on the story..."
                aria-label="Review text"
              />

              <div className="flex items-center justify-between gap-3">
                {createReview.error ? (
                  <p role="alert" className="text-xs text-destructive">
                    {createReview.error.message}
                  </p>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={createReview.isPending}
                  className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {createReview.isPending ? "Publishing..." : "Publish review"}
                </button>
              </div>
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="divide-y divide-border max-w-2xl">
              {reviews.map((review) => (
                <div key={review.id} className="py-4 first:pt-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="flex items-center gap-0.5"
                      aria-label={`Rated ${review.rating} out of 5`}
                    >
                      {[1, 2, 3, 4, 5].map((s) => (
                        <PiStarFill
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= review.rating
                              ? "text-p-yellow-fg"
                              : "text-border"
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground tnum">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.text && (
                    <p className="text-sm sm:text-[15px] leading-relaxed text-foreground/90 text-pretty">
                      {review.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No reviews yet.
              {isAuthenticated ? " Share the first impression." : ""}
            </p>
          )}
        </section>

        {/* Similar Editions */}
        {similar.length > 0 && (
          <section
            aria-label="Similar books"
            className="mt-14 pt-8 border-t border-border"
          >
            <h2 className="font-serif text-2xl font-medium text-foreground tracking-tight mb-6">
              More in {book.category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 backdrop-blur-sm p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="rounded-xl border border-border bg-card px-5 py-3 text-sm text-foreground shadow-soft">
            {previewLoading ? "Loading sample..." : "Sample unavailable."}
          </div>
        </div>
      )}
    </div>
  );
}
