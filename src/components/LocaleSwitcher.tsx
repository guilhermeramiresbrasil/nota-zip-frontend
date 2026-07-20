'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';

const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es-ES'] as const;

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations('locale');

  const handleChange = (value: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('nota-zip-locale', value);
    window.location.reload();
  };

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Globe className="h-4 w-4 text-slate-500" />
      <label htmlFor="locale-switcher" className="sr-only">
        {t('language')}
      </label>
      <select
        id="locale-switcher"
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className="text-sm bg-transparent border-none text-slate-600 hover:text-slate-900 focus:ring-0 cursor-pointer"
      >
        {SUPPORTED_LOCALES.map((l) => (
          <option key={l} value={l}>
            {t(l as any)}
          </option>
        ))}
      </select>
    </div>
  );
}
