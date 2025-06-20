import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Layout/Header";
import HeaderClientWrapper from "@/components/Layout/HeaderClientWrapper";
import { SearchProvider } from "@/context/SearchContext";
import { WatchlistProvider } from "@/context/WatchlistContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fatia Invest",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SearchProvider>
          <WatchlistProvider>
            <HeaderClientWrapper />
            {children}
          </WatchlistProvider>
        </SearchProvider>
      </body>
    </html>
  );
}
