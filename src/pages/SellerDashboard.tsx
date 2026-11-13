import { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  PiCurrencyNgn,
  PiEye,
  PiBookOpen,
  PiUpload,
  PiChartBar,
  PiArrowUpRight,
  PiPlus,
} from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { bookUrl, authorUrl } from "../../contracts/blog";
import { RowsSkeleton, Skel } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import AuthorSelfEdit from "@/components/AuthorSelfEdit";
import SafeImage from "@/components/SafeImage";
import { toast } from "sonner";

function formatNgn(value: string | number) {
  const num = Number(value) || 0;
  return `₦${num.toLocaleString("en-NG")}`;
}

const STATUS_BADGE: Record<string, string> = {
  approved: "bg-p-green text-p-green-fg",
  pending: "bg-p-yellow text-p-yellow-fg",
  rejected: "bg-p-red text-p-red-fg",
};

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const { data: stats, isLoading } = trpc.sellerInfo.stats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: books } = trpc.sellerInfo.books.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: sales } = trpc.sellerInfo.sales.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();
  const { data: profiles } = trpc.author.myProfiles.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const claimMutation = trpc.author.claim.useMutation({
    onSuccess: () => {
      toast.success("Author profile claimed and ready to manage.");
      utils.author.myProfiles.invalidate();
      utils.author.profile.invalidate();
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

  if (!isLoading && (!books || books.length === 0)) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-12 pb-20">
          <div className="rounded-xl border border-border bg-card p-8 sm:p-10 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-foreground">
              <PiChartBar className="h-6 w-6" aria-hidden="true" />
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
              Author &amp; Sales Hub
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed text-pretty">
              Publish your work on ToxicReads, claim your public author page, and track reader sales in naira.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {[
                {
                  title: "Submit manuscript",
                  body: "Upload your cover, description, and manuscript text in minutes.",
                },
                {
                  title: "Editorial approval",
                  body: "Editors review submissions and publish approved editions cleanly.",
                },
                {
                  title: "Track revenue",
                  body: "Monitor reads, individual sales, and public pen-name stats.",
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="rounded-xl border border-border bg-secondary/40 p-4"
                >
                  <h2 className="font-serif text-base font-medium text-foreground">
                    {step.title}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate("/submit-book")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <PiUpload className="h-4 w-4" aria-hidden="true" />
              Submit your first book
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-8 pb-20 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
              Author hub
            </h1>
            <p className="mt-1 text-sm text-muted-foreground font-mono">
              @{user?.username}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/submit-book")}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            <PiPlus className="h-4 w-4" aria-hidden="true" />
            New submission
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-6" aria-label="Loading dashboard" role="status">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <Skel key={i} className="h-[104px] !rounded-xl" />
              ))}
            </div>
            <RowsSkeleton count={3} />
          </div>
        ) : (
          <>
            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Published books",
                  value: stats?.totalBooks ?? 0,
                  icon: <PiBookOpen className="h-4 w-4" aria-hidden="true" />,
                },
                {
                  label: "Page reads",
                  value: (stats?.totalViews ?? 0).toLocaleString(),
                  icon: <PiEye className="h-4 w-4" aria-hidden="true" />,
                },
                {
                  label: "Copies sold",
                  value: stats?.totalSales ?? 0,
                  icon: <PiCurrencyNgn className="h-4 w-4" aria-hidden="true" />,
                },
                {
                  label: "Total revenue",
                  value: formatNgn(stats?.totalRevenue ?? "0"),
                  icon: <PiCurrencyNgn className="h-4 w-4" aria-hidden="true" />,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                    {stat.icon}
                    <span>{stat.label}</span>
                  </div>
                  <p className="font-mono text-2xl sm:text-[26px] font-medium text-foreground tnum">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Public Author Profiles */}
            <section className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground tracking-tight">
                  Public author profiles
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Manage your bio, dedication note, avatar, and reader links.
                </p>
              </div>

              {profiles?.owned.map((a) => (
                <AuthorSelfEdit
                  key={a.id}
                  author={a}
                  onSaved={() => {
                    utils.author.myProfiles.invalidate();
                    utils.author.profile.invalidate({ slug: a.slug });
                  }}
                />
              ))}

              {profiles?.suggested.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-dashed border-border bg-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-serif text-lg font-medium text-foreground">
                        {a.name}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(authorUrl({ authorSlug: a.slug, author: a.name }))
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Preview page
                        <PiArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used on your books. Unclaimed pen-name profile.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={claimMutation.isPending}
                    onClick={() => claimMutation.mutate({ id: a.id })}
                    className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {claimMutation.isPending ? "Claiming..." : "Claim profile"}
                  </button>
                </div>
              ))}

              {(!profiles ||
                (profiles.owned.length === 0 && profiles.suggested.length === 0)) && (
                <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
                  No author pen-name profiles yet. Profiles generate automatically when your books are submitted.
                </div>
              )}
            </section>

            {/* Your Books */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-medium text-foreground tracking-tight">
                Your catalog ({books?.length || 0})
              </h2>

              <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                {books?.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center gap-4 p-4 hover:bg-secondary/35 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => navigate(bookUrl(book))}
                      className="w-12 aspect-[2/3] rounded-sm overflow-hidden bg-secondary cover-frame shrink-0"
                    >
                      {book.coverImage && (
                        <SafeImage
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => navigate(bookUrl(book))}
                        className="text-left block w-full"
                      >
                        <h3 className="font-serif text-lg font-medium text-foreground truncate hover:text-signal transition-colors">
                          {book.title}
                        </h3>
                      </button>
                      <p className="font-mono text-xs text-muted-foreground tnum mt-0.5">
                        {formatNgn(book.price)} · {book.views}{" "}
                        {book.views === 1 ? "view" : "views"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-medium capitalize shrink-0 ${
                        STATUS_BADGE[book.status] || "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {book.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Sales */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-medium text-foreground tracking-tight">
                Recent sales ({sales?.length || 0})
              </h2>

              {sales && sales.length > 0 ? (
                <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                  {sales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between gap-4 p-4"
                    >
                      <div className="min-w-0">
                        <p className="font-serif text-base font-medium text-foreground truncate">
                          {sale.book?.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Reader @{sale.buyer?.username || "Unknown"} ·{" "}
                          {sale.createdAt
                            ? new Date(sale.createdAt).toLocaleDateString()
                            : ""}
                        </p>
                      </div>
                      <span className="font-mono text-sm font-medium text-p-green-fg tnum shrink-0">
                        +{formatNgn(sale.purchasePrice)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<PiCurrencyNgn className="h-5 w-5" aria-hidden="true" />}
                  title="No sales yet"
                  body="Once readers purchase one of your approved editions, transactions appear here automatically."
                />
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
