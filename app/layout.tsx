import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BRRRR Analyzer",
  description: "One‑page BRRRR deal analyzer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <main className="container max-w-6xl py-10">{children}</main>
      </body>
    </html>
  );
}