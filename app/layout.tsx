import type { Metadata } from "next";
import { Nunito, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Academy OS",
  description: "Manage your academy — students, courses, fees, and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider afterSignOutUrl="/login">
      <html
        lang="en"
        className={`${nunito.variable} ${plusJakarta.variable} h-full antialiased`}
      >
        <body className="min-h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
