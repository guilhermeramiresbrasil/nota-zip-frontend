'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

export const LandingFAQ: React.FC = () => {
  const t = useTranslations('landing');
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
  {
    q: t('faq1_q'),
    a: t('faq1_a'),
  },
  {
    q: t('faq2_q'),
    a: t('faq2_a'),
  },
  {
    q: t('faq3_q'),
    a: t('faq3_a'),
  },
  {
    q: t('faq4_q'),
    a: t('faq4_a'),
  },
  {
    q: t('faq5_q'),
    a: t('faq5_a'),
  },
  {
    q: t('faq6_q'),
    a: t('faq6_a'),
  },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('faqTitle')}</h2>
          <p className="text-gray-600">{t('faqSubtitle')}</p>
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
