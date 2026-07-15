import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  ArrowDownLeft, ArrowUpRight,
  Home, Utensils, Car, Heart, BookOpen, Music2,
  ShoppingCart, TrendingUp, Briefcase, MoreHorizontal,
  Shirt, Repeat, FileText, PawPrint,
  Laptop, Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryCombobox, ComboboxOption } from './CategoryCombobox';
import { categoryService, Category } from '../logics/services/categoryService';
import { cardService } from '@/app/cartoes/logics/cardService';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  amount: string;
  categoryId: string;
  subcategoryId?: string;
  description: string;
  date: string;
  newCategoryName?: string;
  newParentCategoryId?: string;
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

const ICON_MAP: Record<string, React.ReactNode> = {
  home:         <Home className="h-3 w-3" />,
  utensils:     <Utensils className="h-3 w-3" />,
  car:          <Car className="h-3 w-3" />,
  heart:        <Heart className="h-3 w-3" />,
  book:         <BookOpen className="h-3 w-3" />,
  'book-open':  <BookOpen className="h-3 w-3" />,
  gamepad:      <Music2 className="h-3 w-3" />,
  'shopping-cart': <ShoppingCart className="h-3 w-3" />,
  'trending-up':<TrendingUp className="h-3 w-3" />,
  briefcase:    <Briefcase className="h-3 w-3" />,
  'plus-circle':<MoreHorizontal className="h-3 w-3" />,
  'minus-circle':<MoreHorizontal className="h-3 w-3" />,
  shirt:        <Shirt className="h-3 w-3" />,
  repeat:       <Repeat className="h-3 w-3" />,
  'file-text':  <FileText className="h-3 w-3" />,
  'shopping-bag':<ShoppingCart className="h-3 w-3" />,
  laptop:       <Laptop className="h-3 w-3" />,
  'rotate-ccw': <Repeat className="h-3 w-3" />,
  'building-2': <Building2 className="h-3 w-3" />,
};

/**
 * Constrói a lista unificada: cada categoria raiz vira um grupo (heading).
 * Se tiver subcategorias → subcategorias são os itens selecionáveis.
 * Se não tiver            → a própria categoria raiz é o item selecionável.
 */
