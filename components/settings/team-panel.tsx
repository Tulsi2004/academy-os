"use client";

import { useActionState, useState } from "react";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { UserRole } from "@/generated/prisma/enums";
import {
  createStaffAccount,
  resetStaffPassword,
  toggleStaffActive,
  type AuthActionState,
} from "@/lib/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
};

const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  RECEPTIONIST: "Receptionist",
  TEACHER: "Teacher",
  ACCOUNTANT: "Accountant",
};

const initialState: AuthActionState = {};

export function TeamPanel({
  staff,
  currentUserId,
}: {
  staff: StaffMember[];
  currentUserId: string;
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
          <CardDescription>Staff accounts that can sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {staff.map((member) => (
              <StaffRow key={member.id} member={member} isSelf={member.id === currentUserId} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add staff account</CardTitle>
          <CardDescription>They can sign in immediately with this password.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateStaffForm />
        </CardContent>
      </Card>
    </>
  );
}

function StaffRow({ member, isSelf }: { member: StaffMember; isSelf: boolean }) {
  const [showReset, setShowReset] = useState(false);
  const toggleAction = toggleStaffActive.bind(null, member.id, !member.active);

  return (
    <div className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {member.name} {isSelf && <span className="text-muted-foreground">(you)</span>}
          </p>
          <p className="text-sm text-muted-foreground">{member.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{ROLE_LABELS[member.role]}</Badge>
          <Badge variant={member.active ? "secondary" : "destructive"}>
            {member.active ? "Active" : "Inactive"}
          </Badge>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowReset((v) => !v)}>
            Reset password
          </Button>
          {!isSelf && (
            <form action={toggleAction}>
              <Button type="submit" variant={member.active ? "destructive" : "outline"} size="sm">
                {member.active ? "Deactivate" : "Reactivate"}
              </Button>
            </form>
          )}
        </div>
      </div>
      {showReset && <ResetPasswordForm userId={member.id} />}
    </div>
  );
}

function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(resetStaffPassword, initialState);

  return (
    <form action={formAction} className="mt-3 rounded-lg bg-muted/50 p-3">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-40 flex-1">
          <Label htmlFor={`password-${userId}`} className="mb-1.5">
            New password
          </Label>
          <Input
            id={`password-${userId}`}
            name="password"
            type="password"
            required
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
      {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
      {state.success && (
        <p className="mt-2 text-sm text-[#27af90] dark:text-[#4dc9a8]">
          Password reset — they&apos;ll need to sign in again.
        </p>
      )}
    </form>
  );
}

function CreateStaffForm() {
  const [state, formAction, pending] = useActionState(createStaffAccount, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4">
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
            <AlertDescription className="text-current">Account created.</AlertDescription>
          </Alert>
        )}
      </div>

      <div key={state.success ? "done" : "pending"} className="space-y-4">
        <div>
          <Label htmlFor="name" className="mb-1.5">
            Name
          </Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email" className="mb-1.5">
            Email
          </Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="role" className="mb-1.5">
            Role
          </Label>
          <Select name="role" defaultValue={UserRole.RECEPTIONIST}>
            <SelectTrigger id="role" className="w-full">
              <SelectValue>
                {(value: string | null) => (value ? ROLE_LABELS[value as UserRole] : "")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.values(UserRole).map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="password" className="mb-1.5">
            Initial password
          </Label>
          <Input id="password" name="password" type="password" required autoComplete="new-password" />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
