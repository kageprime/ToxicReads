import { useEffect } from "react";
import { useNavigate } from "react-router";
import { PiBookOpen, PiEye, PiCurrencyNgn, PiUpload, PiArrowRight } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { bookUrl } from "../../contracts/blog";
import { RowsSkeleton, Skel } from "@/components/Skeleton";
import AuthorSelfEdit from "@/components/AuthorSelfEdit";
import { toast } from "sonner";

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
      utils.author.myProfiles.invalidate();
      toast.success("Author profile claimed — it is yours to manage");
    },
    onError: (err: { message: string }) => {
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return null;
  }

  const formatNgn = (price: string | number) => {
    const value = typeof price === "string" ? Number(price) : price;
    return `₦${value.toLocaleString("en-NG")}`;
  };

  // Onboarding: user has no books
  const hasBooks = books && books.length > 0;

  if (!hasBooks && !isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
        <div className="mx-auto" style={{ maxWidth: "640px", padding: "80px 24px" }}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent grid place-items-center">
              <PiUpload size={28} style={{ color: "hsl(var(--foreground))" }} />
            </div>
            <h1
              style={{
                fontSize: "34px",
                fontWeight: 400,
                fontFamily: "var(--font-serif)",
                color: "hsl(var(--foreground))",
                marginBottom: "12px",
                letterSpacing: "-0.01em",
              }}
            >
              Start Selling Your Books
            </h1>
            <p
              style={{
                fontSize: "18px",
                color: "hsl(var(--muted-foreground))",
                lineHeight: 1.6,
                marginBottom: "32px",
                maxWidth: "480px",
                margin: "0 auto 32px",
              }}
            >
              Submit your book for review. Once approved, it will be listed in
              the marketplace and you can start earning from every sale.
            </p>
            <div className="space-y-3 max-w-sm mx-auto">
              <div
                className="flex items-center gap-3 p-4 border border-border text-left"
              >
                <span className="w-8 h-8 rounded-full bg-accent grid place-items-center font-mono text-sm">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">Submit your book</p>
                  <p className="text-sm text-muted-foreground">Title, cover, price, content</p>
                </div>
              </div>
              <div
                className="flex items-center gap-3 p-4 border border-border text-left"
              >
                <span className="w-8 h-8 rounded-full bg-accent grid place-items-center font-mono text-sm">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">Admin review</p>
                  <p className="text-sm text-muted-foreground">We verify within 24 hours</p>
                </div>
              </div>
              <div
                className="flex items-center gap-3 p-4 border border-border text-left"
              >
                <span className="w-8 h-8 rounded-full bg-accent grid place-items-center font-mono text-sm">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">Start earning</p>
                  <p className="text-sm text-muted-foreground">Get paid when readers buy</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/submit-book")}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-mono uppercase tracking-[0.14em] text-[13px] hover:opacity-90 active:scale-[0.98] transition"
            >
              Submit a Book <PiArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
      <div className="mx-auto" style={{ maxWidth: "1120px", padding: "40px 32px 96px" }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              style={{
                fontSize: "34px",
                fontWeight: 400,
                fontFamily: "var(--font-serif)",
                color: "hsl(var(--foreground))",
                letterSpacing: "-0.01em",
              }}
            >
              Seller Dashboard
            </h1>
            <p style={{ fontSize: "17px", color: "hsl(var(--muted-foreground))", marginTop: "4px" }}>
              @{user?.username}
            </p>
          </div>
          <button
            onClick={() => navigate("/submit-book")}
            className="transition-transform active:scale-[0.98]"
            style={{
              fontSize: "16px",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.05em",
              color: "hsl(var(--background))",
              background: "hsl(var(--foreground))",
              border: "none",
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            + New Book
          </button>
        </div>

        {isLoading ? (
          <div aria-label="Loading dashboard" role="status">
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[0, 1, 2, 3].map(i => (
                <Skel key={i} className="h-[104px] !rounded-none" />
              ))}
            </div>
            <RowsSkeleton count={3} />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Approved Books", value: stats?.totalBooks ?? 0, icon: <PiBookOpen size={18} /> },
                { label: "Total Views", value: stats?.totalViews ?? 0, icon: <PiEye size={18} /> },
                { label: "Books Sold", value: stats?.totalSales ?? 0, icon: <PiCurrencyNgn size={18} /> },
                { label: "Total Revenue", value: formatNgn(stats?.totalRevenue ?? "0"), icon: <PiCurrencyNgn size={18} /> },
              ].map(stat => (
                <div
                  key={stat.label}
                  style={{
                    border: "1px solid hsl(var(--border))",
                    padding: "20px",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {stat.icon}
                    <span
                      className="font-mono uppercase"
                      style={{ fontSize: "11px", letterSpacing: "0.14em" }}
                    >
                      {stat.label}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "28px",
                      fontFamily: "var(--font-mono)",
                      color: "hsl(var(--foreground))",
                    }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Author profile */}
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 400,
                fontFamily: "var(--font-serif)",
                color: "hsl(var(--foreground))",
                marginBottom: "8px",
              }}
            >
              Author profile
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "hsl(var(--muted-foreground))",
                marginBottom: "16px",
              }}
            >
              Readers see this on your public author page. Claim a pen name
              from your books to manage it yourself.
            </p>
            <div style={{ marginBottom: "32px" }}>
              {profiles?.owned.map(a => (
                <AuthorSelfEdit
                  key={a.id}
                  author={a}
                  onSaved={() => utils.author.myProfiles.invalidate()}
                />
              ))}
              {profiles?.suggested.map(a => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 border border-border bg-card"
                  style={{ padding: "12px", marginBottom: "12px" }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "9999px",
                      border: "1px solid hsl(var(--border))",
                      fontFamily: "var(--font-serif)",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      style={{
                        fontSize: "17px",
                        color: "hsl(var(--foreground))",
                      }}
                    >
                      {a.name}
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      Used in your books · unclaimed
                    </p>
                  </div>
                  <button
                    onClick={() => claimMutation.mutate({ id: a.id })}
                    disabled={claimMutation.isPending}
                    className="transition-transform active:scale-[0.98]"
                    style={{
                      fontSize: "15px",
                      fontFamily: "var(--font-mono)",
                      color: "hsl(var(--background))",
                      background: "hsl(var(--foreground))",
                      border: "none",
                      padding: "8px 16px",
                      cursor: "pointer",
                    }}
                  >
                    Claim
                  </button>
                </div>
              ))}
              {(!profiles ||
                (profiles.owned.length === 0 &&
                  profiles.suggested.length === 0)) && (
                <p
                  style={{
                    fontSize: "15px",
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  No pen names yet — they appear here when your submitted
                  books carry an author name.
                </p>
              )}
            </div>

            {/* My Books */}
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 400,
                fontFamily: "var(--font-serif)",
                color: "hsl(var(--foreground))",
                marginBottom: "16px",
              }}
            >
              My Books
            </h2>
            <div className="space-y-2 mb-8">
              {books?.map(book => (
                <div
                  key={book.id}
                  className="flex items-center gap-4 transition-colors hover:bg-accent"
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid hsl(var(--border))",
                  }}
                >
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    style={{
                      width: "40px",
                      height: "52px",
                      objectFit: "cover",
                      border: "1px solid hsl(var(--border))",
                      flexShrink: 0,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(bookUrl(book))}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontSize: "17px",
                        color: "hsl(var(--foreground))",
                        cursor: "pointer",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => navigate(bookUrl(book))}
                    >
                      {book.title}
                    </p>
                    <p style={{ fontSize: "15px", color: "hsl(var(--muted-foreground))" }}>
                      ₦{book.price} · {book.views} views
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontFamily: "var(--font-mono)",
                      color:
                        book.status === "approved"
                          ? "rgb(var(--color-p-green-fg))"
                          : book.status === "pending"
                            ? "rgb(var(--color-p-yellow-fg))"
                            : "rgb(var(--color-p-red-fg))",
                      border: "1px solid hsl(var(--border))",
                      padding: "2px 6px",
                      textTransform: "uppercase",
                    }}
                  >
                    {book.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Recent Sales */}
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 400,
                fontFamily: "var(--font-serif)",
                color: "hsl(var(--foreground))",
                marginBottom: "16px",
              }}
            >
              Recent Sales
            </h2>
            {sales && sales.length > 0 ? (
              <div className="space-y-2">
                {sales.slice(0, 10).map(sale => (
                  <div
                    key={sale.id}
                    className="flex items-center gap-4"
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid hsl(var(--border))",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: "16px", color: "hsl(var(--foreground))" }}>
                        {sale.book?.title}
                      </p>
                      <p style={{ fontSize: "14px", color: "hsl(var(--muted-foreground))" }}>
                        {sale.buyer?.username || "Unknown"} ·{" "}
                        {sale.createdAt
                          ? new Date(sale.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "16px",
                        fontFamily: "var(--font-mono)",
                        color: "rgb(var(--color-p-green-fg))",
                      }}
                    >
                      +₦{sale.purchasePrice}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "17px", color: "hsl(var(--muted-foreground))", textAlign: "center", padding: "24px" }}>
                No sales yet
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
