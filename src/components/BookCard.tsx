import { useState } from "react";
import { useNavigate } from "react-router";
import SafeImage from "./SafeImage";
import { PiArrowUpRight } from "react-icons/pi";

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  price: string;
  coverImage: string;
  category?: string;
  index?: number;
}

export default function BookCard({
  id,
  title,
  author,
  price,
  coverImage,
  category,
  index = 0,
}: BookCardProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="sidebar-item group cursor-pointer"
      style={{ animationDelay: `${Math.min(index * 45, 450)}ms` }}
      onClick={() => navigate(`/book/${id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative overflow-hidden mb-3"
        style={{
          border: "1px solid var(--border)",
          aspectRatio: "3/4",
          transition: "border-color 0.2s ease",
        }}
      >
        <SafeImage
          src={coverImage}
          alt={title}
          style={{
            transform: hovered ? "scale(1.04)" : "scale(1)",
            filter: hovered ? "grayscale(100%)" : "none",
            transition:
              "transform 0.5s cubic-bezier(0.16,1,0.3,1), filter 0.4s ease",
          }}
        />
        <span
          className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-background transition-all duration-200"
          style={{
            width: 30,
            height: 30,
            border: "1px solid var(--border)",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(-4px)",
          }}
        >
          <PiArrowUpRight size={15} style={{ color: "var(--foreground)" }} />
        </span>
      </div>
      <h3
        className="font-serif text-foreground truncate"
        style={{ fontSize: "19px", lineHeight: 1.3, letterSpacing: "-0.01em" }}
      >
        {title}
      </h3>
      <p className="text-muted-foreground truncate" style={{ fontSize: "15px" }}>
        {author}
      </p>
      <div className="flex items-center justify-between mt-1.5">
        {category && (
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground truncate">
            {category}
          </span>
        )}
        <span className="font-mono text-[14px] text-foreground">
          ₦{price}
        </span>
      </div>
    </article>
  );
}
