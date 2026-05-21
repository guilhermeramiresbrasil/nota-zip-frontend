import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { expenseCategories, incomeCategories } from '../types/expense.types';
import { TransactionType } from '@/app/home/types/dashboard.types';

interface FormData {
  amount: string;
  category: string;
  description: string;
  date: string;
}

interface ExpenseFormProps {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  transactionType: 'income' | 'expense';
  formData: FormData;
  onChangeFormData: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  dialogOpen,
  onDialogOpenChange,
  transactionType,
  formData,
  onChangeFormData,
  onSubmit,
  onCancel,
}) => {
  const categories = transactionType === 'expense' ? expenseCategories : incomeCategories;

  return (
    <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transactionType === 'expense' ? 'Nova Despesa' : 'Nova Receita'}
          </DialogTitle>
          <DialogDescription>
            {transactionType === 'expense'
              ? 'Registre suas despesas para controle financeiro'
              : 'Registre suas receitas para controle financeiro'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0,00"
              value={formData.amount}
              onChange={(e) => onChangeFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => onChangeFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição opcional"
              value={formData.description}
              onChange={(e) => onChangeFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => onChangeFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
