import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Mastery OS",
  description: "Private English mastery system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-fg">{children}</body>
    </html>
  );
}
