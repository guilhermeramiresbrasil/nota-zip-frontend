'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { LandingHero } from '@/components/LandingHero';
import { LandingHowItWorks } from '@/components/LandingHowItWorks';
import { LandingFeatures } from '@/components/LandingFeatures';
import { LandingTestimonials } from '@/components/LandingTestimonials';
import { LandingSecurity } from '@/components/LandingSecurity';
import { LandingCTA } from '@/components/LandingCTA';
import { LandingFAQ } from '@/components/LandingFAQ';
import { LandingFooter } from '@/components/LandingFooter';
import PlansPage from './plans/page';

function useHomeJsonLd() {
  const t = useTranslations('landing');

  return useMemo(() => {
    const faqs = [
      { q: t('faq1_q'), a: t('faq1_a') },
      { q: t('faq2_q'), a: t('faq2_a') },
      { q: t('faq3_q'), a: t('faq3_a') },
      { q: t('faq4_q'), a: t('faq4_a') },
      { q: t('faq5_q'), a: t('faq5_a') },
      { q: t('faq6_q'), a: t('faq6_a') },
    ];

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'Nota Zip',
          url: 'https://notazip.com.br/',
          description:
            'Transforme mensagens e áudios de WhatsApp em organização financeira automática.',
        },
        {
          '@type': 'Organization',
          name: 'Nota Zip',
          url: 'https://notazip.com.br/',
        },
        {
          '@type': 'SoftwareApplication',
          name: 'Nota Zip',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          description:
            'Aplicação de finanças pessoais que lê, categoriza e organiza gastos a partir de mensagens e áudios do WhatsApp.',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'BRL',
          },
        },
        {
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.a,
            },
          })),
        },
      ],
    };
  }, [t]);
}

export default function HomePage() {
  const jsonLd = useHomeJsonLd();

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingHero />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingTestimonials />
      <LandingSecurity />
      <LandingCTA />
      <PlansPage />
      <LandingFAQ />
      <LandingFooter />
    </div>
  );
}
