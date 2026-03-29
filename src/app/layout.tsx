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

export const metadata: Metadata = {
  title: "Todo Electrico Victor",
  description: "E-commerce de partes electricas para vehiculos",
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
