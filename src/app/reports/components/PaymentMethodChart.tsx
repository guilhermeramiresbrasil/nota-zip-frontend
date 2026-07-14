'use client';

import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, COLOR_PALETTES } from '../types/report.types';
import { ChartConfigModal } from './ChartConfigModal';

interface PaymentMethodData {
  name: string;
  value: number;
  color: string;
}

interface PaymentMethodChartProps {
  data: PaymentMethodData[];
  config?: ChartConfig;
  onConfigChange?: (config: Partial<ChartConfig>) => void;
  onConfigReset?: () => void;
}

export const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ 
  data, 
  config, 
  onConfigChange,
  onConfigReset 
}) => {
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());
  const palette = COLOR_PALETTES[config?.colorPalette ?? 'default'];
  const coloredData = data.map((item, i) => ({ ...item, color: palette[i % palette.length] }));
  const chartType = config?.chartType ?? 'pie';

  const filteredData = coloredData.filter(item => !hiddenCategories.has(item.name));

  const handleCategoryClick = (categoryName: string) => {
    setHiddenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const renderChart = () => {
    if (chartType === 'bar' || chartType === 'line' || chartType === 'area') {
      const layout = config?.orientation === 'horizontal' ? 'vertical' : 'horizontal';
      return (
        <BarChart data={filteredData} layout={layout}>
          <CartesianGrid strokeDasharray="3 3" />
          {layout === 'vertical' ? (
            <>
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <XAxis type="number" />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
            </>
          )}
          {config?.showTooltip !== false && <Tooltip />}
          {config?.showLegend !== false && <Legend />}
          <Bar dataKey="value" name="Valor">
            {filteredData.map((entry, i) => (
              <Cell 
                key={`cell-${i}`} 
                fill={entry.color}
                style={{ cursor: 'pointer', opacity: hiddenCategories.has(entry.name) ? 0.3 : 1 }}
                onClick={() => handleCategoryClick(entry.name)}
              />
            ))}
          </Bar>
        </BarChart>
      );
    }

    return (
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={config?.showLabels !== false
            ? ({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
            : undefined}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {filteredData.map((entry, i) => (
            <Cell 
              key={`cell-${i}`} 
              fill={entry.color}
              style={{ cursor: 'pointer', opacity: hiddenCategories.has(entry.name) ? 0.3 : 1 }}
              onClick={() => handleCategoryClick(entry.name)}
            />
          ))}
        </Pie>
        {config?.showTooltip !== false && <Tooltip />}
        {config?.showLegend !== false && <Legend onClick={(e) => handleCategoryClick(e.dataKey)} />}
      </PieChart>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Formas de Pagamento</CardTitle>
          {onConfigChange && onConfigReset && (
            <ChartConfigModal
              config={config!}
              onConfigChange={onConfigChange}
              onReset={onConfigReset}
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Clique na legenda para ocultar/exibir
        </p>
      </CardHeader>
      <CardContent>
        {hiddenCategories.size > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {Array.from(hiddenCategories).map((cat, index) => (
              <button
                key={`${cat}-${index}`}
                onClick={() => handleCategoryClick(cat)}
                className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-full"
              >
                {cat} ×
              </button>
            ))}
          </div>
        )}
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
