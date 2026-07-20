'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Receipt,
  ShoppingBag,
  RefreshCw,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
} from 'lucide-react';
import { cardService } from '../logics/cardService';
import { categoryService } from '../../expenses/logics/services/categoryService';
import {
  CreditCard,
  CreditCardInvoice,
  CreditCardPurchase,
  CreditCardReload,
  CardBalance,
} from '../types/card.types';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'invoices' | 'purchases' | 'reloads';

const parseCurrencyToNumber = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;

interface Props {
  card: CreditCard;
  userId: string;
  balance: CardBalance | null;
  onReload: () => void;
}

export function CardDetailPanel({ card, userId, balance, onReload }: Props) {
  const t = useTranslations('cards');
  const locale = useLocale();
  const { user } = useAuth();
  const fmt = (v: number) => new Intl.NumberFormat(user?.language || 'pt-BR', { style: 'currency', currency: user?.currency || 'BRL' }).format(v);
  const fmtDate = (d: string) => new Date(d + (d.length === 7 ? '-01' : '')).toLocaleDateString(locale, { month: 'short', year: 'numeric' });
  const statusLabel = (s: string) => t(`invoiceStatus.${s}` as any) || s;
  const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    open:    { label: t('invoiceStatus.open'),   icon: <Clock className="h-3 w-3" />,        color: 'text-blue-600 bg-blue-50 border-blue-200' },
    closed:  { label: t('invoiceStatus.closed'),  icon: <AlertCircle className="h-3 w-3" />,  color: 'text-slate-600 bg-slate-50 border-slate-200' },
    paid:    { label: t('invoiceStatus.paid'),     icon: <CheckCircle2 className="h-3 w-3" />, color: 'text-green-600 bg-green-50 border-green-200' },
    partial: { label: t('invoiceStatus.partial'),  icon: <TrendingDown className="h-3 w-3" />, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  };
  const [tab, setTab] = useState<Tab>('invoices');
  const [invoices, setInvoices] = useState<CreditCardInvoice[]>([]);
  const [purchases, setPurchases] = useState<CreditCardPurchase[]>([]);
  const [reloads, setReloads] = useState<CreditCardReload[]>([]);

  const [payingId, setPayingId] = useState<string | null>(null);
  const [payType, setPayType] = useState<'full' | 'partial'>('full');
  const [payAmount, setPayAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [reloadOpen, setReloadOpen] = useState(false);
  const [reloadAmount, setReloadAmount] = useState('');
  const [reloadNotes, setReloadNotes] = useState('');

  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<CreditCardInvoice | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<CreditCardPurchase | null>(null);
  const [editingReload, setEditingReload] = useState<CreditCardReload | null>(null);
  const [deleteConfirmPurchase, setDeleteConfirmPurchase] = useState<CreditCardPurchase | null>(null);
  const [editingLimit, setEditingLimit] = useState(false);
  const [editingLimitAmount, setEditingLimitAmount] = useState('');
  const [editingPurchaseAmount, setEditingPurchaseAmount] = useState('');
  const [editingInvoiceAmount, setEditingInvoiceAmount] = useState('');
  const [editingInvoiceStatus, setEditingInvoiceStatus] = useState('');
  const [editingInvoicePaidAmount, setEditingInvoicePaidAmount] = useState('');
  const [editingInvoicePaymentDate, setEditingInvoicePaymentDate] = useState('');
  const [editingReloadAmount, setEditingReloadAmount] = useState('');
  const [editingReloadDate, setEditingReloadDate] = useState('');
  const [editingReloadNotes, setEditingReloadNotes] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [inv, pur, rel] = await Promise.all([
        cardService.listInvoices(card.id, userId),
        cardService.listPurchases(card.id, userId),
        card.type === 'prepaid' ? cardService.listReloads(card.id, userId) : Promise.resolve([]),
      ]);
      setInvoices(inv);
      setPurchases(pur);
      setReloads(rel);
    } catch (e) {
      console.error(e);
    }
  }, [card.id, userId, card.type]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (editingPurchase) {
      const amount = editingPurchase.totalAmount;
      setEditingPurchaseAmount(amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else {
      setEditingPurchaseAmount('');
    }
  }, [editingPurchase]);

  useEffect(() => {
    if (editingLimit && balance) {
      // Converte o valor numérico para dígitos para o CurrencyInput (ex: 300 -> "30000" para mostrar 300,00)
      const limitNumber = balance.limit;
      const digitsOnly = String(Math.round(limitNumber * 100));
      setEditingLimitAmount(digitsOnly);
    } else {
      setEditingLimitAmount('');
    }
  }, [editingLimit, balance]);

  useEffect(() => {
    if (editingInvoice) {
      setEditingInvoiceAmount(editingInvoice.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      setEditingInvoiceStatus(editingInvoice.status);
      setEditingInvoicePaidAmount(editingInvoice.paidAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '');
      setEditingInvoicePaymentDate(editingInvoice.paymentDate || '');
    } else {
      setEditingInvoiceAmount('');
      setEditingInvoiceStatus('');
      setEditingInvoicePaidAmount('');
      setEditingInvoicePaymentDate('');
    }
  }, [editingInvoice]);

  useEffect(() => {
    if (editingReload) {
      setEditingReloadAmount(editingReload.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      setEditingReloadDate(editingReload.reloadDate);
      setEditingReloadNotes(editingReload.notes || '');
    } else {
      setEditingReloadAmount('');
      setEditingReloadDate('');
      setEditingReloadNotes('');
    }
  }, [editingReload]);

  const handlePayInvoice = async (invoiceId: string, totalAmount: number) => {
    setActionLoading(true);
    try {
      // Usa automaticamente a categoria "Cartão de Crédito" (subcategoria de "Contas")
      const creditCardCategoryId = '508d544c-7273-4158-8aa9-74068c110c6f';
      await cardService.payInvoice(
        invoiceId,
        userId,
        payType,
        payType === 'partial' ? parseFloat(payAmount) : totalAmount,
        creditCardCategoryId
      );
      setPayingId(null);
      setPayAmount('');
      await loadData();
      onReload();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddReload = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await cardService.addReload(card.id, userId, parseCurrencyToNumber(reloadAmount), reloadNotes || undefined);
      setReloadOpen(false);
      setReloadAmount('');
      setReloadNotes('');
      await loadData();
      onReload();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePurchase = async (purchase: CreditCardPurchase) => {
    if (!userId || userId === '') {
      console.error('userId is undefined or empty:', userId);
      return;
    }
    setActionLoading(true);
    try {
      await cardService.deletePurchase(purchase.id, userId);
      setDeleteConfirmPurchase(null);
      await loadData();
      onReload();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePurchase = async (data: any) => {
    if (!editingPurchase || !userId || userId === '') {
      console.error('editingPurchase or userId is undefined/empty:', { editingPurchase, userId });
      return;
    }
    setActionLoading(true);
    try {
      const parseCurrencyToNumber = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
      const processedData = {
        ...data,
        totalAmount: parseCurrencyToNumber(editingPurchaseAmount),
      };
      await cardService.updatePurchase(editingPurchase.id, userId, processedData);
      setEditingPurchase(null);
      setEditingPurchaseAmount('');
      await loadData();
      onReload();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateLimit = async () => {
    if (!userId || userId === '') {
      console.error('userId is undefined or empty:', userId);
      return;
    }
    setActionLoading(true);
    try {
      // Converte dígitos para valor formatado (ex: "30000" -> "300,00")
      const numericValue = parseInt(editingLimitAmount, 10) / 100;
      const formattedValue = numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      await cardService.patchCard(card.id, userId, { creditLimit: formattedValue });
      setEditingLimit(false);
      setEditingLimitAmount('');
      await loadData();
      onReload();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateInvoice = async () => {
    if (!editingInvoice || !userId || userId === '') {
      console.error('editingInvoice or userId is undefined/empty:', { editingInvoice, userId });
      return;
    }
    setActionLoading(true);
    try {
      const parseCurrencyToNumber = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
      const data: any = {};
      if (editingInvoiceAmount) data.totalAmount = parseCurrencyToNumber(editingInvoiceAmount);
      if (editingInvoiceStatus) data.status = editingInvoiceStatus;
      if (editingInvoicePaidAmount) data.paidAmount = parseCurrencyToNumber(editingInvoicePaidAmount);
      if (editingInvoicePaymentDate) data.paymentDate = editingInvoicePaymentDate;
      
      await cardService.updateInvoice(editingInvoice.id, userId, data);
      setEditingInvoice(null);
      setEditingInvoiceAmount('');
      setEditingInvoiceStatus('');
      setEditingInvoicePaidAmount('');
      setEditingInvoicePaymentDate('');
      await loadData();
      onReload();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateReload = async () => {
    if (!editingReload || !userId || userId === '') {
      console.error('editingReload or userId is undefined/empty:', { editingReload, userId });
      return;
    }
    setActionLoading(true);
    try {
      const parseCurrencyToNumber = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
      const data: any = {};
      if (editingReloadAmount) data.amount = parseCurrencyToNumber(editingReloadAmount);
      if (editingReloadDate) data.reloadDate = editingReloadDate;
      if (editingReloadNotes !== undefined) data.notes = editingReloadNotes;
      
      await cardService.updateReload(editingReload.id, userId, data);
      setEditingReload(null);
      setEditingReloadAmount('');
      setEditingReloadDate('');
      setEditingReloadNotes('');
      await loadData();
      onReload();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'invoices',  label: t('invoicesTab'),  icon: <Receipt className="h-3.5 w-3.5" />,     count: invoices.length },
    { key: 'purchases', label: t('purchasesTab'),  icon: <ShoppingBag className="h-3.5 w-3.5" />, count: purchases.length },
    ...(card.type === 'prepaid'
      ? [{ key: 'reloads' as Tab, label: t('reloadsTab'), icon: <RefreshCw className="h-3.5 w-3.5" />, count: reloads.length }]
      : []),
  ];

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Balance strip */}
      {balance && (
        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 border-b border-slate-200">
          <div className="px-5 py-3">
            <div className="flex items-center gap-2">
              <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-0.5">{t('limit')}</p>
              <button
                type="button"
                onClick={() => setEditingLimit(true)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title={t('editLimit')}
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
            {editingLimit ? (
              <div className="flex items-center gap-1">
                <CurrencyInput
                  value={editingLimitAmount}
                  onChange={setEditingLimitAmount}
                  className="h-6 text-xs w-20"
                />
                <button
                  type="button"
                  onClick={handleUpdateLimit}
                  disabled={actionLoading}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  {actionLoading ? '...' : '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingLimit(false); setEditingLimitAmount(''); }}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-800">{fmt(balance.limit)}</p>
            )}
          </div>
          <div className="px-5 py-3">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-0.5">{t('currentInvoice')}</p>
            <p className="text-sm font-semibold text-slate-800">{fmt(balance.currentInvoice)}</p>
          </div>
          <div className="px-5 py-3">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-0.5">{t('available')}</p>
            <p className={cn('text-sm font-semibold', balance.available < 0 ? 'text-red-500' : 'text-green-600')}>
              {fmt(balance.available)}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 gap-1">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-all',
              tab === tabItem.key
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            {tabItem.icon}
            {tabItem.label}
            {(tabItem.count ?? 0) > 0 && (
              <span className={cn(
                'ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                tab === tabItem.key ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
              )}>
                {tabItem.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5 min-h-[200px]">
        {/* ── FATURAS ── */}
        {tab === 'invoices' && (
              <div className="space-y-2.5">
                {invoices.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t('noInvoices')}</p>
                  </div>
                ) : invoices.map((inv) => {
                  const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.closed;
                  const isExpanded = expandedInvoice === inv.id;
                  const isPaying = payingId === inv.id;
                  return (
                    <div key={inv.id} className="rounded-xl border border-slate-100 overflow-hidden">
                      <div
                        onClick={() => setExpandedInvoice(isExpanded ? null : inv.id)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn('flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border', cfg.color)}>
                            {cfg.icon} {cfg.label}
                          </span>
                          <span className="text-sm font-medium text-slate-700">{fmtDate(inv.billingMonth)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-900">{fmt(inv.totalAmount)}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setEditingInvoice(inv); }}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-400" />
                          </button>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3">
                          {inv.installments && inv.installments.length > 0 ? (
                            <div className="space-y-1">
                              {inv.installments.map((inst) => (
                                <div key={inst.id} className="flex justify-between text-xs text-slate-600">
                                  <span>{t('installment')} {inst.installmentNumber}</span>
                                  <span>{fmt(inst.amount)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400">{t('noInstallments')}</p>
                          )}

                          {inv.status === 'closed' && (
                            <>
                              {isPaying ? (
                                <div className="space-y-2">
                                  <Select value={payType} onValueChange={(v) => setPayType(v as 'full' | 'partial')}>
                                    <SelectTrigger className="h-9 bg-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="full">{t('payFull', { amount: fmt(inv.totalAmount) })}</SelectItem>
                                      <SelectItem value="partial">{t('payPartial')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {payType === 'partial' && (
                                    <CurrencyInput
                                      placeholder={t('value')}
                                      value={payAmount}
                                      onChange={setPayAmount}
                                      className="h-8 text-xs bg-white"
                                    />
                                  )}
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      className="flex-1 h-8"
                                      disabled={actionLoading || (payType === 'partial' && !payAmount)}
                                      onClick={() => handlePayInvoice(inv.id, inv.totalAmount)}
                                    >
                                      {actionLoading ? '...' : t('confirmPayment')}
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8" onClick={() => setPayingId(null)}>
                                      {t('cancel')}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full h-8 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                  onClick={() => { setPayingId(inv.id); setPayType('full'); setPayAmount(''); }}
                                >
                                  {t('payInvoice')}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── COMPRAS ── */}
            {tab === 'purchases' && (
              <div className="space-y-2.5">
                {purchases.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t('noPurchases')}</p>
                    <p className="text-xs mt-1">{t('noPurchasesHint')}</p>
                  </div>
                ) : purchases.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition-colors group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{p.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {p.installments}x · {new Date(p.purchaseDate).toLocaleDateString(locale)}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-bold text-slate-900">{fmt(p.totalAmount)}</p>
                      <p className="text-xs text-slate-400">{fmt(p.installmentAmount)}{t('perMonth')}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-3 opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setEditingPurchase(p)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                        title={t('editPurchase')}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmPurchase(p)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"
                        title={t('deletePurchase')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── RECARGAS ── */}
            {tab === 'reloads' && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setReloadOpen((v) => !v)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('addReload')}
                </button>

                {reloadOpen && (
                  <form onSubmit={handleAddReload} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50">
                    <div className="space-y-1">
                      <Label className="text-xs">{t('reloadAmount')}</Label>
                      <CurrencyInput
                        value={reloadAmount}
                        onChange={(value) => setReloadAmount(value)}
                        placeholder="0,00"
                        required className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('notesOptional')}</Label>
                      <Input
                        value={reloadNotes}
                        onChange={(e) => setReloadNotes(e.target.value)}
                        placeholder={t('notesPlaceholder')}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="flex-1 h-8" disabled={actionLoading || !reloadAmount}>
                        {actionLoading ? '...' : t('confirm')}
                      </Button>
                      <Button type="button" size="sm" variant="outline" className="h-8" onClick={() => setReloadOpen(false)}>
                        {t('cancel')}
                      </Button>
                    </div>
                  </form>
                )}

                {reloads.length === 0 && !reloadOpen ? (
                  <div className="text-center py-8 text-slate-400">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t('noReloads')}</p>
                  </div>
                ) : reloads.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{fmt(r.amount)}</p>
                      {r.notes && <p className="text-xs text-slate-400 mt-0.5">{r.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-slate-400">{new Date(r.reloadDate).toLocaleDateString(locale)}</p>
                      <button
                        type="button"
                        onClick={() => setEditingReload(r)}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </div>

      {/* Edit Purchase Modal */}
      <Dialog open={!!editingPurchase} onOpenChange={(open) => !open && setEditingPurchase(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{t('editPurchase')}</DialogTitle>
            <DialogDescription>{t('editPurchaseDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdatePurchase({ description: editingPurchase?.description, installments: editingPurchase?.installments.toString(), purchaseDate: editingPurchase?.purchaseDate, firstBillingMonth: editingPurchase?.firstBillingMonth, categoryId: editingPurchase?.categoryId }); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('description')}</Label>
              <Input
                value={editingPurchase?.description || ''}
                onChange={(e) => setEditingPurchase(prev => prev ? { ...prev, description: e.target.value } : null)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('totalAmount')}</Label>
              <CurrencyInput
                value={editingPurchaseAmount}
                onChange={setEditingPurchaseAmount}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('installments')}</Label>
                <Input
                  type="number"
                  min="1"
                  max="48"
                  value={editingPurchase?.installments || 1}
                  onChange={(e) => setEditingPurchase(prev => prev ? { ...prev, installments: parseInt(e.target.value) || 1 } : null)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('purchaseDate')}</Label>
                <Input
                  type="date"
                  value={editingPurchase?.purchaseDate || ''}
                  onChange={(e) => setEditingPurchase(prev => prev ? { ...prev, purchaseDate: e.target.value } : null)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t('firstInvoice')}</Label>
              <Input
                type="month"
                value={editingPurchase?.firstBillingMonth || ''}
                onChange={(e) => setEditingPurchase(prev => prev ? { ...prev, firstBillingMonth: e.target.value } : null)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingPurchase(null)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? t('saving') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Modal */}
      <Dialog open={!!editingInvoice} onOpenChange={(open) => !open && setEditingInvoice(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{t('editInvoice')}</DialogTitle>
            <DialogDescription>{t('editInvoiceDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateInvoice(); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('totalAmount')}</Label>
              <CurrencyInput
                value={editingInvoiceAmount}
                onChange={setEditingInvoiceAmount}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('status')}</Label>
              <Select value={editingInvoiceStatus} onValueChange={setEditingInvoiceStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">{t('payStatus.open')}</SelectItem>
                  <SelectItem value="closed">{t('payStatus.closed')}</SelectItem>
                  <SelectItem value="paid">{t('payStatus.paid')}</SelectItem>
                  <SelectItem value="partial">{t('payStatus.partial')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('paidAmount')}</Label>
              <CurrencyInput
                value={editingInvoicePaidAmount}
                onChange={setEditingInvoicePaidAmount}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('paymentDate')}</Label>
              <Input
                type="date"
                value={editingInvoicePaymentDate}
                onChange={(e) => setEditingInvoicePaymentDate(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingInvoice(null)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? t('saving') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Reload Modal */}
      <Dialog open={!!editingReload} onOpenChange={(open) => !open && setEditingReload(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{t('editReload')}</DialogTitle>
            <DialogDescription>{t('editReloadDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateReload(); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('value')}</Label>
              <CurrencyInput
                value={editingReloadAmount}
                onChange={setEditingReloadAmount}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('date')}</Label>
              <Input
                type="date"
                value={editingReloadDate}
                onChange={(e) => setEditingReloadDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('notes')}</Label>
              <Input
                value={editingReloadNotes}
                onChange={(e) => setEditingReloadNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingReload(null)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? t('saving') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmPurchase} onOpenChange={(open) => !open && setDeleteConfirmPurchase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deletePurchase')}</DialogTitle>
            <DialogDescription>
              {deleteConfirmPurchase && t('deletePurchaseDescription', { description: deleteConfirmPurchase.description })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmPurchase(null)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirmPurchase && handleDeletePurchase(deleteConfirmPurchase)} disabled={actionLoading}>
              {actionLoading ? t('deleting') : t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
