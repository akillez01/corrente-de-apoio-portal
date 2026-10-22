import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-fraunces",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://daimesolidariedade.org"),
  title: {
    default: "Daime Solidariedade | Rede de cuidado e colaboração",
    template: "%s | Daime Solidariedade",
  },
  description:
    "Uma rede para conectar pessoas, capacidades, recursos, projetos e oportunidades em solidariedade com as comunidades.",
  alternates: { canonical: "/pt" },
  icons: {
    icon: [
      {
        url: "https://optim.tildacdn.one/tild3166-6538-4637-b234-343136396538/-/cover/64x64/center/center/-/format/png/BLOCO_1_-_LOGOTIPO.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "https://optim.tildacdn.one/tild3166-6538-4637-b234-343136396538/-/cover/180x180/center/center/-/format/png/BLOCO_1_-_LOGOTIPO.png",
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: "https://optim.tildacdn.one/tild3166-6538-4637-b234-343136396538/-/cover/64x64/center/center/-/format/png/BLOCO_1_-_LOGOTIPO.png",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} bg-bg text-ink font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
