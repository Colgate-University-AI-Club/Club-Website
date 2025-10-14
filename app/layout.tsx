import type { Metadata, Viewport } from "next";
import { Merriweather, Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/site/NavBar";
import Footer from "@/components/site/Footer";

// Classic serif for headings
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-heading",
  display: "swap",
});

// Clean sans for body text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#7B2142",
};

export const metadata: Metadata = {
  title: "Colgate AI Club",
  description: "Exploring artificial intelligence and machine learning at Colgate University",
  openGraph: {
    title: "Colgate AI Club",
    description: "Exploring artificial intelligence and machine learning at Colgate University",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${merriweather.variable} ${inter.variable} font-body antialiased min-h-screen flex flex-col`}
      >
        <NavBar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        {/* TODO: Add Plausible Analytics script with domain */}
        {/* <script defer data-domain="YOUR_DOMAIN" src="https://plausible.io/js/script.js"></script> */}
      </body>
    </html>
  );
}
