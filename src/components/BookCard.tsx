import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { bookUrl, authorUrl } from "../../contracts/blog";
import SafeImage from "./SafeImage";
import { PiHeart, PiHeartStraight } from "react-icons/pi";

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

const NEW_BADGE_MS = 14 * 24 * 60 * 60 * 1000;

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
  const isNew =
    !!createdAt &&
    Date.now() - new Date(createdAt).getTime() < NEW_BADGE_MS;

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    onToggleWishlist?.(id);
  };

  return (
    <article
      className="sidebar-item group cursor-pointer transition-transform duration-200 ease-spring active:scale-[0.98]"
      style={{ animationDelay: `${Math.min(index * 45, 450)}ms` }}
      onClick={() => navigate(bookUrl({ slug, id }))}
    >
      {/* Cushioned cover well (tinted backdrop + inset cover) */}
      <div className="relative mb-3 rounded-[4px] bg-secondary p-3 pb-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-soft-lg">
        <div className="relative overflow-hidden rounded-[2px] shadow-soft">
          <SafeImage
            src={coverImage}
            alt={`Cover of ${title} by ${author}`}
            className="aspect-[3/4] w-full object-cover"
          />
          {isNew && (
            <span className="absolute left-2 top-2 rounded-[4px] bg-[#c0a040] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#141005]">
              New
            </span>
          )}
          <button
            onClick={handleWishlist}
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/95 transition-all duration-300 ease-spring hover:bg-accent active:scale-90"
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={!!wishlisted}
          >
            {wishlisted ? (
              <PiHeartStraight size={15} className="text-red-500" />
            ) : (
              <PiHeart size={15} className="text-foreground" />
            )}
          </button>
        </div>
      </div>
      <h3 className="line-clamp-2 min-h-[2.6em] font-serif text-base leading-snug tracking-tight text-foreground md:text-[19px]">
        {title}
      </h3>
      <p className="mt-0.5 truncate text-sm text-muted-foreground">
        <button
          className="transition-colors hover:text-foreground hover:underline hover:underline-offset-2"
          onClick={e => {
            e.stopPropagation();
            navigate(authorUrl({ authorSlug, author }));
          }}
        >
          {author}
        </button>
      </p>
      <div className="mt-1.5 flex items-center justify-between">
        {category && (
          <span className="max-w-[60%] truncate font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground md:text-[11px]">
            {category}
          </span>
        )}
        <span className="tnum font-mono text-[13px] text-foreground md:text-[14px]">
          ₦{price}
        </span>
      </div>
    </article>
  );
}
