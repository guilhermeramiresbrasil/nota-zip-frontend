'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyData, ChartConfig, COLOR_PALETTES } from '../types/report.types';
import { ChartConfigModal } from './ChartConfigModal';

interface MonthlyChartProps {
  data: MonthlyData[];
  config?: ChartConfig;
  onConfigChange?: (config: Partial<ChartConfig>) => void;
  onConfigReset?: () => void;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ 
  data, 
  config, 
  onConfigChange,
  onConfigReset 
}) => {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const palette = COLOR_PALETTES[config?.colorPalette ?? 'default'];
  const incomeColor = palette[1] || '#22c55e';
  const expenseColor = palette[0] || '#ef4444';
  const chartType = config?.chartType ?? 'bar';

  const handleSeriesClick = (seriesName: string) => {
    setHiddenSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesName)) {
        newSet.delete(seriesName);
      } else {
        newSet.add(seriesName);
      }
      return newSet;
    });
  };

  const commonProps = {
    data,
  };

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis />
          {config?.showTooltip !== false && <Tooltip />}
          {config?.showLegend !== false && <Legend />}
          {!hiddenSeries.has('receitas') && (
            <Line 
              type="monotone" 
              dataKey="receitas" 
              stroke={incomeColor} 
              name="Receitas" 
              strokeWidth={2}
              dot={{ fill: incomeColor, r: 4 }}
              activeDot={{ r: 6 }}
              style={{ cursor: 'pointer', opacity: hiddenSeries.has('receitas') ? 0.3 : 1 }}
              onClick={() => handleSeriesClick('receitas')}
            />
          )}
          {!hiddenSeries.has('despesas') && (
            <Line 
              type="monotone" 
              dataKey="despesas" 
              stroke={expenseColor} 
              name="Despesas" 
              strokeWidth={2}
              dot={{ fill: expenseColor, r: 4 }}
              activeDot={{ r: 6 }}
              style={{ cursor: 'pointer', opacity: hiddenSeries.has('despesas') ? 0.3 : 1 }}
              onClick={() => handleSeriesClick('despesas')}
            />
          )}
        </LineChart>
      );
    }

    if (chartType === 'area') {
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis />
          {config?.showTooltip !== false && <Tooltip />}
          {config?.showLegend !== false && <Legend />}
          {!hiddenSeries.has('receitas') && (
            <Area 
              type="monotone" 
              dataKey="receitas" 
              fill={incomeColor} 
              stroke={incomeColor} 
              fillOpacity={0.3} 
              name="Receitas"
              style={{ cursor: 'pointer', opacity: hiddenSeries.has('receitas') ? 0.3 : 1 }}
              onClick={() => handleSeriesClick('receitas')}
            />
          )}
          {!hiddenSeries.has('despesas') && (
            <Area 
              type="monotone" 
              dataKey="despesas" 
              fill={expenseColor} 
              stroke={expenseColor} 
              fillOpacity={0.3} 
              name="Despesas"
              style={{ cursor: 'pointer', opacity: hiddenSeries.has('despesas') ? 0.3 : 1 }}
              onClick={() => handleSeriesClick('despesas')}
            />
          )}
        </AreaChart>
      );
    }

    return (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis />
        {config?.showTooltip !== false && <Tooltip />}
        {config?.showLegend !== false && <Legend onClick={(e) => handleSeriesClick(e.dataKey)} />}
        {!hiddenSeries.has('receitas') && (
          <Bar 
            dataKey="receitas" 
            fill={incomeColor} 
            name="Receitas"
            style={{ cursor: 'pointer', opacity: hiddenSeries.has('receitas') ? 0.3 : 1 }}
            onClick={() => handleSeriesClick('receitas')}
          />
        )}
        {!hiddenSeries.has('despesas') && (
          <Bar 
            dataKey="despesas" 
            fill={expenseColor} 
            name="Despesas"
            style={{ cursor: 'pointer', opacity: hiddenSeries.has('despesas') ? 0.3 : 1 }}
            onClick={() => handleSeriesClick('despesas')}
          />
        )}
      </BarChart>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Receitas vs Despesas (Mensal)</CardTitle>
          {onConfigChange && onConfigReset && (
            <ChartConfigModal
              config={config!}
              onConfigChange={onConfigChange}
              onReset={onConfigReset}
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Clique na legenda para ocultar/exibir série
        </p>
      </CardHeader>
      <CardContent>
        {hiddenSeries.size > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {Array.from(hiddenSeries).map((series, index) => (
              <button
                key={`${series}-${index}`}
                onClick={() => handleSeriesClick(series)}
                className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-full"
              >
                {series} ×
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
