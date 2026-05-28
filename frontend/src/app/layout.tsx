import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clave — Payment Infrastructure for Web3 Workers",
  description: "Trustless payments, auto-enforcement, onchain reputation. Built on Arc Network.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
