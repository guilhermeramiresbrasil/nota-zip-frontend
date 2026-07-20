'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cardService } from '../logics/cardService';
import {
  CreditCard,
  CreditCardInvoice,
  CreditCardPurchase,
  CreditCardReload,
  CardBalance,
} from '../types/card.types';
import { categoryService } from '@/app/expenses/logics/services/categoryService';
import { PlusCircle, Receipt, RefreshCw, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';

interface CardDetailModalProps {
  card: CreditCard;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReload: () => void;
}

type Tab = 'invoices' | 'purchases' | 'reloads';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  open: 'default',
  closed: 'secondary',
  paid: 'outline',
  partial: 'secondary',
};

const parseCurrencyToNumber = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;

export function CardDetailModal({ card, userId, open, onOpenChange, onReload }: CardDetailModalProps) {
  const t = useTranslations('cards');
  const { user } = useAuth();
  const fmt = (v: number) => new Intl.NumberFormat(user?.language || 'pt-BR', { style: 'currency', currency: user?.currency || 'BRL' }).format(v);
  const statusLabel = (s: string) => t(`invoiceStatus.${s}` as any) || s;
  const [tab, setTab] = useState<Tab>('invoices');
  const [invoices, setInvoices] = useState<CreditCardInvoice[]>([]);
  const [purchases, setPurchases] = useState<CreditCardPurchase[]>([]);
  const [reloads, setReloads] = useState<CreditCardReload[]>([]);
  const [balance, setBalance] = useState<CardBalance | null>(null);
  const [loading, setLoading] = useState(false);

  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    categoryId: '',
    description: '',
    totalAmount: '',
    installments: '1',
    purchaseDate: new Date().toISOString().split('T')[0],
    firstBillingMonth: new Date().toISOString().slice(0, 7),
  });

  const [showReloadForm, setShowReloadForm] = useState(false);
  const [reloadAmount, setReloadAmount] = useState('');
  const [reloadNotes, setReloadNotes] = useState('');

  const [showPayForm, setShowPayForm] = useState<string | null>(null);
  const [payType, setPayType] = useState<'full' | 'partial'>('full');
  const [payAmount, setPayAmount] = useState('');

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, pur, rel, bal] = await Promise.all([
        cardService.listInvoices(card.id, userId),
        cardService.listPurchases(card.id, userId),
        card.type === 'prepaid' ? cardService.listReloads(card.id, userId) : Promise.resolve([]),
        cardService.getCardBalance(card.id, userId),
      ]);
      setInvoices(inv);
      setPurchases(pur);
      setReloads(rel);
      setBalance(bal);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [card.id, userId, card.type]);

  useEffect(() => {
    if (open) {
      loadData();
      categoryService.fetchCategories().then(setCategories).catch(() => {});
    }
  }, [open, loadData]);

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);
    try {
      await cardService.createPurchase(card.id, userId, purchaseForm);
      setShowPurchaseForm(false);
      setPurchaseForm({
        categoryId: '',
        description: '',
        totalAmount: '',
        installments: '1',
        purchaseDate: new Date().toISOString().split('T')[0],
        firstBillingMonth: new Date().toISOString().slice(0, 7),
      });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorCreatePurchase'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddReload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);
    try {
      await cardService.addReload(card.id, userId, parseCurrencyToNumber(reloadAmount), reloadNotes || undefined);
      setShowReloadForm(false);
      setReloadAmount('');
      setReloadNotes('');
      loadData();
      onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorAddReload'));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    setError('');
    setActionLoading(true);
    try {
      // Usa automaticamente a categoria "Cartão de Crédito" (subcategoria de "Contas")
      const creditCardCategoryId = '508d544c-7273-4158-8aa9-74068c110c6f';
      await cardService.payInvoice(
        invoiceId,
        userId,
        payType,
        payType === 'partial' ? parseCurrencyToNumber(payAmount) : undefined,
        creditCardCategoryId
      );
      setShowPayForm(null);
      setPayAmount('');
      loadData();
      onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorPayInvoice'));
    } finally {
      setActionLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'invoices', label: t('invoicesTab') },
    { key: 'purchases', label: t('purchasesTab') },
    ...(card.type === 'prepaid' ? [{ key: 'reloads' as Tab, label: t('reloadsTab') }] : []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {card.name}
          </DialogTitle>
          <DialogDescription>
            {balance && (
              <span className="text-sm">
                {t('limit')}: {fmt(balance.limit)} · {t('used')}: {fmt(balance.used)} · {t('available')}:{' '}
                <span className={balance.available < 0 ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
                  {fmt(balance.available)}
                </span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 border-b mb-4">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                tab === tabItem.key ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-destructive mb-2">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {tab === 'invoices' && (
              <div className="space-y-3">
                {invoices.length === 0 && <p className="text-muted-foreground text-sm text-center py-6">{t('noInvoicesModal')}</p>}
                {invoices.map((inv) => (
                  <div key={inv.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{inv.billingMonth}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_VARIANTS[inv.status] || 'secondary'}>
                          {statusLabel(inv.status)}
                        </Badge>
                        <span className="font-semibold">{fmt(inv.totalAmount)}</span>
                      </div>
                    </div>
                    {inv.status === 'open' && (
                      <>
                        {showPayForm === inv.id ? (
                          <div className="space-y-2 pt-1">
                            <Select value={payType} onValueChange={(v) => setPayType(v as 'full' | 'partial')}>
                              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full">{t('payFull', { amount: fmt(inv.totalAmount) })}</SelectItem>
                                <SelectItem value="partial">{t('payPartial')}</SelectItem>
                              </SelectContent>
                            </Select>
                            {payType === 'partial' && (
                              <CurrencyInput
                                placeholder={t('paidAmount')}
                                value={payAmount}
                                onChange={setPayAmount}
                                className="h-8 text-xs"
                              />
                            )}
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1" disabled={actionLoading} onClick={() => handlePayInvoice(inv.id)}>
                                {t('confirm')}
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowPayForm(null)}>
                                {t('cancel')}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full" onClick={() => setShowPayForm(inv.id)}>
                            {t('payInvoice')}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'purchases' && (
              <div className="space-y-3">
                <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => setShowPurchaseForm((v) => !v)}>
                  <PlusCircle className="h-4 w-4" /> {t('addPurchase')}
                </Button>
                {showPurchaseForm && (
                  <form onSubmit={handleCreatePurchase} className="border rounded-lg p-3 space-y-2">
                    <div>
                      <Label className="text-xs">{t('description')}</Label>
                      <Input
                        className="h-8 text-xs mt-1"
                        value={purchaseForm.description}
                        onChange={(e) => setPurchaseForm((f) => ({ ...f, description: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">{t('totalAmount')}</Label>
                        <Input
                          className="h-8 text-xs mt-1"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={purchaseForm.totalAmount}
                          onChange={(e) => setPurchaseForm((f) => ({ ...f, totalAmount: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('installments')}</Label>
                        <Input
                          className="h-8 text-xs mt-1"
                          type="number"
                          min="1"
                          max="36"
                          value={purchaseForm.installments}
                          onChange={(e) => setPurchaseForm((f) => ({ ...f, installments: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">{t('purchaseDate')}</Label>
                        <Input
                          className="h-8 text-xs mt-1"
                          type="date"
                          value={purchaseForm.purchaseDate}
                          onChange={(e) => setPurchaseForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('firstInvoice')}</Label>
                        <Input
                          className="h-8 text-xs mt-1"
                          type="month"
                          value={purchaseForm.firstBillingMonth}
                          onChange={(e) => setPurchaseForm((f) => ({ ...f, firstBillingMonth: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">{t('category')}</Label>
                      <Select
                        value={purchaseForm.categoryId}
                        onValueChange={(v) => setPurchaseForm((f) => ({ ...f, categoryId: v }))}
                      >
                        <SelectTrigger className="h-9 mt-1"><SelectValue placeholder={t('select')} /></SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="flex-1" disabled={actionLoading}>{t('add')}</Button>
                      <Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => setShowPurchaseForm(false)}>{t('cancel')}</Button>
                    </div>
                  </form>
                )}
                {purchases.length === 0 && !showPurchaseForm && (
                  <p className="text-muted-foreground text-sm text-center py-4">{t('noPurchasesModal')}</p>
                )}
                {purchases.map((p) => (
                  <div key={p.id} className="border rounded-lg p-3 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{p.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.installments}x · {p.purchaseDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{fmt(p.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">{fmt(p.installmentAmount)}{t('perMonth')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'reloads' && (
              <div className="space-y-3">
                <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => setShowReloadForm((v) => !v)}>
                  <RefreshCw className="h-4 w-4" /> {t('addReload')}
                </Button>
                {showReloadForm && (
                  <form onSubmit={handleAddReload} className="border rounded-lg p-3 space-y-2">
                    <div>
                      <Label className="text-xs">{t('reloadAmount')}</Label>
                      <CurrencyInput
                        className="h-8 text-xs mt-1"
                        value={reloadAmount}
                        onChange={(value) => setReloadAmount(value)}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t('notes')}</Label>
                      <Input
                        className="h-8 text-xs mt-1"
                        value={reloadNotes}
                        onChange={(e) => setReloadNotes(e.target.value)}
                        placeholder={t('notesPlaceholder')}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="flex-1" disabled={actionLoading}>{t('confirm')}</Button>
                      <Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => setShowReloadForm(false)}>{t('cancel')}</Button>
                    </div>
                  </form>
                )}
                {reloads.length === 0 && !showReloadForm && (
                  <p className="text-muted-foreground text-sm text-center py-4">{t('noReloadsModal')}</p>
                )}
                {reloads.map((r) => (
                  <div key={r.id} className="border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{fmt(r.amount)}</p>
                      <p className="text-xs text-muted-foreground">{r.reloadDate}</p>
                    </div>
                    {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
