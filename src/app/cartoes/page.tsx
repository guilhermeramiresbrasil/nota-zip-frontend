'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useViewMode } from '@/contexts/ViewModeContext';
import { cardService } from './logics/cardService';
import { CreditCard, CardBalance, CreateCardFormData } from './types/card.types';
import { CardList } from './components/CardList';
import { CardForm } from './components/CardForm';
import { CardDetailPanel } from './components/CardDetailPanel';
import { Button } from '@/components/ui/button';
import { PlusCircle, CreditCard as CreditCardIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartoesPage() {
  return (
    <ProtectedRoute>
      <CartoesContent />
    </ProtectedRoute>
  );
}

function CartoesContent() {
  const { user } = useAuth();
  const { isSharedView } = useViewMode();
  const userId = user?.id || '';

  const [cards, setCards] = useState<CreditCard[]>([]);
  const [balances, setBalances] = useState<Record<string, CardBalance>>({});
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editCard, setEditCard] = useState<CreditCard | null>(null);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);

  // Fetch shared group info to get partner ID
  useEffect(() => {
    if (!user?.id || user?.plan !== 'shared') return;
    const fetchSharedGroup = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/shared-groups/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();
        if (data.success && data.data) {
          const group = data.data;
          // Set partner ID based on whether user is owner or partner
          if (group.ownerId === user.id) {
            setPartnerId(group.partnerId);
          } else if (group.partnerId === user.id) {
            setPartnerId(group.ownerId);
          }
        }
      } catch (error) {
        console.error('Error fetching shared group:', error);
      }
    };
    fetchSharedGroup();
  }, [user?.id, user?.plan]);

  const loadCards = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      let data: CreditCard[] = [];

      // Fetch user's cards
      const userCards = await cardService.listCards(userId);
      data = [...userCards];

      // If in shared view and partner exists, fetch partner's cards
      if (isSharedView && partnerId) {
        const partnerCards = await cardService.listCards(partnerId);
        data = [...data, ...partnerCards];
      }

      setCards(data);
      const balanceMap: Record<string, CardBalance> = {};
      await Promise.all(
        data.map(async (card) => {
          try {
            const cardUserId = userCards.find(c => c.id === card.id) ? userId : partnerId || userId;
            balanceMap[card.id] = await cardService.getCardBalance(card.id, cardUserId);
          } catch {
            balanceMap[card.id] = { limit: card.creditLimit, used: 0, available: card.creditLimit, currentInvoice: 0 };
          }
        })
      );
      setBalances(balanceMap);
      // Auto-selecionar o primeiro cartão apenas se não houver nenhum selecionado
      if (data.length > 0 && !selectedCard) {
        setSelectedCard(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, isSharedView, partnerId]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handleSelect = (card: CreditCard) => {
    if (selectedCard?.id !== card.id) {
      const currentIndex = cards.findIndex(c => c.id === selectedCard?.id);
      const newIndex = cards.findIndex(c => c.id === card.id);
      setDirection(newIndex > currentIndex ? 1 : -1);
      setSelectedCard(card);
    }
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

            <AnimatePresence mode="wait">
              {selectedCard && userId && (
                <motion.div
                  initial={{ opacity: 0, x: direction * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -20 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  <CardDetailPanel
                    key={selectedCard.id}
                    card={selectedCard}
                    userId={userId}
                    balance={balances[selectedCard.id] ?? null}
                    onReload={loadCards}
                  />
                </motion.div>
              )}
            </AnimatePresence>
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
