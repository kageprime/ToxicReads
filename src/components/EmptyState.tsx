import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Optional cover art shown above the icon tile. */
  image?: string;
  imageAlt?: string;
}

/** Composed empty state: art, headline, explanation, one action. */
export default function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  image,
  imageAlt,
}: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-16 text-center">
      {image ? (
        <img
          src={image}
          alt={imageAlt ?? ""}
          className="h-32 w-24 rotate-[-3deg] rounded-md border border-border object-cover shadow-soft-lg"
        />
      ) : (
        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-card text-muted-foreground shadow-soft">
          {icon}
        </span>
      )}
      <h3 className="text-balance mt-5 font-serif text-2xl tracking-tight text-baobab">
        {title}
      </h3>
      <p className="text-pretty mt-2 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
