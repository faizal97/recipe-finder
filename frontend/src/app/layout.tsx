import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Navigation from "@/components/Navigation";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecipeFinder",
  description: "Discover and share amazing recipes",
  manifest: "/manifest.json",
  themeColor: "#ea580c",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RecipeFinder",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "RecipeFinder",
    title: "RecipeFinder - Find Perfect Recipes",
    description: "Discover and share amazing recipes",
  },
  twitter: {
    card: "summary",
    title: "RecipeFinder - Find Perfect Recipes",
    description: "Discover and share amazing recipes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ea580c" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RecipeFinder" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">RF</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-gray-900">RecipeFinder</span>
                </Link>
              </div>

              {/* Desktop Navigation and Search */}
              <div className="hidden md:flex items-center space-x-8">
                <Navigation />
                <SearchBar />
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden">
                <Navigation />
              </div>
            </div>

            {/* Mobile Search Bar - Below header on mobile */}
            <div className="md:hidden pb-4">
              <SearchBar />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-screen">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center">
              <p className="text-gray-600 text-sm text-center">© 2023 RecipeFinder, Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
