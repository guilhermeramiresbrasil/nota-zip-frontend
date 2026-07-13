import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ViewModeProvider } from "@/contexts/ViewModeContext";
import { TemporaryPasswordGuard } from "@/components/TemporaryPasswordGuard";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nota Zip - Sistema Financeiro Inteligente",
  description: "Gerencie suas finanças de forma simples e inteligente com o Nota Zip",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <AuthProvider>
          <ViewModeProvider>
            <TemporaryPasswordGuard>
              <Navigation />
              <main className="flex-1">
                {children}
              </main>
              <Toaster />
            </TemporaryPasswordGuard>
          </ViewModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
