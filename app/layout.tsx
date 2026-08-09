import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Used Dirt Bike Store — Quality Used Dirt Bikes",
    template: "%s | Used Dirt Bike Store",
  },
  description: "Quality used dirt bikes for sale. Inspected, hand-picked used dirt bikes with expert support and safe shipping.",
  keywords: ["used dirt bike", "used dirt bikes for sale", "premium dirt bike", "off-road motorcycle", "dirt bike"],
  icons: {
    icon: [{ url: "/favicon.jpg", type: "image/jpeg" }],
    apple: [{ url: "/favicon.jpg", type: "image/jpeg" }],
  },
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