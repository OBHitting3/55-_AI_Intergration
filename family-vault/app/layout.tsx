import type { Metadata, Viewport } from "next";
import { config } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${config.brandName} — Private, local AI`,
  description: config.tagline,
  applicationName: config.brandName,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: config.brandName,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-100 antialiased">{children}</body>
    </html>
  );
}
