"use client";

import { useActionState } from "react";
import { AlertCircleIcon } from "lucide-react";
import { login, type AuthActionState } from "@/lib/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="email" className="mb-1.5">
          Email
        </Label>
        <Input id="email" name="email" type="email" required autoFocus autoComplete="email" />
      </div>

      <div>
        <Label htmlFor="password" className="mb-1.5">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" disabled={pending} size="lg" className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
