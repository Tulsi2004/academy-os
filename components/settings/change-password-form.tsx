"use client";

import { useActionState } from "react";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { changeOwnPassword, type AuthActionState } from "@/lib/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changeOwnPassword, initialState);

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <div>
        {state.error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        {state.success && (
          <Alert className="border-[#27af90]/30 bg-[#27af90]/10 text-[#27af90] dark:text-[#4dc9a8] [&_svg]:text-current">
            <CheckCircle2Icon />
            <AlertDescription className="text-current">Password updated.</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Keyed so the fields clear after a successful submit instead of holding stale values. */}
      <div key={state.success ? "done" : "pending"} className="space-y-4">
        <div>
          <Label htmlFor="currentPassword" className="mb-1.5">
            Current password
          </Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <div>
          <Label htmlFor="newPassword" className="mb-1.5">
            New password
          </Label>
          <Input id="newPassword" name="newPassword" type="password" required autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="confirmPassword" className="mb-1.5">
            Confirm new password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
          />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
