import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";

const monofonto = Space_Mono({
  variable: "--font-monofonto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "FIT_HERO.exe - Level Up Your Life",
  description: "Transform boring exercise into epic quests with gamified workouts and AI-powered meal planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${monofonto.variable} antialiased font-mono`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
