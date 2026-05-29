'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-blue-600 hover:underline text-sm mb-6 inline-block">&larr; Voltar ao início</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introdução</h2>
            <p className="text-gray-600">
              Esta Política de Privacidade descreve como o NotaZip coleta, utiliza, armazena e protege seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Dados Coletados</h2>
            <p className="text-gray-600 mb-2">Coletamos os seguintes dados:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li><strong>Dados de cadastro:</strong> nome, email, senha (armazenada com hash criptográfico)</li>
              <li><strong>Dados financeiros:</strong> transações, categorias, valores, datas, notas fiscais enviadas</li>
              <li><strong>Dados de uso:</strong> logs de acesso, preferências de configuração</li>
              <li><strong>Dados de comunicação:</strong> mensagens enviadas via WhatsApp para processamento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Finalidade do Tratamento</h2>
            <p className="text-gray-600 mb-2">Seus dados são utilizados para:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Prestação do serviço de gestão financeira</li>
              <li>Processamento de notas fiscais via OCR e IA</li>
              <li>Geração de relatórios e análises financeiras</li>
              <li>Comunicações sobre o serviço e atualizações</li>
              <li>Melhoria contínua da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Base Legal (LGPD)</h2>
            <p className="text-gray-600">
              O tratamento de dados pessoais é realizado com base no consentimento do titular (Art. 7º, I da LGPD) e na execução de contrato (Art. 7º, V da LGPD). Ao criar uma conta, você consente com o tratamento de dados conforme descrito nesta política.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Compartilhamento de Dados</h2>
            <p className="text-gray-600">
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing. Seus dados podem ser compartilhados apenas com: provedores de infraestrutura (hospedagem, banco de dados) sob contratos de confidencialidade; autoridades legais quando exigido por lei ou ordem judicial.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Armazenamento e Segurança</h2>
            <p className="text-gray-600">
              Seus dados são armazenados em servidores seguros com criptografia em trânsito (TLS/SSL). Senhas são armazenadas com hash bcrypt. Implementamos controles de acesso rigorosos e monitoramento contínuo. Os dados são retidos enquanto sua conta estiver ativa ou conforme necessário para cumprir obrigações legais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Direitos do Titular (LGPD)</h2>
            <p className="text-gray-600 mb-2">Conforme a LGPD, você tem direito a:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li><strong>Acesso:</strong> solicitar uma cópia dos seus dados pessoais</li>
              <li><strong>Correção:</strong> solicitar a correção de dados incompletos ou incorretos</li>
              <li><strong>Exclusão:</strong> solicitar a exclusão dos seus dados pessoais</li>
              <li><strong>Portabilidade:</strong> solicitar a transferência dos seus dados para outro serviço</li>
              <li><strong>Revogação:</strong> revogar o consentimento para tratamento de dados</li>
              <li><strong>Informação:</strong> ser informado sobre o compartilhamento de dados</li>
            </ul>
            <p className="text-gray-600 mt-2">
              Para exercer esses direitos, entre em contato pelo email: privacidade@notazip.com.br
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p className="text-gray-600">
              Utilizamos cookies e tecnologias similares para manter sua sessão ativa, armazenar preferências de configuração e melhorar a experiência do usuário. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Alterações</h2>
            <p className="text-gray-600">
              Esta política pode ser atualizada periodicamente. Alterações significativas serão comunicadas por email ou notificação no aplicativo. Recomendamos revisar esta política regularmente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contato do Encarregado (DPO)</h2>
            <p className="text-gray-600">
              Para questões relacionadas à proteção de dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados pelo email: dpo@notazip.com.br
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
