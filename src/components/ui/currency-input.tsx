'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

type CurrencyCode = 'BRL' | 'USD' | 'EUR'

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> {
  value: string
  onChange: (value: string) => void
  currency?: CurrencyCode
}

const currencyConfig: Record<CurrencyCode, { locale: string; symbol: string; placeholder: string }> = {
  BRL: { locale: 'pt-BR', symbol: 'R$', placeholder: '0,00' },
  USD: { locale: 'en-US', symbol: '$', placeholder: '0.00' },
  EUR: { locale: 'pt-BR', symbol: '€', placeholder: '0,00' },
};

function CurrencyInput({ className, value, onChange, currency: currencyProp, ...props }: CurrencyInputProps) {
  const { user } = useAuth();
  const currency: CurrencyCode = currencyProp || user?.currency || 'BRL';
  const config = currencyConfig[currency];

  const formatCurrency = (rawValue: string): string => {
    const digitsOnly = rawValue.replace(/\D/g, '');
    if (digitsOnly === '') return '';
    const numericValue = parseInt(digitsOnly, 10) / 100;
    return numericValue.toLocaleString(config.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrency = (formattedValue: string): number => {
    if (currency === 'USD') {
      return parseFloat(formattedValue.replace(/,/g, '')) || 0;
    }
    return parseFloat(formattedValue.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === '') {
      onChange('');
      return;
    }
    const formatted = formatCurrency(rawValue);
    onChange(formatted);
  };

  const handleBlur = () => {
    if (value && value !== '') {
      const formatted = formatCurrency(value.replace(/\D/g, ''));
      onChange(formatted);
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        {config.symbol}
      </span>
      <input
        type="text"
        inputMode="decimal"
        className={cn(
          "h-9 w-full min-w-0 rounded-md border border-input bg-transparent pl-8 pr-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          className
        )}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={config.placeholder}
        {...props}
      />
    </div>
  )
}

export { CurrencyInput }
export type { CurrencyInputProps, CurrencyCode }
