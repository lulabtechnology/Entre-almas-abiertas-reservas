import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Reservar sesión con Aureya",
  description:
    "Reserva tu sesión de acompañamiento humano con Aureya en un espacio seguro y amoroso."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-space text-main font-sans">
        {children}
      </body>
    </html>
  );
}
