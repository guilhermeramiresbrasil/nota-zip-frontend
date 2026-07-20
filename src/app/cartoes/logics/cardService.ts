import { generateCorrelationId } from '@/lib/utils';
import * as cryptoClient from '@/lib/crypto/cryptoClient';
import {
  CreditCard,
  CardBalance,
  CreditCardPurchase,
  CreditCardInvoice,
  CreditCardReload,
  CreateCardFormData,
  CreatePurchaseFormData,
} from '../types/card.types';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const parseCurrencyToNumber = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;

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
    if (!res.ok) { 
      const err = await res.json(); 
      console.error('List cards error:', err);
      throw new Error(err.error || err.message || 'Erro ao listar cartões'); 
    }
    const result = await res.json();
    const cards = result.data || [];
    return Promise.all(
      cards.map(async (card: any) => ({
        ...card,
        ownerName: await cryptoClient.maybeDecryptField(card.ownerName),
      }))
    );
  }

  async createCard(userId: string, data: CreateCardFormData): Promise<CreditCard> {
    const parseCurrencyToNumber = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;

    const encryptedOwnerName = data.ownerName
      ? await cryptoClient.encryptField(data.ownerName)
      : undefined;

    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...data,
        userId,
        creditLimit: parseCurrencyToNumber(data.creditLimit),
        closingDay: parseInt(data.closingDay),
        dueDay: parseInt(data.dueDay),
        ownerName: encryptedOwnerName,
      }),
    });
    if (!res.ok) { 
      const err = await res.json(); 
      console.error('Card creation error:', err);
      throw new Error(err.error || err.message || 'Erro ao criar cartão'); 
    }
    const result = await res.json();
    return result.data;
  }

  async patchCard(id: string, userId: string, data: Partial<CreateCardFormData>): Promise<CreditCard> {
    const parseCurrencyToNumber = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;

    const processedData: any = {};

    if (data.name !== undefined) processedData.name = data.name;
    if (data.type !== undefined) processedData.type = data.type;
    if (data.cardSubtype !== undefined && data.cardSubtype !== null) processedData.cardSubtype = data.cardSubtype;
    if (data.debitMode !== undefined && data.debitMode !== null) processedData.debitMode = data.debitMode;
    if (data.lastFourDigits !== undefined) processedData.lastFourDigits = data.lastFourDigits;
    if (data.creditLimit !== undefined) processedData.creditLimit = parseCurrencyToNumber(data.creditLimit);
    if (data.reloadType !== undefined && data.reloadType !== null) processedData.reloadType = data.reloadType;
    if (data.closingDay !== undefined) processedData.closingDay = parseInt(data.closingDay);
    if (data.dueDay !== undefined) processedData.dueDay = parseInt(data.dueDay);
    if (data.owner !== undefined) processedData.owner = data.owner;
    if (data.ownerName !== undefined) processedData.ownerName = data.ownerName
      ? await cryptoClient.encryptField(data.ownerName)
      : undefined;
    if (data.color !== undefined && data.color !== null) processedData.color = data.color;
    if (data.icon !== undefined && data.icon !== null) processedData.icon = data.icon;

    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/${id}?userId=${userId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(processedData),
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
    const purchases = result.data || [];
    return Promise.all(
      purchases.map(async (p: any) => ({
        ...p,
        description: (await cryptoClient.maybeDecryptField(p.description)) ?? p.description ?? '',
      }))
    );
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
        description: await cryptoClient.encryptField(data.description || ''),
        totalAmount: parseCurrencyToNumber(data.totalAmount),
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

  async updatePurchase(id: string, userId: string, data: CreatePurchaseFormData): Promise<void> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/purchases/${id}?userId=${userId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({
        categoryId: data.categoryId,
        description: await cryptoClient.encryptField(data.description || ''),
        totalAmount: parseCurrencyToNumber(data.totalAmount),
        installments: parseInt(data.installments) || 1,
        purchaseDate: data.purchaseDate,
        firstBillingMonth: data.firstBillingMonth,
      }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro ao atualizar compra'); }
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

  async updateInvoice(id: string, userId: string, data: any): Promise<void> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/invoices/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId, ...data }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro ao atualizar fatura'); }
  }

  async updateReload(id: string, userId: string, data: any): Promise<void> {
    const payload = { userId, ...data };
    if (payload.notes !== undefined) {
      payload.notes = payload.notes ? await cryptoClient.encryptField(payload.notes) : undefined;
    }
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/reloads/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro ao atualizar recarga'); }
  }

  async addReload(cardId: string, userId: string, amount: number, notes?: string): Promise<CreditCardReload> {
    const res = await fetch(`${GATEWAY_URL}/api/credit-cards/${cardId}/reloads`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        userId,
        amount,
        notes: notes ? await cryptoClient.encryptField(notes) : undefined,
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
    const reloads = result.data || [];
    return Promise.all(
      reloads.map(async (r: any) => ({
        ...r,
        notes: await cryptoClient.maybeDecryptField(r.notes),
      }))
    );
  }
}

export const cardService = CardService.getInstance();
