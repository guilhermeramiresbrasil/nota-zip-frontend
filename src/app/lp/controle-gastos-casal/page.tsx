import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nota Zip — Controle de gastos para casais',
  description:
    'Compartilhe despesas com o parceiro ou parceira. Nota Zip organiza gastos, faturas e notas fiscais do casal em um só lugar.',
  alternates: { canonical: 'https://notazip.com.br/lp/controle-gastos-casal' },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function utmHref(base: string, params: Record<string, string | string[] | undefined>) {
  const utm = new URLSearchParams();
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
    const value = params[key];
    if (typeof value === 'string') utm.set(key, value);
  });
  const qs = utm.toString();
  return qs ? `${base}?${qs}` : base;
}

export default async function ControleGastosCasalPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const registerHref = utmHref('/register', params);

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Controle de gastos para casais
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Junte as finanças do casal sem complicação. Receba mensagens dos dois no WhatsApp e veja
            tudo organizado em um só painel.
          </p>
          <Link
            href={registerHref}
            className="inline-block px-8 py-4 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700"
          >
            Começar com o parceiro
          </Link>
        </div>
      </section>

      <section className="py-16 bg-gray-50 px-4">
        <div className="container mx-auto max-w-4xl grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">Dois apontam gastos</h2>
            <p className="text-gray-600">Cada um manda áudios ou mensagens. A IA identifica quem gastou.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Plano compartilhado</h2>
            <p className="text-gray-600">Acesso e dados sincronizados para organizar o orçamento juntos.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Sem planilhas</h2>
            <p className="text-gray-600">Relatórios automáticos por mês, categoria e pessoa.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Organize a grana juntos</h2>
          <p className="text-gray-600 mb-8">
            Crie sua conta e convide o parceiro para testar o plano compartilhado.
          </p>
          <Link
            href={registerHref}
            className="inline-block px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
          >
            Criar conta grátis
          </Link>
        </div>
      </section>
    </div>
  );
}
