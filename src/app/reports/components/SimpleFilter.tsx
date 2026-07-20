import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface SimpleFilterProps {
  filters: {
    startDate: string | null;
    endDate: string | null;
  };
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
}

export function SimpleFilter({ filters, onFiltersChange, onReset }: SimpleFilterProps) {
  const t = useTranslations('reports');
  const hasActiveFilters = filters.startDate || filters.endDate;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="startDate">{t('startDate')}</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => onFiltersChange({ startDate: e.target.value || null })}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="endDate">{t('endDate')}</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => onFiltersChange({ endDate: e.target.value || null })}
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={onReset}>
              <X className="h-4 w-4 mr-2" />
              {t('clear')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
