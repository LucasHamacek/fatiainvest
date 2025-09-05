import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import HeaderClientWrapper from "@/components/Layout/HeaderClientWrapper";
import { SearchProvider } from "@/context/SearchContext";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { ThemeProvider } from "@/components/theme-provider";
import { StocksProvider } from "@/context/StocksContext";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <StocksProvider>
              <SearchProvider>
                <WatchlistProvider>
                  <HeaderClientWrapper />
                  {children}
                </WatchlistProvider>
              </SearchProvider>
            </StocksProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
