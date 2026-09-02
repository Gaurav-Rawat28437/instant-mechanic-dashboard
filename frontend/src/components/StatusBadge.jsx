const map = {
  PENDING: "bg-amber-50 text-amber-700",
  ASSIGNED: "bg-blue-50 text-blue-700",
  MECHANIC_ON_THE_WAY: "bg-violet-50 text-violet-700",
  IN_PROGRESS: "bg-cyan-50 text-cyan-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  BUSY: "bg-amber-50 text-amber-700",
  OFFLINE: "bg-slate-100 text-slate-500",
  ON_THE_WAY: "bg-violet-50 text-violet-700"
};
export default function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] || "bg-slate-100 text-slate-600"}`}>{status?.replaceAll("_", " ")}</span>;
}
