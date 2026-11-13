import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PiWarningCircle, PiUpload, PiPlus, PiTrash } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { bookUrl } from "../../contracts/blog";
import { RowsSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import SafeImage from "@/components/SafeImage";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";

function formatNaira(price?: string | null) {
  if (!price) return "₦0";
  const numeric = Number(String(price).replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) {
    return `₦${numeric.toLocaleString("en-NG")}`;
  }
  return `₦${price}`;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-p-yellow text-p-yellow-fg",
  approved: "bg-p-green text-p-green-fg",
  rejected: "bg-p-red text-p-red-fg",
};

export default function MySubmissions() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const utils = trpc.useUtils();
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { data: submissions, isLoading } = trpc.book.mySubmissions.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const deleteMutation = trpc.book.deleteMySubmission.useMutation({
    onSuccess: () => {
      utils.book.mySubmissions.invalidate();
      setConfirmDeleteId(null);
      toast.success("Submission deleted");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) return null;

  const targetBook = submissions?.find((b) => b.id === confirmDeleteId);

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-8 pb-20">
        <div className="pb-6 border-b border-border flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
              Submissions
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Track review status and manage manuscripts you submitted.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/submit-book")}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <PiPlus className="h-4 w-4" aria-hidden="true" />
            Submit book
          </button>
        </div>

        <div className="mt-6 form-note flex items-start gap-3 text-sm">
          <PiWarningCircle
            className="h-4 w-4 text-signal shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-muted-foreground leading-relaxed">
            <strong className="font-medium text-foreground">
              Original writing only.
            </strong>{" "}
            All manuscripts are reviewed before publishing to the catalog. AI-generated submissions are declined.{" "}
            <button
              type="button"
              onClick={() => navigate("/submit-book")}
              className="font-medium text-foreground underline underline-offset-4 hover:text-signal transition-colors"
            >
              Read submission guidelines
            </button>
          </p>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <RowsSkeleton count={4} />
          ) : submissions && submissions.length > 0 ? (
            <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
              {submissions.map((book) => {
                const statusClass =
                  STATUS_STYLES[book.status] || "bg-secondary text-muted-foreground";
                return (
                  <div
                    key={book.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 hover:bg-secondary/35 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => navigate(bookUrl(book))}
                        className="w-14 aspect-[2/3] rounded-sm overflow-hidden bg-secondary cover-frame shrink-0"
                      >
                        {book.coverImage && (
                          <SafeImage
                            src={book.coverImage}
                            alt={book.title || "Book cover"}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(bookUrl(book))}
                            className="text-left min-w-0"
                          >
                            <h2 className="font-serif text-lg sm:text-xl font-medium text-foreground truncate hover:text-signal transition-colors">
                              {book.title}
                            </h2>
                          </button>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusClass}`}
                          >
                            {book.status}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {book.author}
                        </p>

                        <p className="font-mono text-xs text-muted-foreground tnum mt-1.5">
                          {formatNaira(book.price)} ·{" "}
                          {book.content ? "Manuscript attached" : "Listing only"}
                        </p>
                      </div>
                    </div>

                    {book.status === "pending" && (
                      <div className="flex items-center sm:shrink-0 pl-[72px] sm:pl-0">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(book.id)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-destructive hover:border-destructive/50 hover:bg-p-red/50 transition-colors disabled:opacity-50"
                        >
                          <PiTrash className="h-3.5 w-3.5" aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<PiUpload className="h-5 w-5" aria-hidden="true" />}
              title="No submissions yet"
              body="Send us your completed manuscript or book listing. Editors review submissions within one day."
              actionLabel="Submit a book"
              onAction={() => navigate("/submit-book")}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete pending submission?"
        body={`Remove "${targetBook?.title || "this submission"}" from the review queue? This action cannot be undone.`}
        confirmLabel="Delete submission"
        danger
        busy={deleteMutation.isPending}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId !== null) {
            deleteMutation.mutate({ id: confirmDeleteId });
          }
        }}
      />
    </div>
  );
}
