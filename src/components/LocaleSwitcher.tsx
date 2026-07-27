'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es-ES'] as const;

const ACRONYMS: Record<string, string> = {
  'pt-BR': 'PT',
  'en-US': 'EN',
  'es-ES': 'ES',
};

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations('locale');
  const [open, setOpen] = useState(false);

  const handleChange = (value: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('nota-zip-locale', value);
    window.location.reload();
  };

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Globe className="h-4 w-4 text-slate-500" aria-hidden="true" />
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-sm font-medium text-slate-600 hover:text-slate-900 bg-transparent hover:bg-transparent"
            aria-label={t('language')}
          >
            {ACRONYMS[locale] || locale}
            <ChevronDown className="ml-1 h-3 w-3 opacity-60" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px]">
          {SUPPORTED_LOCALES.map((l) => (
            <DropdownMenuItem
              key={l}
              onClick={() => handleChange(l)}
              className="flex items-center justify-between"
            >
              {t(l as any)}
              {l === locale && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
