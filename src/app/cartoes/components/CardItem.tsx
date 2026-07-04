'use client';

import React from 'react';
import { CreditCard, CardBalance } from '../types/card.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Eye, CreditCard as CardIcon, Wallet } from 'lucide-react';

interface CardItemProps {
  card: CreditCard;
  balance?: CardBalance;
  onEdit: (card: CreditCard) => void;
  onDelete: (id: string) => void;
  onViewDetail: (card: CreditCard) => void;
}

const CARD_COLORS: Record<string, string> = {
  blue: 'from-blue-600 to-blue-800',
  green: 'from-green-600 to-green-800',
  purple: 'from-purple-600 to-purple-800',
  orange: 'from-orange-500 to-orange-700',
  red: 'from-red-600 to-red-800',
  slate: 'from-slate-600 to-slate-800',
  default: 'from-gray-700 to-gray-900',
};

const TYPE_LABELS: Record<string, string> = {
  credit: 'Crédito',
  prepaid: 'Pré-pago',
};

const SUBTYPE_LABELS: Record<string, string> = {
  vr_va: 'VR/VA',
  standard: '',
};

export function CardItem({ card, balance, onEdit, onDelete, onViewDetail }: CardItemProps) {
  const gradient = CARD_COLORS[card.color || 'default'] || CARD_COLORS.default;
  const usedPct = balance ? Math.min((balance.used / balance.limit) * 100, 100) : 0;
  const isOverLimit = balance && balance.available < 0;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
      <div className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs text-white/70 uppercase tracking-wide">
              {TYPE_LABELS[card.type]}
              {card.cardSubtype === 'vr_va' ? ' · ' + SUBTYPE_LABELS.vr_va : ''}
              {card.owner === 'borrowed' ? ' · Emprestado' : ''}
            </p>
            <h3 className="font-semibold text-lg leading-tight">{card.name}</h3>
          </div>
          {card.type === 'credit' ? (
            <CardIcon className="h-8 w-8 text-white/50" />
          ) : (
            <Wallet className="h-8 w-8 text-white/50" />
          )}
        </div>
        <p className="text-white/60 text-sm font-mono">
          {card.lastFourDigits ? `•••• •••• •••• ${card.lastFourDigits}` : 'Sem número'}
        </p>
        <div className="flex justify-between mt-3 text-sm">
          <span className="text-white/60">Fecha dia {card.closingDay}</span>
          <span className="text-white/60">Vence dia {card.dueDay}</span>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {balance && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Utilizado</span>
              <span className={isOverLimit ? 'text-red-500 font-medium' : ''}>
                {formatCurrency(balance.used)} / {formatCurrency(balance.limit)}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${isOverLimit ? 'bg-red-500' : usedPct > 80 ? 'bg-yellow-500' : 'bg-primary'}`}
                style={{ width: `${Math.min(usedPct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-muted-foreground">Disponível</span>
              <span className={`font-medium ${isOverLimit ? 'text-red-500' : 'text-green-600'}`}>
                {formatCurrency(balance.available)}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 justify-between pt-1">
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs">
              Fatura: {formatCurrency(balance?.currentInvoice || 0)}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onViewDetail(card)}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(card)}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm(`Desativar cartão "${card.name}"?`)) onDelete(card.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
