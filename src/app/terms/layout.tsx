import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso | Nota Zip',
  description: 'Leia os termos de uso do Nota Zip.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Termos de Uso | Nota Zip',
    description: 'Leia os termos de uso do Nota Zip.',
    url: '/terms',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
