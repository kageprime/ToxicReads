import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import SafeImage from "./SafeImage";
import { PiArrowUpRight, PiHeart, PiHeartStraight } from "react-icons/pi";

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
      className="sidebar-item group cursor-pointer active:scale-[0.98] transition-transform duration-200 ease-spring"
      style={{ animationDelay: `${Math.min(index * 45, 450)}ms` }}
      onClick={() => navigate(`/book/${id}`)}
    >
      <div className="relative overflow-hidden mb-3 border border-border aspect-[3/4] transition-colors duration-300 hover:border-foreground/30">
        <SafeImage
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 ease-spring group-hover:scale-[1.04]"
        />
        <button
          onClick={handleWishlist}
          className="absolute top-2 left-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-background/95 border border-border hover:bg-accent transition-all duration-300 ease-spring"
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlisted ? (
            <PiHeartStraight size={15} className="text-red-500" />
          ) : (
            <PiHeart size={15} className="text-foreground" />
          )}
        </button>
        <span className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-background/95 border border-border opacity-0 translate-y-[-4px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-spring">
          <PiArrowUpRight size={15} className="text-foreground" />
        </span>
      </div>
      <h3 className="font-serif text-foreground text-base md:text-[19px] leading-tight truncate tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm truncate mt-0.5">{author}</p>
      <div className="flex items-center justify-between mt-1.5">
        {category && (
          <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.1em] text-muted-foreground truncate max-w-[60%]">
            {category}
          </span>
        )}
        <span className="font-mono text-[13px] md:text-[14px] text-foreground">
          ₦{price}
        </span>
      </div>
    </article>
  );
}
