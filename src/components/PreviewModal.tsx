import { useEffect } from "react";
import { PiX, PiBookOpen } from "react-icons/pi";
import SafeImage from "./SafeImage";

interface PreviewModalProps {
  title: string;
  author: string;
  price: string;
  coverImage: string;
  preview: string;
  totalChars: number;
  onClose: () => void;
  onBuy: () => void;
}

function formatNaira(price: string) {
  const numeric = Number(String(price).replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) {
    return `₦${numeric.toLocaleString("en-NG")}`;
  }
  return `₦${price}`;
}

/** Free sample: first pages in a reader-styled modal, ending in a purchase CTA. */
export default function PreviewModal({
  title,
  author,
  price,
  coverImage,
  preview,
  totalChars,
  onClose,
  onBuy,
}: PreviewModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const paragraphs = preview
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const percent = Math.max(
    1,
    Math.round((preview.length / Math.max(totalChars, 1)) * 100)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/75 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div
        className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-soft-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3.5 border-b border-border px-5 py-3.5">
          <div className="w-9 aspect-[2/3] rounded-[2px] overflow-hidden bg-secondary cover-frame shrink-0">
            <SafeImage
              src={coverImage}
              alt={`${title} cover`}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="preview-modal-title"
              className="truncate font-serif text-lg font-medium leading-tight text-foreground"
            >
              {title}
            </h2>
            <p className="truncate text-xs text-muted-foreground mt-0.5">
              by {author} · Free {percent}% sample
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close preview"
          >
            <PiX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-10">
          {paragraphs.length > 0 ? (
            <div className="max-w-[58ch] mx-auto">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-pretty mb-[1.25em] font-serif text-[17.5px] sm:text-[18.5px] leading-[1.78] text-foreground"
                >
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No preview excerpt is available for this edition yet.
            </p>
          )}

          <div
            className="pointer-events-none sticky bottom-0 -mx-6 sm:-mx-10 flex justify-center px-6 pb-2 pt-12"
            style={{
              background:
                "linear-gradient(transparent, hsl(var(--card)) 72%)",
            }}
            aria-hidden="true"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <PiBookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              End of free sample
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border bg-secondary/40 px-6 py-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Digital edition</p>
            <p className="font-mono text-lg font-medium text-foreground tnum">
              {formatNaira(price)}
            </p>
          </div>
          <button
            type="button"
            onClick={onBuy}
            className="rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Buy edition to keep reading
          </button>
        </div>
      </div>
    </div>
  );
}
