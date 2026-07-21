import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Entre na sua conta Nota Zip para gerenciar suas finanças.',
  alternates: { canonical: '/login' },
  openGraph: {
    title: 'Login',
    description: 'Entre na sua conta Nota Zip para gerenciar suas finanças.',
    url: '/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
