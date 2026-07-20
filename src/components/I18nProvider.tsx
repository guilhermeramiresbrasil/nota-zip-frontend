'use client';

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

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const locale = user?.language || 'pt-BR';
  const messages = messagesByLocale[locale] ?? pt;

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
