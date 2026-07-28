import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Headless Ecommerce Store",
  description: "A Next.js headless ecommerce storefront built for composable APIs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">{children}</div>
      </body>
    </html>
  );
}
