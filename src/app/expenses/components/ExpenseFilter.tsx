import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionType } from '@/app/home/types/dashboard.types';
import { expenseCategories, incomeCategories } from '../types/expense.types';

interface ExpenseFilterProps {
  transactionType: TransactionType;
  onTransactionTypeChange: (type: TransactionType) => void;
  category?: string;
  onCategoryChange?: (category: string) => void;
}

export const ExpenseFilter: React.FC<ExpenseFilterProps> = ({
  transactionType,
  onTransactionTypeChange,
  category,
  onCategoryChange,
}) => {
  const categories =
    transactionType === 'expense' ? expenseCategories : incomeCategories;

  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1">
        <Select
          value={transactionType}
          onValueChange={(value: TransactionType) =>
            onTransactionTypeChange(value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Despesas</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {onCategoryChange && (
        <div className="flex-1">
          <Select
            value={category}
            onValueChange={onCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
