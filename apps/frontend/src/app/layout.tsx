import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clawd",
  description: "AI chat powered by Gemini",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}