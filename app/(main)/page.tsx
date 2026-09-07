import { redirect } from "next/navigation";

// Enquiries is where the work happens, so it is the post-login landing page.
// Dashboard widgets are deliberately not built yet.
export default function HomePage() {
  redirect("/enquiries");
}
