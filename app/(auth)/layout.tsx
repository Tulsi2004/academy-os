import type { ReactNode } from "react";
import { LogoMarkIcon } from "@/components/layout/icons";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="mb-6 flex items-center gap-2">
        <LogoMarkIcon className="h-8 w-8 text-primary" />
        <span className="font-heading text-lg font-bold text-foreground">Academy OS</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
