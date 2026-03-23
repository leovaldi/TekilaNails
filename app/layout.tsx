import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
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
        className={`${inter.variable} ${playfair.variable} antialiased selection:bg-[#FF99CC]/30 selection:text-[#FF0080]`}
      >
        {children}
      </body>
    </html>
  );
}