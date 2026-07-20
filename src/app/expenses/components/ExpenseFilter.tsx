import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExpenseFilterProps {
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}

type DatePreset = 'current' | 'previous' | 'next' | 'custom';

export const ExpenseFilter: React.FC<ExpenseFilterProps> = ({
  onDateRangeChange,
}) => {
  const t = useTranslations('expenses');
  const [datePreset, setDatePreset] = useState<DatePreset>('current');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getDateRange = (preset: DatePreset) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    if (preset === 'current') {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    } else if (preset === 'previous') {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    } else if (preset === 'next') {
      const start = new Date(year, month + 1, 1);
      const end = new Date(year, month + 2, 0);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    }
    return null;
  };

  useEffect(() => {
    const range = getDateRange('current');
    if (range && onDateRangeChange) {
      onDateRangeChange(range.start, range.end);
    }
  }, []);

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== 'custom' && onDateRangeChange) {
      const range = getDateRange(preset);
      if (range) {
        onDateRangeChange(range.start, range.end);
      }
    }
  };

  const handleCustomDateSearch = () => {
    if (customStartDate && customEndDate && onDateRangeChange) {
      onDateRangeChange(customStartDate, customEndDate);
    }
  };

  const getPresetLabel = (preset: DatePreset) => {
    switch (preset) {
      case 'current':
        return t('currentMonth');
      case 'previous':
        return t('previousMonth');
      case 'next':
        return t('nextMonth');
      case 'custom':
        return t('custom');
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <div className="flex-1">
        <Select
          value={datePreset}
          onValueChange={(value: DatePreset) => handlePresetChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('periodPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">{t('currentMonth')}</SelectItem>
            <SelectItem value="previous">{t('previousMonth')}</SelectItem>
            <SelectItem value="next">{t('nextMonth')}</SelectItem>
            <SelectItem value="custom">{t('custom')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {datePreset === 'custom' && (
        <>
          <div className="flex-1">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex-1">
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <Button onClick={handleCustomDateSearch}>
            {t('search')}
          </Button>
        </>
      )}

      {datePreset !== 'custom' && (
        <div className="text-sm text-gray-600">
          {getPresetLabel(datePreset)}
        </div>
      )}
    </div>
  );
};
