import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ViewModeProvider } from "@/contexts/ViewModeContext";
import { TemporaryPasswordGuard } from "@/components/TemporaryPasswordGuard";
import { I18nProvider } from "@/components/I18nProvider";

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
  metadataBase: new URL('https://notazip.com.br'),
  title: {
    default: 'Nota Zip - Sistema Financeiro Inteligente',
    template: '%s | Nota Zip',
  },
  description: 'Gerencie suas finanças de forma simples e inteligente com o Nota Zip. Controle gastos, receitas e envie notas fiscais pelo WhatsApp.',
  keywords: ['finanças pessoais', 'controle de gastos', 'nota fiscal', 'whatsapp', 'Nota Zip'],
  authors: [{ name: 'Nota Zip' }],
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Nota Zip - Sistema Financeiro Inteligente',
    description: 'Gerencie suas finanças de forma simples e inteligente com o Nota Zip.',
    url: '/',
    siteName: 'Nota Zip',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Nota Zip - Sistema Financeiro Inteligente',
    description: 'Gerencie suas finanças de forma simples e inteligente com o Nota Zip.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const revalidate = 60;

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
          <I18nProvider>
            <ViewModeProvider>
              <TemporaryPasswordGuard>
                <Navigation />
                <main className="flex-1">
                  {children}
                </main>
                <Toaster />
              </TemporaryPasswordGuard>
            </ViewModeProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
