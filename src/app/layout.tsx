import type { Metadata } from "next";
import { Bebas_Neue, Jost } from "next/font/google";
import "./globals.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://todoelectricovicto.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Todo Eléctrico Víctor | Partes Eléctricas para Vehículos",
    template: "%s | Todo Eléctrico Víctor",
  },
  description:
    "Encuentra partes eléctricas para tu vehículo: alternadores, motores de arranque, bombas de agua, sensores y más. Envíos a toda Colombia.",
  keywords: [
    "partes eléctricas vehículos",
    "repuestos eléctricos Colombia",
    "alternador",
    "motor de arranque",
    "bomba de agua",
    "repuestos automotriz",
    "Todo Eléctrico Víctor",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: SITE_URL,
    siteName: "Todo Eléctrico Víctor",
    title: "Todo Eléctrico Víctor | Partes Eléctricas para Vehículos",
    description:
      "Encuentra partes eléctricas para tu vehículo: alternadores, motores de arranque, bombas de agua, sensores y más. Envíos a toda Colombia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Todo Eléctrico Víctor | Partes Eléctricas para Vehículos",
    description:
      "Encuentra partes eléctricas para tu vehículo. Envíos a toda Colombia.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${jost.variable} ${bebasNeue.variable}`}>
      <body className={`${jost.className} bg-shop-canvas text-dark-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
