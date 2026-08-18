function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Here&apos;s what&apos;s happening across your academy today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value="—" />
        <StatCard label="Active Batches" value="—" />
        <StatCard label="Fees Due" value="—" />
        <StatCard label="Today's Attendance" value="—" />
      </div>

      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Dashboard widgets will appear here as modules are built.
        </p>
      </div>
    </div>
  );
}
