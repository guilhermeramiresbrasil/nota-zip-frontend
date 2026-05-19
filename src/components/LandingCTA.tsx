import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const LandingCTA: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-white text-center">
      <h2 className="text-4xl font-bold mb-6">Pronto para começar?</h2>
      <Link href="/register">
        <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          Criar Conta Grátis
        </Button>
      </Link>
    </section>
  );
};
