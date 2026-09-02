const map = {
  PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  ASSIGNED: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  MECHANIC_ON_THE_WAY: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  IN_PROGRESS: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  COMPLETED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  AVAILABLE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  BUSY: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  OFFLINE: "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400",
  ON_THE_WAY: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
};
export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] || "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300"}`}>
      {status?.replaceAll("_", " ")}
    </span>
  );
}
