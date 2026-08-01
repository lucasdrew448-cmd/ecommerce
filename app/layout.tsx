import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Discus Fish Store — Premium Discus Fish",
    template: "%s | Discus Fish Store",
  },
  description: "Premium discus fish for sale. Healthy, hand-picked discus fish with expert support and safe shipping.",
  keywords: ["discus fish", "discus fish for sale", "premium discus", "aquarium fish", "freshwater fish"],
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