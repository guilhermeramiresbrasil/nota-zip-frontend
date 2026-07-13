import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, PiggyBank } from 'lucide-react';
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
        return 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white border-0 shadow-lg shadow-blue-500/30';
      case 'income':
        return 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/30';
      case 'expense':
        return 'bg-gradient-to-br from-rose-400 to-rose-600 text-white border-0 shadow-lg shadow-rose-500/30';
      case 'savings':
        return 'bg-gradient-to-br from-violet-400 to-purple-600 text-white border-0 shadow-lg shadow-purple-500/30';
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'balance':
        return <Wallet className="h-5 w-5" />;
      case 'income':
        return <ArrowUpRight className="h-5 w-5" />;
      case 'expense':
        return <TrendingDown className="h-5 w-5" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const renderTrend = () => {
    if (!trend && trend !== 0) return null;

    const isPositive = trend > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
      <p className="text-sm mt-2 flex items-center text-white/90 font-medium">
        <Icon className="h-4 w-4 mr-1" />
        {isPositive ? '+' : ''}{trend}% este mês
      </p>
    );
  };

  return (
    <Card className={getVariantClasses()}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {getIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        {renderTrend()}
      </CardContent>
    </Card>
  );
};
