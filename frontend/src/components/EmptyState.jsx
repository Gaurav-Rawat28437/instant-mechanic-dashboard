export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {Icon && (
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <Icon size={24} />
        </div>
      )}
      <p className="font-semibold text-slate-600 dark:text-slate-300">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-400">{description}</p>}
    </div>
  );
}
