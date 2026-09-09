import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

/*
  Every screen you can reach from the enquiry list gets the same way out, in the
  same place. The tab strip can also take you back, but only if you already
  understand that "To call" is a view of the list rather than a screen of its
  own — which is exactly the thing a new user has not learned yet.
*/
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ArrowLeftIcon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
