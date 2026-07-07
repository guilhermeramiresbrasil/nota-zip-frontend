'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { cardService } from './logics/cardService';
import { CreditCard, CardBalance, CreateCardFormData } from './types/card.types';
import { CardList } from './components/CardList';
import { CardForm } from './components/CardForm';
import { CardDetailPanel } from './components/CardDetailPanel';
import { Button } from '@/components/ui/button';
import { PlusCircle, CreditCard as CreditCardIcon } from 'lucide-react';

export default function CartoesPage() {
  return (
    <ProtectedRoute>
      <CartoesContent />
    </ProtectedRoute>
  );
}

function CartoesContent() {
  const { user } = useAuth();
  const userId = user?.id || '';

  const [cards, setCards] = useState<CreditCard[]>([]);
  const [balances, setBalances] = useState<Record<string, CardBalance>>({});
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editCard, setEditCard] = useState<CreditCard | null>(null);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  const loadCards = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await cardService.listCards(userId);
      setCards(data);
      const balanceMap: Record<string, CardBalance> = {};
      await Promise.all(
        data.map(async (card) => {
          try {
            balanceMap[card.id] = await cardService.getCardBalance(card.id, userId);
          } catch {
            balanceMap[card.id] = { limit: card.creditLimit, used: 0, available: card.creditLimit, currentInvoice: 0 };
          }
        })
      );
      setBalances(balanceMap);
      // Auto-selecionar o primeiro cartão
      if (data.length > 0 && !selectedCard) {
        setSelectedCard(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handleSelect = (card: CreditCard) => {
    setSelectedCard((prev) => prev?.id === card.id ? null : card);
  };

  const handleCreateCard = async (data: CreateCardFormData) => {
    await cardService.createCard(userId, data);
    setFormOpen(false);
    loadCards();
  };

  const handleEditCard = async (data: CreateCardFormData) => {
    if (!editCard) return;
    await cardService.patchCard(editCard.id, userId, data);
    setEditCard(null);
    loadCards();
  };

  const handleDeleteCard = async (id: string) => {
    if (selectedCard?.id === id) setSelectedCard(null);
    await cardService.deleteCard(id, userId);
    loadCards();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CreditCardIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cartões</h1>
              <p className="text-muted-foreground text-sm">Clique em um cartão para ver detalhes</p>
            </div>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Novo Cartão
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20">
            <CreditCardIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">Nenhum cartão cadastrado</h2>
            <p className="text-muted-foreground mb-6">Adicione seus cartões para controlar suas faturas</p>
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Adicionar cartão
            </Button>
          </div>
        ) : (
          <>
            <CardList
              cards={cards}
              balances={balances}
              selectedId={selectedCard?.id}
              onSelect={handleSelect}
              onEdit={(card: CreditCard) => setEditCard(card)}
              onDelete={handleDeleteCard}
            />

            {selectedCard && (
              <CardDetailPanel
                key={selectedCard.id}
                card={selectedCard}
                userId={userId}
                balance={balances[selectedCard.id] ?? null}
                onReload={loadCards}
              />
            )}
          </>
        )}
      </div>

      <CardForm
        open={formOpen || !!editCard}
        onOpenChange={(open: boolean) => { if (!open) { setFormOpen(false); setEditCard(null); } }}
        initialData={editCard || undefined}
        onSubmit={editCard ? handleEditCard : handleCreateCard}
        title={editCard ? 'Editar Cartão' : 'Novo Cartão'}
      />
    </div>
  );
}
