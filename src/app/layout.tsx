import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import Grain from "@/components/useful/Grain";
import SmoothScroll from "@/components/useful/SmoothScroll";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "elioo — Bilal Ait Sai",
  description:
    "Chanteur et réalisateur. Musique et cinéma, créés avec lenteur.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="bg-paper">
        <SmoothScroll />
        <Grain />
        {children}
      </body>
    </html>
  );
}
