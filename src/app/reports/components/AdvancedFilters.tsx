'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryCombobox } from '@/app/expenses/components/CategoryCombobox';
import { ReportFilters } from '../types/report.types';
import { Filter, X } from 'lucide-react';

interface AdvancedFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: Partial<ReportFilters>) => void;
  onReset: () => void;
  categories: string[];
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  categories,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros Avançados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs">Data Início</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={filters.startDate || ''}
              onChange={(e) => onFiltersChange({ startDate: e.target.value || null })}
            />
          </div>
          <div>
            <Label className="text-xs">Data Fim</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={filters.endDate || ''}
              onChange={(e) => onFiltersChange({ endDate: e.target.value || null })}
            />
          </div>
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select
              value={filters.types.length === 1 ? filters.types[0] : 'all'}
              onValueChange={(v) => onFiltersChange({ types: v === 'all' ? [] : [v as 'credit' | 'debit'] })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="credit">Receita</SelectItem>
                <SelectItem value="debit">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Categoria</Label>
            <CategoryCombobox
              options={[
                { value: 'all', label: 'Todas' },
                ...categories.map((cat) => ({ value: cat, label: cat })),
              ]}
              value={filters.categories.length === 1 ? filters.categories[0] : 'all'}
              onChange={(v) => onFiltersChange({ categories: v === 'all' ? [] : [v] })}
              placeholder="Todas"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div>
            <Label className="text-xs">Valor Mínimo</Label>
            <Input
              type="number"
              className="h-8 text-xs"
              placeholder="0.00"
              value={filters.minAmount ?? ''}
              onChange={(e) => onFiltersChange({ minAmount: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>
          <div>
            <Label className="text-xs">Valor Máximo</Label>
            <Input
              type="number"
              className="h-8 text-xs"
              placeholder="0.00"
              value={filters.maxAmount ?? ''}
              onChange={(e) => onFiltersChange({ maxAmount: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>
          <div>
            <Label className="text-xs">Busca</Label>
            <div className="flex gap-1">
              <Input
                className="h-8 text-xs"
                placeholder="Buscar..."
                value={filters.searchText}
                onChange={(e) => onFiltersChange({ searchText: e.target.value })}
              />
              <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
