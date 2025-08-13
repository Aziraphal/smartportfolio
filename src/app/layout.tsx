import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartPortfolio - Portfolio Automatique pour Créatifs",
  description: "Créez un portfolio qui se met à jour automatiquement avec vos projets Behance, GitHub et Dribbble",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning={true}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
