import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Conheça a política de privacidade do Nota Zip.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Política de Privacidade',
    description: 'Conheça a política de privacidade do Nota Zip.',
    url: '/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