function buildCategoryOptions(rootCategories: Category[]): ComboboxOption[] {
  const opts: ComboboxOption[] = [];
  for (const cat of rootCategories) {
    const color = cat.color || undefined;
    const bg    = cat.color ? `${cat.color}22` : undefined;
    const icon  = cat.icon ? (ICON_MAP[cat.icon] ?? undefined) : undefined;
    const subs  = cat.subcategories ?? [];
    if (subs.length > 0) {
      for (const sub of subs) {
        opts.push({
          value: sub.id,
          label: sub.name,
          groupLabel: cat.name,
          groupColor: color,
          groupBg: bg,
          groupIcon: icon,
        });
      }
    } else {
      opts.push({
        value: cat.id,
        label: cat.name,
        groupLabel: cat.name,
        groupColor: color,
        groupBg: bg,
        groupIcon: icon,
      });
    }
  }
  return opts;
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
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<{ id: string; name: string; lastFourDigits?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const parseCurrencyToNumber = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
  const isNewCategoryReady = !!(formData.newCategoryName && formData.newParentCategoryId);
  const isReady = !!(formData.amount && (formData.categoryId && formData.categoryId !== 'new' || isNewCategoryReady));

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const apiType = transactionType === 'income' ? 'credit' : 'debit';
        const fetchedCategories = await categoryService.fetchCategories(apiType, user?.id);
        setCategories(fetchedCategories);
        // Reset category selection when type changes
        onChangeFormData({ ...formData, categoryId: '', subcategoryId: '' });
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetch();
  }, [transactionType, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    cardService.listCards(user.id).then(setCards).catch(() => {});
  }, [user?.id]);

  const showCardSelect =
    formData.payment_method === 'credit_card' ||
    formData.payment_method === 'vr_va' ||
    formData.payment_method === 'prepaid_debit';

  const catOptions = buildCategoryOptions(categories);

  return (
    <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight">Nova Transação</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-0.5">
            Registre uma entrada ou saída financeira
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="px-6 pb-6 pt-5 space-y-5">

          {/* ── Type toggle pill ── */}
          <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
            <button
              type="button"
              onClick={() => { onTransactionTypeChange('expense'); onChangeFormData({ ...formData, categoryId: '', subcategoryId: '' }); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all',
                transactionType === 'expense'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <ArrowDownLeft className="h-4 w-4" />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => { onTransactionTypeChange('income'); onChangeFormData({ ...formData, categoryId: '', subcategoryId: '' }); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all',
                transactionType === 'income'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <ArrowUpRight className="h-4 w-4" />
              Receita
            </button>
          </div>

          {/* ── Amount ── */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-sm font-medium text-slate-700">Valor</Label>
            <CurrencyInput
              id="amount"
              value={formData.amount}
              onChange={(value) => onChangeFormData({ ...formData, amount: value })}
              required
            />
          </div>

          {/* ── Category ── */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Categoria</Label>
            <CategoryCombobox
              options={catOptions}
              value={formData.subcategoryId || formData.categoryId}
              onChange={(value) => {
                const rootCat = categories.find((c) =>
                  c.id === value || (c.subcategories ?? []).some((s) => s.id === value)
                );
                onChangeFormData({
                  ...formData,
                  categoryId: rootCat?.id ?? value,
                  subcategoryId: rootCat && rootCat.id !== value ? value : '',
                  newCategoryName: '',
                });
              }}
              placeholder={loading ? 'Carregando…' : 'Selecione uma categoria…'}
              disabled={loading}
              extraOption={{ value: 'new', label: '+ Nova categoria' }}
            />
            {formData.categoryId === 'new' && (
              <div className="mt-1.5 space-y-2">
                <Select
                  value={formData.newParentCategoryId || ''}
                  onValueChange={(v) => onChangeFormData({ ...formData, newParentCategoryId: v })}
                >
                  <SelectTrigger className="h-10 border-slate-200 text-slate-700">
                    <SelectValue placeholder="Categoria pai (obrigatório)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full shrink-0 inline-block"
                            style={{ backgroundColor: cat.color ?? '#94a3b8' }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="new-category-name"
                  name="new-category-name"
                  type="text"
                  placeholder="Nome da nova subcategoria"
                  value={formData.newCategoryName || ''}
                  onChange={(e) => onChangeFormData({ ...formData, newCategoryName: e.target.value })}
                  required
                />
              </div>
            )}
          </div>

          {/* ── Description ── */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
              Descrição <span className="text-slate-400 font-normal">(opcional)</span>
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="Ex: Conta de luz de junho"
              value={formData.description}
              onChange={(e) => onChangeFormData({ ...formData, description: e.target.value })}
              className="h-10 border-slate-200 text-slate-700 placeholder:text-slate-400 focus-visible:ring-indigo-400"
            />
          </div>

          {/* ── Date ── */}
          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-sm font-medium text-slate-700">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => onChangeFormData({ ...formData, date: e.target.value })}
              required
              className="h-10 border-slate-200 text-slate-700 focus-visible:ring-indigo-400"
            />
          </div>

          {/* ── Payment method (expense only) ── */}
          {transactionType === 'expense' && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Forma de pagamento *</Label>
              <Select
                value={formData.payment_method || ''}
                onValueChange={(v) => onChangeFormData({ ...formData, payment_method: v, card_id: '', installments: '1', firstBillingMonth: new Date().toISOString().slice(0, 7) })}
              >
                <SelectTrigger className="h-10 border-slate-200 text-slate-700">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ── Credit card fields ── */}
          {transactionType === 'expense' && isCreditCardMethod(formData.payment_method) && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Cartão de crédito</Label>
                <Select value={formData.card_id || ''} onValueChange={(v) => onChangeFormData({ ...formData, card_id: v })}>
                  <SelectTrigger className="h-10 border-slate-200 text-slate-700">
                    <SelectValue placeholder={cards.length === 0 ? 'Nenhum cartão cadastrado' : 'Selecione o cartão'} />
                  </SelectTrigger>
                  <SelectContent>
                    {cards.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}{c.lastFourDigits ? ` ····${c.lastFourDigits}` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="installments" className="text-sm font-medium text-slate-700">Parcelas</Label>
                  <Input id="installments" type="number" min="1" max="48" value={formData.installments || '1'}
                    onChange={(e) => onChangeFormData({ ...formData, installments: e.target.value })}
                    className="h-10 border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="firstBillingMonth" className="text-sm font-medium text-slate-700">1ª fatura</Label>
                  <Input id="firstBillingMonth" type="month"
                    value={formData.firstBillingMonth || new Date().toISOString().slice(0, 7)}
                    onChange={(e) => onChangeFormData({ ...formData, firstBillingMonth: e.target.value })}
                    className="h-10 border-slate-200" />
                </div>
              </div>
              {parseInt(formData.installments || '1') > 1 && (
                <p className="text-xs text-slate-500">
                  {parseInt(formData.installments || '1')}x de{' '}
                  <strong>{(parseCurrencyToNumber(formData.amount) / parseInt(formData.installments || '1')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  {' '}· Você pode ajustar o valor total para incluir juros.
                </p>
              )}
            </>
          )}

          {/* ── Other card ── */}
          {transactionType === 'expense' && showCardSelect && !isCreditCardMethod(formData.payment_method) && cards.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Cartão</Label>
              <Select value={formData.card_id || ''} onValueChange={(v) => onChangeFormData({ ...formData, card_id: v })}>
                <SelectTrigger className="h-10 border-slate-200 text-slate-700">
                  <SelectValue placeholder="Selecione o cartão" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}{c.lastFourDigits ? ` ····${c.lastFourDigits}` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={!isReady}
            className={cn(
              'w-full h-11 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
              isReady
                ? transactionType === 'expense'
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm cursor-pointer'
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-sm cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {transactionType === 'expense'
              ? <ArrowDownLeft className="h-4 w-4" />
              : <ArrowUpRight className="h-4 w-4" />}
            {transactionType === 'expense' ? 'Registrar Despesa' : 'Registrar Receita'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-1"
          >
            Cancelar
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
