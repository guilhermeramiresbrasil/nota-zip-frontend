import React from 'react';
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportPeriod } from '../types/report.types';

interface PeriodSelectorProps {
  selectedPeriod: ReportPeriod['value'];
  onPeriodChange: (period: ReportPeriod['value']) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  const t = useTranslations('reports');
  const periods: ReportPeriod[] = [
    { value: 'current', label: t('currentMonth') },
    { value: 'last', label: t('lastMonth') },
    { value: 'quarter', label: t('thisQuarter') },
    { value: 'year', label: t('thisYear') },
  ];

  return (

    <Select value={selectedPeriod} onValueChange={onPeriodChange as (value: string) => void}>
      <SelectTrigger className="w-[200px] no-print">
        <SelectValue placeholder={t('periodPlaceholder')} />
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
