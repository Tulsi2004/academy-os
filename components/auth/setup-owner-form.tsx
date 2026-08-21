"use client";

import { useActionState } from "react";
import { AlertCircleIcon } from "lucide-react";
import { bootstrapOwner, type SetupActionState } from "@/lib/actions/setup";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SetupActionState = {};

export function SetupOwnerForm({ defaultName }: { defaultName: string }) {
  const [state, formAction, pending] = useActionState(bootstrapOwner, initialState);

  return (
    <form action={formAction} className="space-y-5">
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
        <Input id="name" name="name" defaultValue={defaultName} required />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Setting up…" : "Create owner account"}
      </Button>
    </form>
  );
}
