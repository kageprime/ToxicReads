/** Skeleton loaders that match the layout shape. Use instead of spinners/text. */

export function Skel({ className = "" }: { className?: string }) {
  return <div className={`skel ${className}`} aria-hidden="true" />;
}

export function BookCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="sidebar-item"
      style={{ animationDelay: `${Math.min(index * 45, 450)}ms` }}
    >
      <Skel className="mb-3 aspect-[3/4] !rounded-none border border-border" />
      <Skel className="h-5 w-4/5" />
      <Skel className="mt-1.5 h-4 w-3/5" />
      <div className="mt-1.5 flex items-center justify-between">
        <Skel className="h-3 w-12" />
        <Skel className="h-4 w-14" />
      </div>
    </div>
  );
}

export function BookGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5"
      aria-label="Loading books"
      role="status"
    >
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

export function BookDetailSkeleton() {
  return (
    <div
      className="min-h-full bg-background"
      aria-label="Loading book"
      role="status"
    >
      <div className="mx-auto max-w-[880px] px-8 pb-24 pt-10">
        <Skel className="mb-6 h-5 w-16" />
        <div className="flex flex-col gap-8 md:flex-row">
          <Skel className="aspect-[3/4] w-full max-w-[320px] shrink-0 !rounded-none" />
          <div className="flex-1">
            <Skel className="mb-3 h-6 w-24" />
            <Skel className="mb-2 h-9 w-11/12" />
            <Skel className="mb-1 h-9 w-2/3" />
            <Skel className="mb-6 h-6 w-40" />
            <Skel className="mb-6 h-7 w-28" />
            <Skel className="h-12 w-full !rounded-full" />
            <Skel className="mt-3 h-12 w-full !rounded-full" />
          </div>
        </div>
        <Skel className="mt-8 h-32 w-full" />
      </div>
    </div>
  );
}

export function RowsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div aria-label="Loading" role="status" className="divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4">
          <Skel className="h-[52px] w-10 shrink-0 !rounded-none" />
          <div className="min-w-0 flex-1">
            <Skel className="h-5 w-2/3" />
            <Skel className="mt-1.5 h-4 w-1/3" />
          </div>
          <Skel className="h-9 w-20 !rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ReaderSkeleton() {
  return (
    <div
      className="mx-auto max-w-[680px] px-6 pb-24 pt-16"
      aria-label="Loading chapter"
      role="status"
    >
      <Skel className="mx-auto mb-4 h-8 w-3/4" />
      <Skel className="mx-auto mb-10 h-5 w-40" />
      {Array.from({ length: 9 }).map((_, i) => (
        <Skel
          key={i}
          className="mb-4 h-5"
          // Vary line lengths for a natural paragraph rhythm
          // (narrow last line reads as a paragraph end)
        />
      ))}
      <Skel className="mb-4 h-5 w-2/3" />
    </div>
  );
}
