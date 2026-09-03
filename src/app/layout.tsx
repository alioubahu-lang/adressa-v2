import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ADRESSA — Chaque lieu a une identité.",
    template: "%s | ADRESSA"
  },
  description:
    "ADRESSA est une infrastructure numérique d'adressage pour les bâtiments en Afrique. Identifiant unique, GPS précis, QR dynamique et adresse numérique vérifiable.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ADRESSA"
  },
  openGraph: {
    title: "ADRESSA — Chaque lieu a une identité.",
    description: "Infrastructure numérique d'adressage pour les bâtiments en Afrique.",
    type: "website"
  }
};

export const viewport = {
  themeColor: "#0F2E23"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-adressa-gray text-adressa-ink antialiased">{children}</body>
    </html>
  );
}
