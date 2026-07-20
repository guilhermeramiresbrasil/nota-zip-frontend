'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const LandingTestimonials: React.FC = () => {
  const t = useTranslations('landing');

  const testimonials = [
  {
    name: t('testimonial1_name'),
    role: t('testimonial1_role'),
    content: t('testimonial1_content'),
    initials: 'MS',
  },
  {
    name: t('testimonial2_name'),
    role: t('testimonial2_role'),
    content: t('testimonial2_content'),
    initials: 'CO',
  },
  {
    name: t('testimonial3_name'),
    role: t('testimonial3_role'),
    content: t('testimonial3_content'),
    initials: 'AC',
  },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('testimonialsTitle')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('testimonialsSubtitle')}
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
