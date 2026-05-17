import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Carta — Verificación constitucional",
  description:
    "Verifica afirmaciones políticas con evidencia constitucional. Análisis fundamentado en la Constitución Política de Colombia de 1991.",
  keywords: [
    "verificación",
    "constitución",
    "Colombia",
    "desinformación",
    "fact-check",
    "política",
  ],
  openGraph: {
    title: "Carta — Verificación constitucional",
    description:
      "Analiza afirmaciones políticas con evidencia constitucional y razonamiento transparente.",
    type: "website",
    locale: "es_CO",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F4EE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
