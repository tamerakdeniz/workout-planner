import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { LanguageProvider } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Antrenman Programı | Gym Schedule",
  description:
    "Kişisel 5 günlük antrenman takip uygulaması / Personal 5-day workout tracking app",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/img/logo.ico", sizes: "48x48", type: "image/x-icon" },
    ],
    apple: "/img/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-bg-primary min-h-screen`}
      >
        <LanguageProvider>
          <Header />
          <main>{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
