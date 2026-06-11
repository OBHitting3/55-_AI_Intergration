import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Vault — Private, local AI",
  description: "Your data stays home. A private AI over your own files.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-100 antialiased">{children}</body>
    </html>
  );
}
