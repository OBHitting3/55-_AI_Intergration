import type { Metadata } from "next";
import { config } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${config.brandName} — Private, local AI`,
  description: config.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-100 antialiased">{children}</body>
    </html>
  );
}
