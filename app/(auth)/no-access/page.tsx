import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Lives in the (auth) group so it inherits the branded, centred shell — the URL
// is still /no-access.
export const metadata = {
  title: "No access — Academy OS",
};

export default function NoAccessPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Account not linked</CardTitle>
        <CardDescription>
          You&apos;re signed in, but this account isn&apos;t linked to an academy
          yet. Accounts are added by an academy owner — there&apos;s nothing you
          can do from this screen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          If you think this is a mistake, ask your academy&apos;s owner to add
          your email address, then sign in again.
        </p>
        <SignOutButton>
          <Button variant="outline" className="w-full">
            Sign out
          </Button>
        </SignOutButton>
      </CardContent>
    </Card>
  );
}
