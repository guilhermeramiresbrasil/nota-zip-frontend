'use client';

import React, { useState, useEffect } from 'react';
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

const COLORS = [
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'purple', label: 'Roxo' },
  { value: 'orange', label: 'Laranja' },
  { value: 'red', label: 'Vermelho' },
  { value: 'slate', label: 'Cinza' },
];

export function CardForm({ open, onOpenChange, initialData, onSubmit, title }: CardFormProps) {
  const [form, setForm] = useState<CreateCardFormData>(BLANK_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Nome é obrigatório'); return; }
    if (!form.creditLimit || parseFloat(form.creditLimit) <= 0) { setError('Limite inválido'); return; }
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cartão');
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
          <DialogDescription>Preencha os dados do cartão</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome do cartão</Label>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ex: Nubank, Inter..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => set('type', v as CardType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Crédito</SelectItem>
                  <SelectItem value="prepaid">Pré-pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subtipo</Label>
              <Select value={form.cardSubtype || 'standard'} onValueChange={(v) => set('cardSubtype', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Padrão</SelectItem>
                  <SelectItem value="vr_va">VR / VA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isPrepaid && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Modo de débito</Label>
                <Select value={form.debitMode || 'invoice'} onValueChange={(v) => set('debitMode', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoice">Fatura (pós)</SelectItem>
                    <SelectItem value="direct">Débito direto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de recarga</Label>
                <Select value={form.reloadType || 'manual'} onValueChange={(v) => set('reloadType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="periodic">Periódica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{isPrepaid ? 'Saldo inicial' : 'Limite (R$)'}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.creditLimit}
                onChange={(e) => set('creditLimit', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>4 últimos dígitos</Label>
              <Input
                maxLength={4}
                pattern="\d{4}"
                placeholder="0000"
                value={form.lastFourDigits}
                onChange={(e) => set('lastFourDigits', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Dia de fechamento</Label>
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
              <Label>Dia de vencimento</Label>
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
              <Label>Titular</Label>
              <Select value={form.owner} onValueChange={(v) => set('owner', v as CardOwner)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Meu cartão</SelectItem>
                  <SelectItem value="borrowed">Emprestado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <Select value={form.color || 'blue'} onValueChange={(v) => set('color', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Label>Nome do titular</Label>
              <Input
                value={form.ownerName || ''}
                onChange={(e) => set('ownerName', e.target.value)}
                placeholder="Nome do dono do cartão"
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
