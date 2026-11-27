import type { Metadata, Viewport } from "next";
import { Mali, Noto_Sans_Thai_Looped } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import "@/styles/globals.css";

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
  title: "byou",
  description: "เกมทายใจ ถามจนแน่ใจ แล้วทายครั้งเดียว",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The head script sets data-theme before hydration, so <html> may differ from the server render.
    <html lang="th" className={`${thai.variable} ${mali.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        {children}
        {/* Page views for the Vercel dashboard; it reports only on a Vercel deployment. */}
        <Analytics />
      </body>
    </html>
  );
}
