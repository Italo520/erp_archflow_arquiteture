import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata = {
  title: "ArchFlow - Gestão de Projetos de Arquitetura",
  description: "Sistema de gestão de projetos de arquitetura",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional"
        />
      </head>
      <body className="antialiased font-display">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
