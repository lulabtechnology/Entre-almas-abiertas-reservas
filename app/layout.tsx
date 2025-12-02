import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Playfair_Display, DM_Sans } from "next/font/google";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display"
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Entre Almas | Reservas de sesiones",
  description:
    "Reserva tu sesión de acompañamiento humano con Aureya, en un espacio seguro, amoroso y profundamente humano."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${display.variable} ${body.variable} font-sans bg-ea-bg text-ea-soft antialiased`}
      >
        {/* Fondo general con degradados suaves */}
        <div className="min-h-screen bg-ea-hero bg-fixed text-ea-soft">
          {/* Capa de brillo suave encima del fondo */}
          <div className="pointer-events-none fixed inset-0 bg-ea-radial opacity-70 mix-blend-screen" />

          {/* Contenido real */}
          <div className="relative z-10 flex min-h-screen flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
