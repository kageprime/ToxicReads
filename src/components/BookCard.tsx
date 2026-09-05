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
}: BookCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
      <div className="relative mb-3 aspect-[3/4] overflow-hidden border border-border bg-card shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-soft-lg">
        <SafeImage
          src={coverImage}
          alt={`Cover of ${title} by ${author}`}
          className="h-full w-full object-cover"
        />
        <button
          onClick={handleWishlist}
          className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/95 transition-all duration-300 ease-spring hover:bg-accent active:scale-90"
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
