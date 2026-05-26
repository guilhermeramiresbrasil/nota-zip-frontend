'use client';

import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryData, ChartConfig, COLOR_PALETTES } from '../types/report.types';

interface CategoryChartProps {
  data: CategoryData[];
  config?: ChartConfig;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ data, config }) => {
  const palette = COLOR_PALETTES[config?.colorPalette ?? 'default'];
  const coloredData = data.map((item, i) => ({ ...item, color: palette[i % palette.length] }));
  const chartType = config?.chartType ?? 'pie';

  const renderChart = () => {
    if (chartType === 'bar' || chartType === 'line' || chartType === 'area') {
      const layout = config?.orientation === 'horizontal' ? 'vertical' : 'horizontal';
      return (
        <BarChart data={coloredData} layout={layout}>
          <CartesianGrid strokeDasharray="3 3" />
          {layout === 'vertical' ? (
            <>
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
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
            {coloredData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      );
    }

    return (
      <PieChart>
        <Pie
          data={coloredData}
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
          {coloredData.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={entry.color} />
          ))}
        </Pie>
        {config?.showTooltip !== false && <Tooltip />}
        {config?.showLegend !== false && <Legend />}
      </PieChart>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
