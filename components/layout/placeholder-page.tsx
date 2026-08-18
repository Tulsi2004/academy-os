export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">{title} module coming soon</p>
      </div>
    </div>
  );
}
