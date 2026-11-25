import type { Metadata, Viewport } from "next";
import { Mali, Noto_Sans_Thai_Looped } from "next/font/google";
import "./globals.css";

const thai = Noto_Sans_Thai_Looped({
  subsets: ["thai", "latin"],
  variable: "--font-thai",
  display: "swap",
});

const mali = Mali({
  subsets: ["thai", "latin"],
  weight: ["500", "600"],
  variable: "--font-mali",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KnowYou",
  description: "เกมทายใจ ถามจนแน่ใจ แล้วทายครั้งเดียว",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${thai.variable} ${mali.variable}`}>
      <body>{children}</body>
    </html>
  );
}
