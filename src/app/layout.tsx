import type { Metadata, Viewport } from "next";
import { Pirata_One, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";

const pirataOne = Pirata_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pirata",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-baskerville",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thousand Seas Archive",
  description: "One Piece TCG — Crew Collection Tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TSA",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <body className={`${pirataOne.variable} ${libreBaskerville.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
