export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2.5">
          {/* Breadcrumb / Tag pill skeleton */}
          <div className="h-4 w-28 rounded-full bg-amber-100/70" />
          {/* Title skeleton */}
          <div className="h-8 w-60 sm:w-72 rounded-2xl bg-stone-200/80" />
          {/* Subtitle skeleton */}
          <div className="h-4 w-80 sm:w-96 max-w-full rounded-lg bg-stone-200/60" />
        </div>

        {/* Action button / Badge skeleton */}
        <div className="h-10 w-36 rounded-xl bg-amber-100/70" />
      </div>

      {/* Metric Cards Skeleton Grid (3 Cards) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-stone-200/70 bg-white/60 p-5 backdrop-blur-sm space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="h-3.5 w-24 rounded bg-stone-200/60" />
                <div className="h-7 w-20 rounded-lg bg-stone-200/80" />
              </div>
              <div className="h-10 w-10 rounded-2xl bg-amber-100/70" />
            </div>
            <div className="h-3 w-36 rounded bg-stone-200/50 pt-2 border-t border-stone-100/80" />
          </div>
        ))}
      </div>

      {/* Main Content / Table Card Skeleton */}
      <div className="rounded-2xl border border-stone-200/70 bg-white/60 p-6 backdrop-blur-sm shadow-xs space-y-4">
        {/* Table header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/70">
          <div className="h-5 w-40 rounded-lg bg-stone-200/70" />
          <div className="h-4 w-24 rounded-md bg-stone-200/50" />
        </div>

        {/* Table Row Placeholders */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50/70 gap-4"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="h-8 w-8 rounded-lg bg-amber-100/60 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-48 max-w-full rounded bg-stone-200/70" />
                  <div className="h-3 w-32 rounded bg-stone-200/50" />
                </div>
              </div>
              <div className="h-6 w-20 rounded-full bg-stone-200/60 shrink-0 hidden sm:block" />
              <div className="h-7 w-16 rounded-lg bg-stone-200/60 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

