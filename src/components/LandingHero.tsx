import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowRight } from 'lucide-react';

export const LandingHero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20 px-4">
      <div className="container mx-auto max-w-6xl text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white p-3 rounded-xl">
            <Wallet className="h-8 w-8 text-blue-600" />
          </div>
          <span className="text-3xl font-bold ml-3">Nota Zip</span>
        </div>
        <h1 className="text-5xl font-bold mb-6">Controle suas finanças</h1>
        <p className="text-xl mb-8 opacity-90">
          Sistema financeiro completo. Simples, rápido e seguro.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Começar Grátis <ArrowRight className="ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-2 border-white text-black hover:bg-white hover:text-blue-600">
              Entrar
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
