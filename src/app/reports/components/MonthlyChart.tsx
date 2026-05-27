'use client';

import React from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyData, ChartConfig, COLOR_PALETTES } from '../types/report.types';

interface MonthlyChartProps {
  data: MonthlyData[];
  config?: ChartConfig;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data, config }) => {
  const palette = COLOR_PALETTES[config?.colorPalette ?? 'default'];
  const incomeColor = palette[1] || '#22c55e';
  const expenseColor = palette[0] || '#ef4444';
  const chartType = config?.chartType ?? 'bar';

  const commonProps = {
    data,
  };

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          {config?.showTooltip !== false && <Tooltip />}
          {config?.showLegend !== false && <Legend />}
          <Line type="monotone" dataKey="receitas" stroke={incomeColor} name="Receitas" strokeWidth={2} />
          <Line type="monotone" dataKey="despesas" stroke={expenseColor} name="Despesas" strokeWidth={2} />
        </LineChart>
      );
    }

    if (chartType === 'area') {
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          {config?.showTooltip !== false && <Tooltip />}
          {config?.showLegend !== false && <Legend />}
          <Area type="monotone" dataKey="receitas" fill={incomeColor} stroke={incomeColor} fillOpacity={0.3} name="Receitas" />
          <Area type="monotone" dataKey="despesas" fill={expenseColor} stroke={expenseColor} fillOpacity={0.3} name="Despesas" />
        </AreaChart>
      );
    }

    return (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        {config?.showTooltip !== false && <Tooltip />}
        {config?.showLegend !== false && <Legend />}
        <Bar dataKey="receitas" fill={incomeColor} name="Receitas" />
        <Bar dataKey="despesas" fill={expenseColor} name="Despesas" />
      </BarChart>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receitas vs Despesas (Mensal)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
