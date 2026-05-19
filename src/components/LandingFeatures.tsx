import React from 'react';
import { Wallet, TrendingUp, PieChart } from 'lucide-react';

export const LandingFeatures: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-center mb-12">Funcionalidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <Wallet className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Controle de Gastos</h3>
            <p className="text-gray-600">Registre despesas com categorias</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <TrendingUp className="h-10 w-10 text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Controle de Receitas</h3>
            <p className="text-gray-600">Visão completa do saldo</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <PieChart className="h-10 w-10 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Relatórios</h3>
            <p className="text-gray-600">Gráficos automáticos</p>
          </div>
        </div>
      </div>
    </section>
  );
};
