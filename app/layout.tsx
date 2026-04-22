import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Digistore Forge",
  description:
    "Gere sales pages HTML single-file prontas para aprovação na Digistore24 GmbH.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen bg-background`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
