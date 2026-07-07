'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { CreditCard, CardBalance } from '../types/card.types';
import { CardItem } from './CardItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CardListProps {
  cards: CreditCard[];
  balances: Record<string, CardBalance>;
  selectedId?: string;
  onSelect: (card: CreditCard) => void;
  onEdit: (card: CreditCard) => void;
  onDelete: (id: string) => void;
}

export function CardList({ cards, balances, selectedId, onSelect, onEdit, onDelete }: CardListProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelectCarousel = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelectCarousel();
    emblaApi.on('select', onSelectCarousel);
    emblaApi.on('reInit', onSelectCarousel);
  }, [emblaApi, onSelectCarousel]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 py-2">
          {cards.map((card) => (
            <div key={card.id} className="flex-[0_0_320px]">
              <CardItem
                card={card}
                balance={balances[card.id]}
                selected={selectedId === card.id}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      </div>

      {cards.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm transition-opacity',
              !prevBtnEnabled && 'opacity-0 pointer-events-none'
            )}
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm transition-opacity',
              !nextBtnEnabled && 'opacity-0 pointer-events-none'
            )}
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
