'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MessageSquare, Mic, Image, Check } from 'lucide-react';

export const LandingHowItWorks: React.FC = () => {
  const t = useTranslations('landing');

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">{t('howItWorksTitle')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* WhatsApp side */}
          <div className="rounded-2xl border border-green-100 bg-green-50 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-700 text-white p-2 rounded-full">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">WhatsApp</p>
                <p className="text-xs text-gray-500">online</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="bg-green-700 text-white rounded-l-2xl rounded-tr-2xl rounded-br-md p-3 max-w-xs text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="h-4 w-4" aria-hidden="true" />
                    <span>Foto do recibo</span>
                  </div>
                  <div className="bg-white/90 rounded h-24 w-full flex items-center justify-center">
                    <span className="text-xs text-slate-700 font-medium">JPEG</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-green-700 text-white rounded-l-2xl rounded-tr-2xl rounded-br-md p-3 max-w-xs text-sm flex items-center gap-2">
                  <Mic className="h-4 w-4" aria-hidden="true" />
                  <div className="flex items-end gap-1 h-4">
                    <motion.div
                      className="w-1 bg-white rounded"
                      animate={{ height: [4, 12, 6, 16, 8] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    />
                    <motion.div
                      className="w-1 bg-white rounded"
                      animate={{ height: [8, 5, 14, 6, 10] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: 0.1 }}
                    />
                    <motion.div
                      className="w-1 bg-white rounded"
                      animate={{ height: [6, 14, 5, 12, 7] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-1 bg-white rounded"
                      animate={{ height: [10, 6, 16, 5, 12] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}
                    />
                  </div>
                  <span>0:04</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <p className="font-semibold text-gray-900">Nota Zip</p>
              <span className="text-xs text-green-800 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                <Check className="h-3 w-3" aria-hidden="true" /> processado
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500">Categoria</p>
                  <p className="text-lg font-bold text-gray-900">Alimentação</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="text-lg font-bold text-gray-900">R$ 15,00</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Despesas do mês</p>
                <div className="flex items-end gap-2 h-32">
                  <motion.div
                    className="bg-blue-200 rounded-t w-full"
                    initial={{ height: 0 }}
                    whileInView={{ height: '40%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                  <motion.div
                    className="bg-green-500 rounded-t w-full"
                    initial={{ height: 0 }}
                    whileInView={{ height: '25%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
                  <motion.div
                    className="bg-purple-300 rounded-t w-full"
                    initial={{ height: 0 }}
                    whileInView={{ height: '55%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />
                  <motion.div
                    className="bg-orange-300 rounded-t w-full"
                    initial={{ height: 0 }}
                    whileInView={{ height: '35%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
            <p className="text-gray-700">{t('howItWorksStep1')}</p>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-600 mb-2">2</div>
            <p className="text-gray-700">{t('howItWorksStep2')}</p>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
            <p className="text-gray-700">{t('howItWorksStep3')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
