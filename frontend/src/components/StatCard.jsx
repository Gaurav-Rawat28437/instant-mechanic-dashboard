import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, note, trend }) {
  const hasTrend = typeof trend === "number" && !Number.isNaN(trend);
  const positive = trend >= 0;

  return (
    <div className="group rounded-2xl border bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:shadow-soft-dark">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight dark:text-slate-100">{value}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-white dark:group-hover:text-slate-900">
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {hasTrend && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(trend)}%
          </span>
        )}
        {note && <p className="text-xs text-slate-400">{note}</p>}
      </div>
    </div>
  );
}
