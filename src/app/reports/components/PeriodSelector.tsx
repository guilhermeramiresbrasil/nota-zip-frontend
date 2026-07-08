import React from 'react';
import { Combobox } from '@/components/ui/combobox';
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
    <div className="w-[200px]">
      <Combobox
        searchable={false}
        placeholder="Selecione o período"
        options={periods}
        value={selectedPeriod}
        onChange={onPeriodChange}
      />
    </div>
  );
};
