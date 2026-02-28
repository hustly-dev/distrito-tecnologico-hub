import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Distrito Tecnologico - Hub Inteligente de Editais",
  description: "Frontend para centralizacao de editais de fomento com dados mockados."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
