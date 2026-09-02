export default function StatCard({ title, value, icon: Icon, note }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-3"><Icon size={20}/></div>
      </div>
      {note && <p className="mt-4 text-xs text-slate-400">{note}</p>}
    </div>
  );
}
