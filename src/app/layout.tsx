import type { Metadata } from "next";
import { Pirata_One, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";

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
  title: "Thousand Seas Archive – One Piece TCG Team Collection",
  description: "Password-protected One Piece TCG team collection and borrow tracker.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" className="dark">
      <body className={`${pirataOne.variable} ${libreBaskerville.variable} min-h-screen`} style={{ background: '#b8924a' }}>
        {children}
      </body>
    </html>
  );
}
