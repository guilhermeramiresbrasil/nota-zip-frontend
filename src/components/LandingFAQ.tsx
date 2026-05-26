'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'O NotaZip é gratuito?',
    a: 'Sim! O plano gratuito permite até 12 mensagens diárias pelo WhatsApp. Para mais recursos, temos planos acessíveis.',
  },
  {
    q: 'Como funciona o envio de notas pelo WhatsApp?',
    a: 'Após conectar seu WhatsApp nas configurações, basta enviar uma foto da nota ou descrever o gasto por mensagem. Nossa IA extrai automaticamente os dados.',
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Sim. Utilizamos criptografia em todas as comunicações e seguimos as normas da LGPD para proteção de dados pessoais.',
  },
  {
    q: 'Posso exportar meus relatórios?',
    a: 'Sim! Você pode exportar relatórios em CSV, PDF e imagem diretamente da página de relatórios.',
  },
  {
    q: 'Como faço upgrade do meu plano?',
    a: 'Acesse a página de planos no app e escolha o plano que melhor atende suas necessidades. A mudança é instantânea.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim, você pode cancelar ou fazer downgrade do seu plano a qualquer momento, sem multa ou fidelidade.',
  },
];

export const LandingFAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
          <p className="text-gray-600">Tire suas dúvidas sobre o NotaZip</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-4 pb-4 text-gray-600 text-sm">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
