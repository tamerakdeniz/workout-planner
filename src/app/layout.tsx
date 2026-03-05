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
  title: "Workout Planner | Egzersiz Planlayıcı - Antrenman Programı Yönetimi",
  description:
    "Workout Planner – Egzersiz Planlayıcı: Antrenman programlarını yönetin, egzersizleri takip edin. / Track gym workouts and manage training programs.",
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
