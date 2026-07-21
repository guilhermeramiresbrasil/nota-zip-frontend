import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nota Zip — Controle de gastos pelo WhatsApp',
  description:
    'Receba áudios e mensagens de gastos no WhatsApp e deixe a IA do Nota Zip organizar suas finanças pessoais automaticamente.',
  alternates: { canonical: 'https://notazip.com.br/lp/financas-whatsapp' },
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

export default async function FinancasWhatsAppPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const registerHref = utmHref('/register', params);

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Controle de gastos pelo WhatsApp
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Mande áudios e mensagens dos seus gastos no WhatsApp. A IA lê, categoriza e organiza
            automaticamente — sem planilhas.
          </p>
          <Link
            href={registerHref}
            className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Experimente grátis
          </Link>
        </div>
      </section>

      <section className="py-16 bg-gray-50 px-4">
        <div className="container mx-auto max-w-4xl grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">Áudio vira gasto</h2>
            <p className="text-gray-600">Fale o que comprou. A IA entende valor, local e categoria.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Notas fiscais</h2>
            <p className="text-gray-600">Encaminhe comprovantes e mensagens. Tudo registrado em um só lugar.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Relatórios automáticos</h2>
            <p className="text-gray-600">Veja para onde vai o dinheiro sem esforço manual.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Comece hoje</h2>
          <p className="text-gray-600 mb-8">
            Crie sua conta e organize suas finanças pessoais em minutos.
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
