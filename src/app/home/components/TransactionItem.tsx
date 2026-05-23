import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { TransactionItemProps } from '../types/dashboard.types';

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isIncome = transaction.type === 'income' || transaction.type === 'credit';
  const displayName = transaction.name || transaction.description || transaction.category || '—';

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}>
          {isIncome
            ? <TrendingUp className="h-5 w-5 text-green-600" />
            : <TrendingDown className="h-5 w-5 text-red-600" />
          }
        </div>
        <div>
          <p className="font-medium text-gray-900">{displayName}</p>
          <p className="text-sm text-gray-500">
            {transaction.category} • {transaction.date}
          </p>
        </div>
      </div>
      <p className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
        {isIncome ? '+' : '-'}R$ {Math.abs(transaction.amount).toFixed(2)}
      </p>
    </div>
  );
};
