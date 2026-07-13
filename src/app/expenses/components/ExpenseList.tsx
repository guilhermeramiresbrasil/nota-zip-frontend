import React, { useState, useEffect, useRef } from 'react';
import { Transaction } from '@/app/home/types/dashboard.types';
import { TransactionItem } from '@/app/home/components/TransactionItem';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Wallet, Edit, Trash2, Loader2 } from 'lucide-react';

interface ExpenseListProps {
  transactions: Transaction[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const PAGE_SIZE = 20;

export const ExpenseList: React.FC<ExpenseListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onLoadMore,
  hasMore = false,
  loading = false,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const observerRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const handleDelete = () => {
    if (transactionToDelete && onDelete) {
      onDelete(transactionToDelete);
      setTransactionToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  // Infinite scroll using Intersection Observer
  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          if (onLoadMore) {
            onLoadMore();
          } else {
            setVisibleCount((prev) => prev + PAGE_SIZE);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.current.observe(observerRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, loading, onLoadMore]);

  const visibleTransactions = transactions;

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
    <div className="space-y-2">
      {visibleTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center gap-2">
          <div className="flex-1">
            <TransactionItem transaction={transaction} />
          </div>
          {(onEdit || onDelete) && (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(transaction.id)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setTransactionToDelete(transaction.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}
      
      {/* Sentinel for infinite scroll */}
      <div ref={observerRef} className="h-4" />
      
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir transação"
        description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
};
