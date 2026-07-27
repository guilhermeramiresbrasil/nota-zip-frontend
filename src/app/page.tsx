'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { LandingHero } from '@/components/LandingHero';
import { LazySection } from '@/components/LazySection';

const LandingHowItWorks = dynamic(() => import('@/components/LandingHowItWorks').then((m) => ({ default: m.LandingHowItWorks })));
const LandingFeatures = dynamic(() => import('@/components/LandingFeatures').then((m) => ({ default: m.LandingFeatures })));
const LandingTestimonials = dynamic(() => import('@/components/LandingTestimonials').then((m) => ({ default: m.LandingTestimonials })));
const LandingSecurity = dynamic(() => import('@/components/LandingSecurity').then((m) => ({ default: m.LandingSecurity })));
const LandingCTA = dynamic(() => import('@/components/LandingCTA').then((m) => ({ default: m.LandingCTA })));
const LandingFAQ = dynamic(() => import('@/components/LandingFAQ').then((m) => ({ default: m.LandingFAQ })));
const LandingFooter = dynamic(() => import('@/components/LandingFooter').then((m) => ({ default: m.LandingFooter })));
const PlansPage = dynamic(() => import('./plans/page'));

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
      <LazySection>
        <LandingHowItWorks />
      </LazySection>
      <LazySection>
        <LandingFeatures />
      </LazySection>
      <LazySection>
        <LandingTestimonials />
      </LazySection>
      <LazySection>
        <LandingSecurity />
      </LazySection>
      <LazySection>
        <LandingCTA />
      </LazySection>
      <LazySection>
        <PlansPage />
      </LazySection>
      <LazySection>
        <LandingFAQ />
      </LazySection>
      <LazySection>
        <LandingFooter />
      </LazySection>
    </div>
  );
}
