import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/settings',
        '/reports',
        '/expenses',
        '/cartoes',
        '/garantias',
        '/onboarding',
        '/payment-success',
        '/shared-group',
        '/welcome',
        '/change-password',
      ],
    },
    sitemap: 'https://notazip.com.br/sitemap.xml',
  };
}
