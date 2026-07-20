import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Criar Conta | Nota Zip',
  description: 'Cadastre-se no Nota Zip e comece a organizar suas finanças hoje mesmo.',
  alternates: { canonical: '/register' },
  openGraph: {
    title: 'Criar Conta | Nota Zip',
    description: 'Cadastre-se no Nota Zip e comece a organizar suas finanças hoje mesmo.',
    url: '/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
