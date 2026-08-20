function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your academy today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value="—" />
        <StatCard label="Active Batches" value="—" />
        <StatCard label="Fees Due" value="—" />
        <StatCard label="Today's Attendance" value="—" />
      </div>

      <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <p className="text-sm text-muted-foreground">
          Dashboard widgets will appear here as modules are built.
        </p>
      </div>
    </div>
  );
}
