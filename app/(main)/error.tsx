"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangleIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
              <p className="mt-1 wrap-break-word text-sm text-muted-foreground">
                {error.message || "An unexpected error occurred while loading this page."}
              </p>
              {error.digest && (
                <p className="mt-2 font-mono text-xs text-muted-foreground/70">
                  Reference: {error.digest}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button variant="ghost" nativeButton={false} render={<Link href="/" />}>
              Back to dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
