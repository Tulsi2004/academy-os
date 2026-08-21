import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center gap-1">
        <span className="font-heading text-2xl font-extrabold text-foreground">
          Academy OS
        </span>
        <span className="text-sm text-muted-foreground">
          Manage your academy — students, courses, fees, and more.
        </span>
      </div>
      {children}
    </div>
  );
}
