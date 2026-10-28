import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Andrea Nutrition | Nutricionista deportiva online",
  description: "Nutrición deportiva online con planes 100% personalizados, seguimiento semanal y sin alimentos prohibidos. Reserva tu primera consulta gratuita.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
