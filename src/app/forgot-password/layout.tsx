import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recuperar Senha | Nota Zip',
  description: 'Recupere o acesso à sua conta Nota Zip.',
  alternates: { canonical: '/forgot-password' },
  openGraph: {
    title: 'Recuperar Senha | Nota Zip',
    description: 'Recupere o acesso à sua conta Nota Zip.',
    url: '/forgot-password',
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
