'use client';

import { PageHeader } from '@/components/PageHeader';
import { useTranslations } from 'next-intl';
import { CustomPricingTable } from './components/CustomPricingTable';

// Valores reais obtidos via Stripe CLI/API (BRL, mensal/anual)
const STRIPE_PLANS = [
  {
    id: 'free',
    name: 'Grátis',
    description: 'Para começar a experimentar',
    prices: [{ interval: 'month' as const, amount: 0, currency: 'BRL', formatted: 'R$ 0' }],
  },
  {
    id: 'basic',
    name: 'Básico',
    description: 'Para começar a organizar suas finanças',
    prices: [
      { interval: 'month' as const, amount: 29.9, currency: 'BRL', formatted: 'R$ 29,90' },
      { interval: 'year' as const, amount: 322.92, currency: 'BRL', formatted: 'R$ 322,92' },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Experiência completa com todas as funcionalidades',
    prices: [
      { interval: 'month' as const, amount: 49.9, currency: 'BRL', formatted: 'R$ 49,90' },
      { interval: 'year' as const, amount: 538.92, currency: 'BRL', formatted: 'R$ 538,92' },
    ],
  },
  {
    id: 'shared',
    name: 'Compartilhado',
    description: 'Plano compartilhado para casais',
    prices: [
      { interval: 'month' as const, amount: 59.9, currency: 'BRL', formatted: 'R$ 59,90' },
      { interval: 'year' as const, amount: 647.88, currency: 'BRL', formatted: 'R$ 647,88' },
    ],
  },
];

export default function PlansPage() {
  const t = useTranslations('plans');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': STRIPE_PLANS.flatMap(plan =>
      plan.prices.map(price => ({
        '@type': 'Product',
        name: plan.name,
        description: plan.description,
        image: 'https://notazip.com.br/opengraph-image?c=plans',
        brand: {
          '@type': 'Brand',
          name: 'Nota Zip',
        },
        sku: `${plan.id}-${price.interval}`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '5',
          bestRating: '5',
          reviewCount: '1',
        },
        offers: {
          '@type': 'Offer',
          name: price.interval === 'month' ? 'Mensal' : 'Anual',
          price: price.amount.toFixed(2),
          priceCurrency: price.currency,
          availability: 'https://schema.org/InStock',
          url: 'https://notazip.com.br/plans',
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: '0.00',
              currency: 'BRL',
            },
            shippingDestination: {
              '@type': 'DefinedRegion',
              addressCountry: 'BR',
            },
          },
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'BR',
            returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
          },
        },
      }))
    ),
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">{t('subscribeTitle')}</h2>
        <CustomPricingTable />
      </div>
    </div>
  );
}
