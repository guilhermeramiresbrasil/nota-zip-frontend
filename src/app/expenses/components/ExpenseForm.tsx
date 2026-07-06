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
import { CurrencyInput } from '@/components/ui/currency-input';
import { categoryService } from '../logics/services/categoryService';
import { cardService } from '@/app/cartoes/logics/cardService';
import { useAuth } from '@/contexts/AuthContext';

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
  payment_method?: string;
  card_id?: string;
  installments?: string;
  firstBillingMonth?: string;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: 'Pix',
  boleto: 'Boleto',
  debit_card: 'Débito',
  cash: 'Dinheiro',
  credit_card: 'Cartão de crédito',
  vr_va: 'VR/VA',
  prepaid_debit: 'Pré-pago',
};

const isCreditCardMethod = (method?: string) => method === 'credit_card';

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
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<{ id: string; name: string; lastFourDigits?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Função auxiliar para converter valor formatado em reais para número
  const parseCurrencyToNumber = (formattedValue: string): number => {
    if (!formattedValue) return 0;
    const cleanValue = formattedValue.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  };

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

  useEffect(() => {
    if (!user?.id) return;
    cardService.listCards(user.id).then(setCards).catch(() => {});
  }, [user?.id]);

  const showCardSelect =
    formData.payment_method === 'credit_card' ||
    formData.payment_method === 'vr_va' ||
    formData.payment_method === 'prepaid_debit';

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
            <CurrencyInput
              id="amount"
              value={formData.amount}
              onChange={(value) => onChangeFormData({ ...formData, amount: value })}
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

          {transactionType === 'expense' && (
            <div className="space-y-2">
              <Label>Forma de pagamento</Label>
              <Select
                value={formData.payment_method || ''}
                onValueChange={(v) =>
                  onChangeFormData({
                    ...formData,
                    payment_method: v,
                    card_id: '',
                    installments: '1',
                    firstBillingMonth: new Date().toISOString().slice(0, 7),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {transactionType === 'expense' && isCreditCardMethod(formData.payment_method) && (
            <>
              <div className="space-y-2">
                <Label>Cartão de crédito</Label>
                <Select
                  value={formData.card_id || ''}
                  onValueChange={(v) => onChangeFormData({ ...formData, card_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={cards.length === 0 ? 'Nenhum cartão cadastrado' : 'Selecione o cartão'} />
                  </SelectTrigger>
                  <SelectContent>
                    {cards.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{c.lastFourDigits ? ` ····${c.lastFourDigits}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="installments">Parcelas</Label>
                  <Input
                    id="installments"
                    type="number"
                    min="1"
                    max="48"
                    value={formData.installments || '1'}
                    onChange={(e) => onChangeFormData({ ...formData, installments: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstBillingMonth">1ª fatura</Label>
                  <Input
                    id="firstBillingMonth"
                    type="month"
                    value={formData.firstBillingMonth || new Date().toISOString().slice(0, 7)}
                    onChange={(e) => onChangeFormData({ ...formData, firstBillingMonth: e.target.value })}
                  />
                </div>
              </div>

              {parseInt(formData.installments || '1') > 1 && (
                <p className="text-xs text-muted-foreground">
                  {parseInt(formData.installments || '1')}x de{' '}
                  <strong>
                    {(parseCurrencyToNumber(formData.amount) / parseInt(formData.installments || '1'))
                      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>
                  {' '}· Você pode ajustar o valor total para incluir juros.
                </p>
              )}
            </>
          )}

          {transactionType === 'expense' && showCardSelect && !isCreditCardMethod(formData.payment_method) && cards.length > 0 && (
            <div className="space-y-2">
              <Label>Cartão</Label>
              <Select
                value={formData.card_id || ''}
                onValueChange={(v) => onChangeFormData({ ...formData, card_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cartão" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}{c.lastFourDigits ? ` ····${c.lastFourDigits}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
