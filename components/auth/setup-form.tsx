"use client";

import { useActionState } from "react";
import { AlertCircleIcon } from "lucide-react";
import { completeSetup, type AuthActionState } from "@/lib/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function SetupForm() {
  const [state, formAction, pending] = useActionState(completeSetup, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="name" className="mb-1.5">
          Your name
        </Label>
        <Input id="name" name="name" required autoFocus autoComplete="name" />
      </div>

      <div>
        <Label htmlFor="email" className="mb-1.5">
          Email
        </Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
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
          autoComplete="new-password"
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="mb-1.5">
          Confirm password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" disabled={pending} size="lg" className="w-full">
        {pending ? "Creating account…" : "Create owner account"}
      </Button>
    </form>
  );
}
