'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Empreendedora',
    content: 'O NotaZip transformou como gerencio minhas finanças. Agora envio notas pelo WhatsApp e tudo é organizado automaticamente!',
    initials: 'MS',
  },
  {
    name: 'Carlos Oliveira',
    role: 'Freelancer',
    content: 'Finalmente consigo ver meus gastos por categoria. Os relatórios são incríveis e me ajudam a economizar todos os meses.',
    initials: 'CO',
  },
  {
    name: 'Ana Costa',
    role: 'Estudante',
    content: 'Simples e intuitivo. O plano gratuito já me atende perfeitamente para controlar meus gastos do dia a dia.',
    initials: 'AC',
  },
];

export const LandingTestimonials: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">O que nossos usuários dizem</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Milhares de pessoas já usam o NotaZip para organizar suas finanças
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <Card key={t.name} className="shadow-md">
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4 italic">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
