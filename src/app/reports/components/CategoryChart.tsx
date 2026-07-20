'use client';

import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { CategoryData, ChartConfig, COLOR_PALETTES } from '../types/report.types';
import { ChartConfigModal } from './ChartConfigModal';

interface CategoryChartProps {
  data: CategoryData[];
  config?: ChartConfig;
  onConfigChange?: (config: Partial<ChartConfig>) => void;
  onConfigReset?: () => void;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ 
  data, 
  config, 
  onConfigChange,
  onConfigReset 
}) => {
  const t = useTranslations('reports');
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
    const layout = config?.orientation === 'horizontal' ? 'vertical' : 'horizontal';

    if (chartType === 'bar') {
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
          <Bar dataKey="value" name={t('value')}>
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

    if (chartType === 'line') {
      return (
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          {config?.showTooltip !== false && <Tooltip />}
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={palette[0]}
            strokeWidth={2}
            dot={{ fill: palette[0], r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      );
    }

    if (chartType === 'area') {
      return (
        <AreaChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          {config?.showTooltip !== false && <Tooltip />}
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={palette[0]}
            fill={palette[0]}
            fillOpacity={0.3}
          />
        </AreaChart>
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
      </PieChart>
    );
  };

  // Custom legend with click functionality
  const CustomLegend = () => {
    if (!config?.showLegend) return null;
    
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {coloredData.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center gap-2 cursor-pointer hover:opacity-70"
            onClick={() => handleCategoryClick(entry.name)}
            style={{ opacity: hiddenCategories.has(entry.name) ? 0.3 : 1 }}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">{entry.name}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('expensesByCategory')}</CardTitle>
          {onConfigChange && onConfigReset && (
            <ChartConfigModal
              config={config!}
              onConfigChange={onConfigChange}
              onReset={onConfigReset}
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {t('clickLegendToggle')}
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
        <CustomLegend />
      </CardContent>
    </Card>
  );
};
