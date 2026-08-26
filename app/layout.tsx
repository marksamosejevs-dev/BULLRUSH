import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Golos_Text } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const text = Golos_Text({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-text",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bullrush.com"),
  title: {
    default: "BULLRUSH — Men's Performance Standard",
    template: "%s — BULLRUSH",
  },
  description:
    "BULLRUSH is a men's performance standard built on discipline, consistency and self-command. BULLRUSH DAILY: daily performance, 120 capsules.",
  openGraph: {
    title: "BULLRUSH — Men's Performance Standard",
    description: "Power under control. Earned power, not ego.",
    url: "https://bullrush.com",
    siteName: "BULLRUSH",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
