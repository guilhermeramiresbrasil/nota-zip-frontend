'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-blue-600 hover:underline text-sm mb-6 inline-block">&larr; Voltar ao início</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Uso</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
            <p className="text-gray-600">
              Ao acessar e utilizar o NotaZip, você concorda com estes Termos de Uso. Se você não concorda com qualquer parte destes termos, não deve utilizar nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Descrição do Serviço</h2>
            <p className="text-gray-600">
              O NotaZip é uma plataforma de gestão financeira pessoal que permite o registro, categorização e análise de despesas e receitas. O serviço inclui integração com WhatsApp para envio de notas fiscais e comprovantes, processamento por OCR e inteligência artificial, e geração de relatórios financeiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cadastro e Conta</h2>
            <p className="text-gray-600">
              Para utilizar o NotaZip, é necessário criar uma conta fornecendo informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Planos e Pagamentos</h2>
            <p className="text-gray-600">
              O NotaZip oferece planos gratuitos e pagos. Os planos pagos são cobrados conforme descrito na página de planos. O cancelamento pode ser feito a qualquer momento, sem multa ou fidelidade. Não há reembolso proporcional ao período não utilizado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Uso Aceitável</h2>
            <p className="text-gray-600">
              Você concorda em usar o NotaZip apenas para fins legais e de acordo com estes termos. É proibido: usar o serviço para atividades ilegais; tentar acessar contas de outros usuários; enviar conteúdo malicioso; sobrecarregar intencionalmente nossos servidores; revender ou redistribuir o serviço sem autorização.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Propriedade Intelectual</h2>
            <p className="text-gray-600">
              Todo o conteúdo do NotaZip, incluindo marca, design, código-fonte e documentação, é de propriedade exclusiva do NotaZip. Os dados financeiros inseridos por você permanecem de sua propriedade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitação de Responsabilidade</h2>
            <p className="text-gray-600">
              O NotaZip não se responsabiliza por decisões financeiras tomadas com base nas informações exibidas na plataforma. O serviço é fornecido &ldquo;como está&rdquo;, sem garantias de disponibilidade ininterrupta ou de precisão absoluta nos processamentos de OCR e IA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Modificações</h2>
            <p className="text-gray-600">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas por email ou notificação no aplicativo. O uso continuado após as modificações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contato</h2>
            <p className="text-gray-600">
              Para dúvidas sobre estes Termos de Uso, entre em contato pelo email: suporte@notazip.com.br
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
