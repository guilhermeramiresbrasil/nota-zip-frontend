import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { StatsCardProps } from '../types/dashboard.types';

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  trend,
  variant = 'balance',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'balance':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0';
      case 'income':
        return 'text-green-600';
      case 'expense':
        return 'text-red-600';
      case 'savings':
        return 'text-purple-600';
      default:
        return '';
    }
  };

  const getTitleClasses = () => {
    if (variant === 'balance') {
      return 'text-sm font-medium text-blue-100';
    }
    return 'text-sm font-medium text-gray-600';
  };

  const getValueClasses = () => {
    switch (variant) {
      case 'income':
        return 'text-3xl font-bold text-green-600';
      case 'expense':
        return 'text-3xl font-bold text-red-600';
      case 'savings':
        return 'text-3xl font-bold text-purple-600';
      default:
        return 'text-3xl font-bold';
    }
  };

  const renderTrend = () => {
    if (!trend && trend !== 0) return null;

    const isPositive = trend > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
      <p
        className={`text-sm mt-1 flex items-center ${
          variant === 'balance' ? 'text-blue-100' : 'text-gray-500'
        }`}
      >
        <Icon className="h-4 w-4 mr-1" />
        {isPositive ? '+' : ''}{trend}% este mês
      </p>
    );
  };

  return (
    <Card className={getVariantClasses()}>
      <CardHeader className="pb-3">
        <CardTitle className={getTitleClasses()}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={getValueClasses()}>
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        {renderTrend()}
      </CardContent>
    </Card>
  );
};
