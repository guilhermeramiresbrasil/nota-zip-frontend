'use client';

import { useState, useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import pt from '../../messages/pt.json';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

const messagesByLocale: Record<string, typeof pt> = {
  'pt-BR': pt,
  'en-US': en,
  'es-ES': es,
};

const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es-ES'];

function resolveSupportedLocale(raw?: string | null): string {
  if (!raw) return 'pt-BR';
  const lang = raw.split('-')[0].toLowerCase();
  const match = SUPPORTED_LOCALES.find((l) => l.toLowerCase() === raw.toLowerCase() || l.toLowerCase().startsWith(lang));
  return match || 'pt-BR';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [locale, setLocale] = useState('pt-BR');
  const messages = messagesByLocale[locale] ?? pt;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('nota-zip-locale');
    if (saved) {
      setLocale(resolveSupportedLocale(saved));
    } else if (user?.language) {
      setLocale(resolveSupportedLocale(user.language));
    } else {
      setLocale(resolveSupportedLocale(navigator.language));
    }
  }, [user?.language]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="America/Sao_Paulo"
    >
      {children}
    </NextIntlClientProvider>
  );
}
