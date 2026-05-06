import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payment Gateway",
  description: "A secure TypeScript-powered payment processing application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
