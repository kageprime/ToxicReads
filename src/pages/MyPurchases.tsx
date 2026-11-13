import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { bookUrl } from "../../contracts/blog";
import { RowsSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import SafeImage from "@/components/SafeImage";
import { PiBookOpen } from "react-icons/pi";

function formatNaira(price?: string | null) {
  if (!price) return "₦0";
  const numeric = Number(String(price).replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) {
    return `₦${numeric.toLocaleString("en-NG")}`;
  }
  return `₦${price}`;
}

export default function MyPurchases() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: purchases, isLoading } = trpc.purchase.myPurchases.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) return null;

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-8 pb-20">
        <div className="pb-6 border-b border-border flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
              My library
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Books you own. Pick up reading or listening anytime.
            </p>
          </div>
          {purchases && purchases.length > 0 && (
            <span className="font-mono text-xs text-muted-foreground tnum">
              {purchases.length} {purchases.length === 1 ? "edition" : "editions"}
            </span>
          )}
        </div>

        <div className="mt-6">
          {isLoading ? (
            <RowsSkeleton count={4} />
          ) : purchases && purchases.length > 0 ? (
            <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
              {purchases.map((purchase) => {
                const dest = purchase.book ? bookUrl(purchase.book) : "/home";
                return (
                  <div
                    key={purchase.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 hover:bg-secondary/35 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => navigate(dest)}
                        className="w-14 aspect-[2/3] rounded-sm overflow-hidden bg-secondary cover-frame shrink-0"
                      >
                        {purchase.book?.coverImage && (
                          <SafeImage
                            src={purchase.book.coverImage}
                            alt={purchase.book.title || "Book cover"}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => navigate(dest)}
                          className="text-left block w-full"
                        >
                          <h2 className="font-serif text-lg sm:text-xl font-medium text-foreground truncate hover:text-signal transition-colors">
                            {purchase.book?.title || "Untitled edition"}
                          </h2>
                        </button>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {purchase.book?.author}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground tnum mt-1.5">
                          Paid {formatNaira(purchase.purchasePrice)} ·{" "}
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:shrink-0 pl-[72px] sm:pl-0">
                      {purchase.book?.content && (
                        <button
                          type="button"
                          onClick={() => navigate(`/read/${purchase.book?.id}`)}
                          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          <PiBookOpen className="h-4 w-4" aria-hidden="true" />
                          Read now
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(dest)}
                        className="rounded-full border border-border bg-background px-4 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<PiBookOpen className="h-5 w-5" aria-hidden="true" />}
              title="Your library is empty"
              body="Books you buy appear here immediately for distraction-free reading and audio narration."
              actionLabel="Browse catalog"
              onAction={() => navigate("/home")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
