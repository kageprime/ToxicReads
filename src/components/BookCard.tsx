import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { bookUrl, authorUrl } from "../../contracts/blog";
import SafeImage from "./SafeImage";
import { PiHeart, PiHeartFill } from "react-icons/pi";

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  price: string;
  coverImage: string;
  category?: string;
  index?: number;
  wishlisted?: boolean;
  onToggleWishlist?: (id: number) => void;
  slug?: string | null;
  authorSlug?: string | null;
  createdAt?: Date | string | number | null;
}

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

function formatNaira(price: string) {
  const numeric = Number(String(price).replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) {
    return `₦${numeric.toLocaleString("en-NG")}`;
  }
  return `₦${price}`;
}

export default function BookCard({
  id,
  title,
  author,
  price,
  coverImage,
  category,
  index = 0,
  wishlisted,
  onToggleWishlist,
  slug,
  authorSlug,
  createdAt,
}: BookCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mountedAt] = useState(() => Date.now());

  const isNew = (() => {
    if (!createdAt) return false;
    const ts =
      createdAt instanceof Date
        ? createdAt.getTime()
        : typeof createdAt === "number"
          ? createdAt < 1e12
            ? createdAt * 1000
            : createdAt
          : Date.parse(createdAt);
    return Number.isFinite(ts) && mountedAt - ts < FOURTEEN_DAYS_MS;
  })();

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    onToggleWishlist?.(id);
  };

  const destination = bookUrl({ slug, id });

  return (
    <article
      className="group flex flex-col animate-fade-up"
      style={{
        animationDelay: `${Math.min(index, 12) * 35}ms`,
      }}
    >
      {/* Physical book cover */}
      <div className="relative mb-3">
        <button
          type="button"
          onClick={() => navigate(destination)}
          className="block w-full aspect-[2/3] rounded-sm overflow-hidden bg-secondary cover-frame shadow-soft transition-all duration-300 ease-spring group-hover:-translate-y-0.5 group-hover:shadow-soft-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`View ${title} by ${author}`}
        >
          <SafeImage
            src={coverImage}
            alt={`${title} cover`}
            className="h-full w-full object-cover transition-transform duration-500 ease-spring group-hover:scale-[1.015]"
          />
        </button>

        {onToggleWishlist && (
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
            aria-pressed={!!wishlisted}
            className={`absolute top-2.5 right-2.5 h-8 w-8 rounded-full flex items-center justify-center border transition-all duration-200 backdrop-blur-sm ${
              wishlisted
                ? "bg-card/95 border-border text-signal opacity-100 shadow-xs"
                : "bg-card/85 border-border/70 text-foreground/75 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-signal hover:bg-card"
            }`}
          >
            {wishlisted ? (
              <PiHeartFill className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PiHeart className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Metadata footer — keeps cover completely free of pills */}
      <div className="flex flex-col gap-1 min-w-0">
        {(category || isNew) && (
          <div className="flex items-center gap-2 text-[11.5px] leading-none">
            {category && (
              <span className="text-muted-foreground font-medium truncate">
                {category}
              </span>
            )}
            {isNew && (
              <span className="inline-flex items-center gap-1 text-signal font-medium shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
                New
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate(destination)}
          className="text-left focus-visible:outline-none focus-visible:underline"
        >
          <h3 className="font-serif text-[17px] leading-[1.28] font-medium text-foreground line-clamp-2 group-hover:text-signal transition-colors">
            {title}
          </h3>
        </button>

        <button
          type="button"
          onClick={() => navigate(authorUrl({ authorSlug, author }))}
          className="text-left text-[13px] text-muted-foreground hover:text-foreground transition-colors truncate w-fit max-w-full"
        >
          {author}
        </button>

        <p className="font-mono text-[13px] font-medium tnum text-foreground mt-0.5">
          {formatNaira(price)}
        </p>
      </div>
    </article>
  );
}
