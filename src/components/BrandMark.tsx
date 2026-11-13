import { Link } from "react-router";

interface BrandMarkProps {
  /** Destination route when rendered as a link. Pass null for static presentation. */
  to?: string | null;
  /** Compact variant hides the full wordmark text (used in collapsed rail). */
  compact?: boolean;
  /** Size variant for headers vs compact sidebars. */
  size?: "sm" | "md";
  className?: string;
}

/** Minimal press bookmark colophon (2 geometric primitives). */
export function PressColophon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6 3.75h12v16.5L12 16l-6 4.25V3.75Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.25" r="2" fill="hsl(var(--primary-signal))" />
    </svg>
  );
}

/** Unified ToxicReads press wordmark and bookmark emblem. */
export default function BrandMark({
  to = "/",
  compact = false,
  size = "md",
  className = "",
}: BrandMarkProps) {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const textSize = size === "sm" ? "text-[17px]" : "text-[19px]";

  const content = (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <PressColophon className={`${iconSize} shrink-0 text-foreground`} />
      {!compact && (
        <span
          className={`font-serif font-semibold tracking-[-0.02em] text-foreground leading-none ${textSize}`}
        >
          ToxicReads
        </span>
      )}
    </span>
  );

  if (to === null) return content;

  return (
    <Link
      to={to}
      className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="ToxicReads home"
    >
      {content}
    </Link>
  );
}
