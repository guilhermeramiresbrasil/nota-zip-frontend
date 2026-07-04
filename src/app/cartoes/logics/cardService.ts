import { generateCorrelationId } from '@/lib/utils';
import {
  CreditCard,
  CardBalance,
  CreditCardPurchase,
  CreditCardInvoice,
  CreditCardReload,
  CreateCardFormData,
  CreatePurchaseFormData,
} from '../types/card.types';

const GATEWAY_URL = 'https://api.notazip.com.br';

class CardService {
  private static instance: CardService;

  private constructor() {}

  static getInstance(): CardService {
    if (!CardService.instance) {
      CardService.instance = new CardService();
    }
    return CardService.instance;
  }

  private getHeaders(): Record<string, string> {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return {
      'Content-Type': 'application/json',
      'x-correlation-id': generateCorrelationId(),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
  }

  async listCards(userId: string): Promise<CreditCard[]> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/?userId=${userId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Erro ao listar cartões');
    const result = await res.json();
    return result.data || [];
  }

  async createCard(userId: string, data: CreateCardFormData): Promise<CreditCard> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...data,
        userId,
        creditLimit: parseFloat(data.creditLimit),
        closingDay: parseInt(data.closingDay),
        dueDay: parseInt(data.dueDay),
      }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro ao criar cartão'); }
    const result = await res.json();
    return result.data;
  }

  async patchCard(id: string, userId: string, data: Partial<CreateCardFormData>): Promise<CreditCard> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/${id}?userId=${userId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro ao atualizar cartão'); }
    const result = await res.json();
    return result.data;
  }

  async deleteCard(id: string, userId: string): Promise<void> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/${id}?userId=${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro ao deletar cartão'); }
  }

  async getCardBalance(cardId: string, userId: string): Promise<CardBalance> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/${cardId}/balance?userId=${userId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Erro ao buscar saldo');
    const result = await res.json();
    return result.data;
  }

  async listPurchases(cardId: string, userId: string): Promise<CreditCardPurchase[]> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/${cardId}/purchases?userId=${userId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Erro ao listar compras');
    const result = await res.json();
    return result.data || [];
  }

  async createPurchase(cardId: string, userId: string, data: CreatePurchaseFormData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const nowMonth = new Date().toISOString().slice(0, 7);
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/${cardId}/purchases`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        userId,
        categoryId: data.categoryId,
        description: data.description,
        totalAmount: parseFloat(data.totalAmount),
        installments: parseInt(data.installments) || 1,
        purchaseDate: data.purchaseDate || today,
        firstBillingMonth: data.firstBillingMonth || nowMonth,
      }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro ao criar compra'); }
  }

  async deletePurchase(id: string, userId: string): Promise<void> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/purchases/${id}?userId=${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro ao deletar compra'); }
  }

  async listInvoices(cardId: string, userId: string): Promise<CreditCardInvoice[]> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/${cardId}/invoices?userId=${userId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Erro ao listar faturas');
    const result = await res.json();
    return result.data || [];
  }

  async getInvoice(id: string, userId: string): Promise<CreditCardInvoice> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/invoices/${id}?userId=${userId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Erro ao buscar fatura');
    const result = await res.json();
    return result.data;
  }

  async payInvoice(
    id: string,
    userId: string,
    paymentType: 'full' | 'partial',
    paidAmount?: number,
    categoryId?: string
  ): Promise<void> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/invoices/${id}/pay`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId, paymentType, paidAmount, categoryId }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro ao pagar fatura'); }
  }

  async addReload(cardId: string, userId: string, amount: number, notes?: string): Promise<CreditCardReload> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/${cardId}/reloads`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        userId,
        amount,
        notes,
        reloadDate: new Date().toISOString().split('T')[0],
      }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro ao adicionar recarga'); }
    const result = await res.json();
    return result.data;
  }

  async listReloads(cardId: string, userId: string): Promise<CreditCardReload[]> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/${cardId}/reloads?userId=${userId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Erro ao listar recargas');
    const result = await res.json();
    return result.data || [];
  }
}

export const cardService = CardService.getInstance();
