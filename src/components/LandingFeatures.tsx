import React from 'react';
import { useTranslations } from 'next-intl';
import { Wallet, TrendingUp, PieChart } from 'lucide-react';

export const LandingFeatures: React.FC = () => {
  const t = useTranslations('landing');
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-center mb-12">{t('featuresTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <Wallet className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('expenses')}</h3>
            <p className="text-gray-600">{t('expensesDesc')}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <TrendingUp className="h-10 w-10 text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('incomes')}</h3>
            <p className="text-gray-600">{t('incomesDesc')}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <PieChart className="h-10 w-10 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('reports')}</h3>
            <p className="text-gray-600">{t('reportsDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
