import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planos e Preços',
  description: 'Escolha o plano ideal para suas necessidades no Nota Zip. Planos mensais e anuais.',
  alternates: { canonical: '/plans' },
  openGraph: {
    title: 'Planos e Preços',
    description: 'Escolha o plano ideal para suas necessidades no Nota Zip.',
    url: '/plans',
  },
};

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
