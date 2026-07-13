import * as React from "react"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> {
  value: string
  onChange: (value: string) => void
}

function CurrencyInput({ className, value, onChange, ...props }: CurrencyInputProps) {
  const formatCurrency = (digitsOnly: string): string => {
    if (digitsOnly === '') return '';

    // Converte para número e divide por 100 para considerar centavos
    const numericValue = parseInt(digitsOnly, 10) / 100;

    // Formata em reais
    return numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrency = (formattedValue: string): number => {
    // Remove formatação e converte para número
    const cleanValue = formattedValue.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Remove tudo que não é dígito
    const digitsOnly = rawValue.replace(/\D/g, '');

    // Se o usuário apagar tudo, limpa o valor
    if (digitsOnly === '') {
      onChange('');
      return;
    }

    // Formata o valor
    const formatted = formatCurrency(digitsOnly);
    onChange(formatted);
  };

  const handleBlur = () => {
    // Ao sair do campo, garante que o valor está formatado
    if (value && value !== '') {
      const digitsOnly = value.replace(/\D/g, '');
      const formatted = formatCurrency(digitsOnly);
      onChange(formatted);
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        R$
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
        placeholder="0,00"
        {...props}
      />
    </div>
  )
}

export { CurrencyInput }
