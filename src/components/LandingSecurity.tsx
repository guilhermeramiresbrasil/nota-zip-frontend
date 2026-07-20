'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Shield, Lock, EyeOff } from 'lucide-react';

export const LandingSecurity: React.FC = () => {
  const t = useTranslations('landing');

  const items = [
    { icon: Shield, label: t('securityPoint1') },
    { icon: Lock, label: t('securityPoint2') },
    { icon: EyeOff, label: t('securityPoint3') },
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{t('securityTitle')}</h2>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">{t('securityDescription')}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.label} className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
                <item.icon className="h-8 w-8" />
              </div>
              <p className="font-semibold text-gray-900">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
