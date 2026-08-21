import { clerkMiddleware } from "@clerk/nextjs/server";

// Route-level protection lives in each layout/page (see app/(main)/layout.tsx)
// rather than here — Clerk's path-based `auth.protect()` matching is deprecated
// in favor of resource-based checks that can't drift out of sync with routing.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
