'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionItemProps } from '../types/dashboard.types';

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { user } = useAuth();
  const isIncome = transaction.type === 'income' || transaction.type === 'credit';
  const displayName = transaction.name || transaction.description || transaction.category || '—';
  const currencyFormatter = new Intl.NumberFormat(user?.language || 'pt-BR', {
    style: 'currency',
    currency: user?.currency || 'BRL',
  });
  const formattedAmount = currencyFormatter.format(Math.abs(transaction.amount));

  return (
    <div className="flex items-center justify-between py-1 px-2 bg-white rounded border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded ${isIncome ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          {isIncome
            ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
            : <ArrowDownLeft className="h-3.5 w-3.5 text-rose-600" />
          }
        </div>
        <div>
          <p className="font-medium text-xs text-slate-800">{displayName}</p>
          <p className="text-[10px] text-slate-500">
            {transaction.category} • {transaction.date}
          </p>
        </div>
      </div>
      <p className={`font-semibold text-xs ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isIncome ? '+' : '-'}{formattedAmount}
      </p>
    </div>
  );
};
