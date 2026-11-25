import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai_Looped } from "next/font/google";
import "./globals.css";

const thai = Noto_Sans_Thai_Looped({
  subsets: ["thai", "latin"],
  variable: "--font-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pinpoint",
  description: "เกมทายใจ ถามจนแน่ใจ แล้วทายครั้งเดียว",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={thai.variable}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
