export function Skel({ className = "" }: { className?: string }) {
  return <div className={`skel ${className}`} aria-hidden="true" />;
}

export function BookCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="flex flex-col animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
    >
      <Skel className="w-full aspect-[2/3] mb-3 !rounded-sm" />
      <Skel className="h-2.5 w-14 mb-2" />
      <Skel className="h-4 w-4/5 mb-1.5" />
      <Skel className="h-3 w-1/2 mb-2" />
      <Skel className="h-3.5 w-16" />
    </div>
  );
}

export function BookGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-9"
      aria-busy="true"
      aria-label="Loading books"
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
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      aria-busy="true"
      aria-label="Loading edition details"
    >
      <Skel className="h-4 w-24 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr] gap-8 lg:gap-12">
        <Skel className="w-full aspect-[2/3] !rounded-sm" />
        <div className="space-y-4 pt-1">
          <Skel className="h-3 w-20" />
          <Skel className="h-9 w-4/5" />
          <Skel className="h-4 w-40" />
          <div className="flex gap-3 pt-2">
            <Skel className="h-11 w-36 !rounded-full" />
            <Skel className="h-11 w-32 !rounded-full" />
          </div>
          <div className="pt-6 space-y-2.5">
            <Skel className="h-4 w-full" />
            <Skel className="h-4 w-full" />
            <Skel className="h-4 w-5/6" />
            <Skel className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RowsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading items">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
        >
          <Skel className="h-16 w-11 shrink-0 !rounded-sm" />
          <div className="flex-1 space-y-2">
            <Skel className="h-4 w-1/3" />
            <Skel className="h-3 w-1/4" />
          </div>
          <Skel className="h-9 w-24 !rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ReaderSkeleton() {
  return (
    <div
      className="max-w-[660px] mx-auto px-6 py-20 space-y-5"
      aria-busy="true"
      aria-label="Loading reader"
    >
      <Skel className="h-8 w-2/3 mb-8" />
      <Skel className="h-4 w-full" />
      <Skel className="h-4 w-full" />
      <Skel className="h-4 w-11/12" />
      <Skel className="h-4 w-full" />
      <Skel className="h-4 w-3/4" />
      <div className="pt-4 space-y-4">
        <Skel className="h-4 w-full" />
        <Skel className="h-4 w-full" />
        <Skel className="h-4 w-5/6" />
      </div>
    </div>
  );
}
