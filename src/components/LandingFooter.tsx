import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const LandingFooter: React.FC = () => {
  const t = useTranslations('landing');
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">NotaZip</h3>
            <p className="text-sm">
              {t('footerDescription')}
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">{t('footerLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white">{t('footerLogin')}</Link></li>
              <li><Link href="/register" className="hover:text-white">{t('footerRegister')}</Link></li>
              <li><Link href="/plans" className="hover:text-white">{t('footerPlans')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">{t('footerLegal')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-white">{t('footerTerms')}</Link></li>
              <li><Link href="/privacy" className="hover:text-white">{t('footerPrivacy')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {currentYear} NotaZip. {t('allRights')}</p>
        </div>
      </div>
    </footer>
  );
};
