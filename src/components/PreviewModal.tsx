import { PiX, PiBookOpen } from "react-icons/pi";

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

/** Free sample: first pages in a reader-styled modal, ends in a buy CTA. */
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
  const paragraphs = preview
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);
  const percent = Math.max(
    1,
    Math.round((preview.length / Math.max(totalChars, 1)) * 100)
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${title}`}
    >
      <div
        className="flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden border border-border bg-background"
        style={{ animation: "modalIn 0.25s ease-out both" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <img
            src={coverImage}
            alt=""
            className="h-12 w-9 shrink-0 border border-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg leading-tight text-foreground">
              {title}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              by {author} · free {percent}% sample
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 transition-colors hover:bg-accent"
            aria-label="Close preview"
          >
            <PiX size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-8">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-pretty mb-[1.2em] font-serif text-[18px] leading-[1.75] text-foreground"
              >
                {p}
              </p>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              No preview available for this book yet.
            </p>
          )}
          {/* Fade into the paywall */}
          <div
            className="pointer-events-none sticky bottom-0 -mx-5 flex justify-center px-5 pb-1 pt-10 md:-mx-8"
            style={{
              background:
                "linear-gradient(transparent, hsl(var(--background)) 70%)",
            }}
            aria-hidden="true"
          >
            <span className="mb-1 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              <PiBookOpen size={14} /> End of free sample
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border px-5 py-3.5">
          <span className="tnum font-mono text-xl text-foreground">
            ₦{price}
          </span>
          <button
            onClick={onBuy}
            className="flex-1 bg-foreground p-3 text-lg text-background transition hover:opacity-90 active:scale-[0.98]"
          >
            Buy now — keep reading
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
