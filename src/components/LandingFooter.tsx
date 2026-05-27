import React from 'react';
import Link from 'next/link';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">NotaZip</h3>
            <p className="text-sm">
              Gerencie suas finanças de forma simples e inteligente, direto pelo WhatsApp.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white">Login</Link></li>
              <li><Link href="/register" className="hover:text-white">Criar Conta</Link></li>
              <li><Link href="/plans" className="hover:text-white">Planos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-white">Termos de Uso</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} NotaZip. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
