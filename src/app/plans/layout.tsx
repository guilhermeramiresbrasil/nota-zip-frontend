import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planos e Preços | Nota Zip',
  description: 'Escolha o plano ideal para suas necessidades no Nota Zip. Planos mensais e anuais.',
  openGraph: {
    title: 'Planos e Preços',
    description: 'Escolha o plano ideal para suas necessidades no Nota Zip.',
  },
};

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
