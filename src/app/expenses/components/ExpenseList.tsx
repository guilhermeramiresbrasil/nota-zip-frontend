import React from 'react';
import { Transaction } from '@/app/home/types/dashboard.types';
import { TransactionItem } from '@/app/home/components/TransactionItem';
import { Button } from '@/components/ui/button';
import { Wallet, Edit, Trash2 } from 'lucide-react';

interface ExpenseListProps {
  transactions: Transaction[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Nenhuma transação encontrada</p>
        <p className="text-sm text-gray-400 mt-1">Adicione uma nova transação clicando em "Nova Transação".</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center gap-4">
          <div className="flex-1">
            <TransactionItem transaction={transaction} />
          </div>
          {(onEdit || onDelete) && (
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(transaction.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(transaction.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
