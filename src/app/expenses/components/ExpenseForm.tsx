import React, { useEffect, useState } from 'react';
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
import { categoryService } from '../logics/services/categoryService';

interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

interface FormData {
  amount: string;
  categoryId: string;
  description: string;
  date: string;
  newCategoryName?: string;
}

interface ExpenseFormProps {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  transactionType: 'income' | 'expense';
  onTransactionTypeChange: (type: 'income' | 'expense') => void;
  formData: FormData;
  onChangeFormData: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  dialogOpen,
  onDialogOpenChange,
  transactionType,
  onTransactionTypeChange,
  formData,
  onChangeFormData,
  onSubmit,
  onCancel,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Registre suas receitas e despesas para controle financeiro
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={transactionType}
              onValueChange={(value: 'income' | 'expense') => {
                onTransactionTypeChange(value);
                onChangeFormData({ ...formData, categoryId: '' });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              value={formData.categoryId}
              onValueChange={(value) => {
                onChangeFormData({ ...formData, categoryId: value, newCategoryName: '' });
              }}
              required
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Carregando..." : "Selecione a categoria"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
                <SelectItem value="new">
                  + Nova categoria
                </SelectItem>
              </SelectContent>
            </Select>
            {formData.categoryId === 'new' && (
              <Input
                id="newCategoryName"
                type="text"
                placeholder="Nome da nova categoria"
                value={formData.newCategoryName || ''}
                onChange={(e) => onChangeFormData({ ...formData, newCategoryName: e.target.value })}
                required
                className="mt-2"
              />
            )}
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
