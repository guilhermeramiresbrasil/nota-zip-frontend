'use client';

import { LandingHero } from '@/components/LandingHero';
import { LandingHowItWorks } from '@/components/LandingHowItWorks';
import { LandingFeatures } from '@/components/LandingFeatures';
import { LandingTestimonials } from '@/components/LandingTestimonials';
import { LandingSecurity } from '@/components/LandingSecurity';
import { LandingCTA } from '@/components/LandingCTA';
import { LandingFAQ } from '@/components/LandingFAQ';
import { LandingFooter } from '@/components/LandingFooter';
import PlansPage from './plans/page';

const jsonLd = {
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
  ],
};

export default function HomePage() {
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
