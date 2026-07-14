import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportPeriod } from '../types/report.types';

interface PeriodSelectorProps {
  selectedPeriod: ReportPeriod['value'];
  onPeriodChange: (period: ReportPeriod['value']) => void;
}

const periods: ReportPeriod[] = [
  { value: 'current', label: 'Este Mês' },
  { value: 'last', label: 'Último Mês' },
  { value: 'quarter', label: 'Este Trimestre' },
  { value: 'year', label: 'Este Ano' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  return (
    <Select value={selectedPeriod} onValueChange={onPeriodChange}>
      <SelectTrigger className="w-[200px] no-print">
        <SelectValue placeholder="Selecione o período" />
      </SelectTrigger>
      <SelectContent className="no-print">
        {periods.map((period) => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
