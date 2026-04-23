import "./globals.css";
import { Syne, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["400","500","600","700","800"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", weight: ["400","500"] });

export const metadata = {
  title: "Truuk — Affiliate Marketing Platform",
  description: "Performance marketing platform for managing campaigns, affiliates, and payouts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrains.variable}`}>
      <body className="font-sans bg-[#080c14] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
