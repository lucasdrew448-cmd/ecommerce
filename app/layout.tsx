import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Headless Ecommerce Store",
  description: "A Next.js headless ecommerce storefront built for composable APIs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="page-shell">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
