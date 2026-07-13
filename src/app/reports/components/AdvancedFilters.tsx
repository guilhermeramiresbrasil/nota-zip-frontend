'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ReportFilters } from '../types/report.types';
import { Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(true);
  const [categorySearch, setCategorySearch] = useState('');

  const activeFiltersCount = [
    filters.startDate,
    filters.endDate,
    filters.types.length > 0,
    filters.categories.length > 0,
    filters.minAmount !== null,
    filters.maxAmount !== null,
    filters.searchText,
  ].filter(Boolean).length;

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ categories: newCategories });
  };

  const toggleType = (type: 'credit' | 'debit') => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    onFiltersChange({ types: newTypes });
  };

  const clearCategorySearch = () => {
    setCategorySearch('');
  };

  return (
    <Card>
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }}
                className="h-6 px-2 text-xs"
              >
                Limpar
              </Button>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Data Início</Label>
              <Input
                type="date"
                className="h-9 text-sm mt-1"
                value={filters.startDate || ''}
                onChange={(e) => onFiltersChange({ startDate: e.target.value || null })}
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Data Fim</Label>
              <Input
                type="date"
                className="h-9 text-sm mt-1"
                value={filters.endDate || ''}
                onChange={(e) => onFiltersChange({ endDate: e.target.value || null })}
              />
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Tipo de Transação</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="credit"
                  checked={filters.types.includes('credit')}
                  onCheckedChange={() => toggleType('credit')}
                />
                <label
                  htmlFor="credit"
                  className="text-sm cursor-pointer select-none"
                >
                  Receita
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="debit"
                  checked={filters.types.includes('debit')}
                  onCheckedChange={() => toggleType('debit')}
                />
                <label
                  htmlFor="debit"
                  className="text-sm cursor-pointer select-none"
                >
                  Despesa
                </label>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Categorias</Label>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorias..."
                className="h-9 text-sm pl-8"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
              {categorySearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCategorySearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {filteredCategories.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Nenhuma categoria encontrada
                </p>
              ) : (
                filteredCategories.map((cat) => (
                  <div key={cat} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${cat}`}
                      checked={filters.categories.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                    <label
                      htmlFor={`cat-${cat}`}
                      className="text-sm cursor-pointer select-none flex-1"
                    >
                      {cat}
                    </label>
                  </div>
                ))
              )}
            </div>
            {filters.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.categories.map((cat) => (
                  <div
                    key={cat}
                    className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full text-xs cursor-pointer transition-colors"
                    onClick={() => toggleCategory(cat)}
                  >
                    <span>{cat}</span>
                    <X className="h-3 w-3" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Valor Mínimo</Label>
              <Input
                type="number"
                className="h-9 text-sm mt-1"
                placeholder="0.00"
                value={filters.minAmount ?? ''}
                onChange={(e) => onFiltersChange({ minAmount: e.target.value ? parseFloat(e.target.value) : null })}
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Valor Máximo</Label>
              <Input
                type="number"
                className="h-9 text-sm mt-1"
                placeholder="0.00"
                value={filters.maxAmount ?? ''}
                onChange={(e) => onFiltersChange({ maxAmount: e.target.value ? parseFloat(e.target.value) : null })}
              />
            </div>
          </div>

          {/* Search Text */}
          <div>
            <Label className="text-xs font-medium">Buscar na Descrição</Label>
            <div className="flex gap-2 mt-1">
              <Input
                className="h-9 text-sm"
                placeholder="Digite para buscar..."
                value={filters.searchText}
                onChange={(e) => onFiltersChange({ searchText: e.target.value })}
              />
              {filters.searchText && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ searchText: '' })}
                  className="h-9 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
