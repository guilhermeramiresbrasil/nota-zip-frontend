'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { CurrencyInput } from '@/components/ui/currency-input';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, CreateCardFormData, CardType, CardOwner } from '../types/card.types';

interface CardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CreditCard;
  onSubmit: (data: CreateCardFormData) => Promise<void>;
  title: string;
}

const BLANK_FORM: CreateCardFormData = {
  name: '',
  type: 'credit',
  lastFourDigits: '',
  creditLimit: '',
  closingDay: '10',
  dueDay: '20',
  owner: 'self',
  ownerName: '',
  color: 'blue',
};

export function CardForm({ open, onOpenChange, initialData, onSubmit, title }: CardFormProps) {
  const [form, setForm] = useState<CreateCardFormData>(BLANK_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('cards');
  const { user } = useAuth();

  const COLORS = [
    { value: 'blue', label: t('blue') },
    { value: 'green', label: t('green') },
    { value: 'purple', label: t('purple') },
    { value: 'orange', label: t('orange') },
    { value: 'red', label: t('red') },
    { value: 'slate', label: t('slate') },
  ];

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        type: initialData.type,
        cardSubtype: initialData.cardSubtype,
        debitMode: initialData.debitMode,
        lastFourDigits: initialData.lastFourDigits || '',
        creditLimit: String(initialData.creditLimit),
        reloadType: initialData.reloadType,
        closingDay: String(initialData.closingDay),
        dueDay: String(initialData.dueDay),
        owner: initialData.owner,
        ownerName: initialData.ownerName || '',
        color: initialData.color || 'blue',
        icon: initialData.icon,
      });
    } else {
      setForm(BLANK_FORM);
    }
    setError('');
  }, [initialData, open]);

  const set = (key: keyof CreateCardFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const parseCurrencyToNumber = (v: string) => {
    if (user?.currency === 'USD') {
      return parseFloat(v.replace(/,/g, '')) || 0;
    }
    return parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError(t('nameRequired')); return; }
    const limitValue = parseCurrencyToNumber(form.creditLimit);
    if (!form.creditLimit || limitValue <= 0) { setError(t('invalidLimit')); return; }
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveError'));
    } finally {
      setLoading(false);
    }
  };

  const isPrepaid = form.type === 'prepaid';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t('cardDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>{t('cardName')}</Label>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder={t('cardNamePlaceholder')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t('type')}</Label>
              <Select value={form.type} onValueChange={(v) => set('type', v as CardType)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">{t('credit')}</SelectItem>
                  <SelectItem value="prepaid">{t('prepaid')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('subtype')}</Label>
              <Select value={form.cardSubtype || 'standard'} onValueChange={(v) => set('cardSubtype', v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">{t('standard')}</SelectItem>
                  <SelectItem value="vr_va">{t('vr_va')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isPrepaid && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('debitMode')}</Label>
                <Select value={form.debitMode || 'invoice'} onValueChange={(v) => set('debitMode', v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoice">{t('invoice')}</SelectItem>
                    <SelectItem value="direct">{t('direct')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('reloadType')}</Label>
                <Select value={form.reloadType || 'manual'} onValueChange={(v) => set('reloadType', v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">{t('manual')}</SelectItem>
                    <SelectItem value="periodic">{t('periodic')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{isPrepaid ? t('initialBalance') : t('limit')}</Label>
              <CurrencyInput
                value={form.creditLimit}
                onChange={(value) => set('creditLimit', value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('lastFourDigits')}</Label>
              <Input
                maxLength={4}
                pattern="\d{4}"
                placeholder={t('lastFourDigitsPlaceholder')}
                value={form.lastFourDigits}
                onChange={(e) => set('lastFourDigits', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t('closingDay')}</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={form.closingDay}
                onChange={(e) => set('closingDay', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('dueDay')}</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={form.dueDay}
                onChange={(e) => set('dueDay', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t('owner')}</Label>
              <Select value={form.owner} onValueChange={(v) => set('owner', v as CardOwner)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">{t('self')}</SelectItem>
                  <SelectItem value="borrowed">{t('borrowed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('color')}</Label>
              <Select value={form.color || 'blue'} onValueChange={(v) => set('color', v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COLORS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.owner === 'borrowed' && (
            <div className="space-y-2">
              <Label>{t('ownerName')}</Label>
              <Input
                value={form.ownerName || ''}
                onChange={(e) => set('ownerName', e.target.value)}
                placeholder={t('ownerNamePlaceholder')}
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
