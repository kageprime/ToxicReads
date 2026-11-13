import type { ReactNode } from "react";
import SafeImage from "./SafeImage";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  image?: string;
  imageAlt?: string;
}

export default function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  image,
  imageAlt = "",
}: EmptyStateProps) {
  return (
    <div className="w-full py-12 px-6">
      <div className="max-w-md mx-auto rounded-xl border border-border bg-card/70 px-6 py-10 text-center">
        {image ? (
          <div className="w-24 aspect-[2/3] mx-auto mb-5 rounded-sm overflow-hidden cover-frame shadow-soft bg-secondary">
            <SafeImage
              src={image}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-4 text-foreground/80">
            {icon}
          </div>
        )}

        <h3 className="font-serif text-xl font-medium text-foreground tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6 text-pretty">
          {body}
        </p>

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
