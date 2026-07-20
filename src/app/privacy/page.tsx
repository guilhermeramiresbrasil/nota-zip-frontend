'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function PrivacyPage() {
  const t = useTranslations('privacy');
  const locale = useLocale();
  const today = new Date().toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-blue-600 hover:underline text-sm mb-6 inline-block">&larr; {t('backHome')}</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>
        <p className="text-sm text-gray-500 mb-8">{t('lastUpdated', { date: today })}</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('s1_title')}</h2>
            <p className="text-gray-600">
              {t('s1_text')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('s2_title')}</h2>
            <p className="text-gray-600 mb-2">{t('s2_intro')}</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>{t('s2_item1')}</li>
              <li>{t('s2_item2')}</li>
              <li>{t('s2_item3')}</li>
              <li>{t('s2_item4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('s3_title')}</h2>
            <p className="text-gray-600 mb-2">{t('s3_intro')}</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>{t('s3_item1')}</li>
              <li>{t('s3_item2')}</li>
              <li>{t('s3_item3')}</li>
              <li>{t('s3_item4')}</li>
              <li>{t('s3_item5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('s4_title')}</h2>
            <p className="text-gray-600">
              {t('s4_text')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('s5_title')}</h2>
            <p className="text-gray-600">
              {t('s5_text')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('s6_title')}</h2>
            <p className="text-gray-600">
              {t('s6_text')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('s7_title')}</h2>
            <p className="text-gray-600 mb-2">{t('s7_intro')}</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>{t('s7_item1')}</li>
              <li>{t('s7_item2')}</li>
              <li>{t('s7_item3')}</li>
              <li>{t('s7_item4')}</li>
              <li>{t('s7_item5')}</li>
              <li>{t('s7_item6')}</li>
            </ul>
            <p className="text-gray-600 mt-2">
              {t('s7_contact')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('s8_title')}</h2>
            <p className="text-gray-600">
              {t('s8_text')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('s9_title')}</h2>
            <p className="text-gray-600">
              {t('s9_text')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('s10_title')}</h2>
            <p className="text-gray-600">
              {t('s10_text')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
