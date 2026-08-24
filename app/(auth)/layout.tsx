import Image from "next/image";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Image
          src="/logo-full.png"
          alt="Tulsi"
          width={1039}
          height={697}
          priority
          className="h-32 w-auto"
        />
        <span className="text-sm text-muted-foreground">
          Manage your academy — students, courses, fees, and more.
        </span>
      </div>
      {children}
    </div>
  );
}
