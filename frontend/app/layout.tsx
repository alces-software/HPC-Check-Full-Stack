import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header"
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/alces_logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/images/alces_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}