export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="w-2/3 space-y-3">
          <SkeletonBlock className="h-3 w-1/2" />
          <SkeletonBlock className="h-7 w-3/4" />
        </div>
        <SkeletonBlock className="h-11 w-11 rounded-xl" />
      </div>
      <SkeletonBlock className="mt-4 h-3 w-1/3" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <SkeletonBlock className="mb-4 h-4 w-1/3" />
      <SkeletonBlock className="h-[280px] w-full" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 8 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <SkeletonBlock className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-2/3" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonBlock className="mt-5 h-14 w-full" />
      <SkeletonBlock className="mt-4 h-9 w-full" />
    </div>
  );
}
