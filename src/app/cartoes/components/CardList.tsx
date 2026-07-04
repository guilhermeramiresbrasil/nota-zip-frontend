'use client';

import React from 'react';
import { CreditCard, CardBalance } from '../types/card.types';
import { CardItem } from './CardItem';

interface CardListProps {
  cards: CreditCard[];
  balances: Record<string, CardBalance>;
  onEdit: (card: CreditCard) => void;
  onDelete: (id: string) => void;
  onViewDetail: (card: CreditCard) => void;
}

export function CardList({ cards, balances, onEdit, onDelete, onViewDetail }: CardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          balance={balances[card.id]}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
}
