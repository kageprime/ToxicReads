import { useEffect } from "react";
import { useNavigate } from "react-router";
import { PiHeart, PiTrash } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { bookUrl } from "../../contracts/blog";
import { RowsSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import SafeImage from "@/components/SafeImage";
import { toast } from "sonner";

function formatNaira(price?: string | null) {
  if (!price) return "₦0";
  const numeric = Number(String(price).replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) {
    return `₦${numeric.toLocaleString("en-NG")}`;
  }
  return `₦${price}`;
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: items, isLoading } = trpc.wishlistItems.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();
  const removeMutation = trpc.wishlistItems.remove.useMutation({
    onSuccess: () => {
      utils.wishlistItems.list.invalidate();
      utils.wishlistItems.check.invalidate();
      toast.success("Removed from saved books");
    },
  });

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
              Saved books
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Editions bookmarked for future reading.
            </p>
          </div>
          {items && items.length > 0 && (
            <span className="font-mono text-xs text-muted-foreground tnum">
              {items.length} {items.length === 1 ? "title" : "titles"}
            </span>
          )}
        </div>

        <div className="mt-6">
          {isLoading ? (
            <RowsSkeleton count={4} />
          ) : items && items.length > 0 ? (
            <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
              {items.map((item) => {
                const dest = item.book ? bookUrl(item.book) : "/home";
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 sm:p-5 hover:bg-secondary/35 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => navigate(dest)}
                      className="w-14 aspect-[2/3] rounded-sm overflow-hidden bg-secondary cover-frame shrink-0"
                    >
                      {item.book?.coverImage && (
                        <SafeImage
                          src={item.book.coverImage}
                          alt={item.book.title || "Book cover"}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => navigate(dest)}
                        className="text-left block w-full"
                      >
                        <h2 className="font-serif text-lg sm:text-xl font-medium text-foreground truncate hover:text-signal transition-colors">
                          {item.book?.title || "Untitled edition"}
                        </h2>
                      </button>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {item.book?.author}
                      </p>
                      <p className="font-mono text-xs text-foreground tnum mt-1.5">
                        {formatNaira(item.book?.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => navigate(dest)}
                        className="hidden sm:inline-flex rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMutation.mutate({ bookId: item.bookId })}
                        disabled={removeMutation.isPending}
                        aria-label={`Remove ${item.book?.title || "book"} from saved list`}
                        className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors disabled:opacity-50"
                      >
                        <PiTrash className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<PiHeart className="h-5 w-5" aria-hidden="true" />}
              title="No saved books yet"
              body="Tap the heart icon on any edition in the catalog to bookmark it here for later."
              actionLabel="Browse catalog"
              onAction={() => navigate("/home")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
