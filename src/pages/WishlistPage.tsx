import { useEffect } from "react";
import { useNavigate } from "react-router";
import { PiHeartStraight, PiTrash } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

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
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
      <div className="mx-auto" style={{ maxWidth: "1120px", padding: "40px 32px 96px" }}>
        <h1
          style={{
            fontSize: "34px",
            fontWeight: 400,
            fontFamily: "var(--font-serif)",
            color: "hsl(var(--foreground))",
            marginBottom: "32px",
            letterSpacing: "-0.01em",
          }}
        >
          Wishlist
        </h1>

        {isLoading ? (
          <p style={{ fontSize: "18px", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
            LOADING...
          </p>
        ) : items && items.length > 0 ? (
          <div className="space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-4 transition-colors hover:bg-accent"
                style={{
                  padding: "16px",
                  borderBottom: "1px solid hsl(var(--border))",
                }}
              >
                <img
                  src={item.book?.coverImage || ""}
                  alt={item.book?.title || ""}
                  style={{
                    width: "50px",
                    height: "66px",
                    objectFit: "cover",
                    border: "1px solid hsl(var(--border))",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/book/${item.book?.id}`)}
                />
                <div
                  className="flex-1 min-w-0"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/book/${item.book?.id}`)}
                >
                  <p
                    style={{
                      fontSize: "18px",
                      color: "hsl(var(--foreground))",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.book?.title}
                  </p>
                  <p style={{ fontSize: "16px", color: "hsl(var(--muted-foreground))" }}>
                    {item.book?.author} · ₦{item.book?.price}
                  </p>
                </div>
                <button
                  onClick={() => removeMutation.mutate({ bookId: item.bookId })}
                  disabled={removeMutation.isPending}
                  style={{
                    fontSize: "15px",
                    fontFamily: "var(--font-mono)",
                    color: "rgb(var(--color-p-red-fg))",
                    background: "none",
                    border: "1px solid var(--color-p-red-fg)",
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  <PiTrash size={12} style={{ marginRight: "4px" }} />
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <PiHeartStraight
              size={32}
              style={{
                color: "hsl(var(--muted-foreground))",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ fontSize: "19px", color: "hsl(var(--muted-foreground))", marginBottom: "16px" }}>
              Your wishlist is empty
            </p>
            <button
              onClick={() => navigate("/home")}
              className="transition-transform active:scale-[0.98]"
              style={{
                fontSize: "17px",
                fontFamily: "var(--font-mono)",
                color: "hsl(var(--foreground))",
                background: "none",
                border: "1px solid hsl(var(--border))",
                padding: "8px 16px",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              Browse books
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
