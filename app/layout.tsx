import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Tekila Nails | Rocio Mena",
  description: "Manicuría de alta gama en Maipú, Mendoza. Turnos online para Kapping, Esculpidas y más.",
  keywords: ["Nails", "Mendoza", "Manicura", "Maipú", "Kapping", "Tekila Nails"],
  authors: [{ name: "Rocío Mena" }],
  icons: {
    icon: "/icon-192x192.png", // Asegurate de que tu logo se llame así en la carpeta public
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-fuchsia-100 selection:text-fuchsia-900`}
      >
        {children}
      </body>
    </html>
  );
}