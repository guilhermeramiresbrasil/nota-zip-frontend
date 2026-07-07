export type CardType = 'credit' | 'prepaid';
export type CardSubtype = 'standard' | 'vr_va';
export type DebitMode = 'invoice' | 'direct';
export type ReloadType = 'manual' | 'periodic';
export type CardOwner = 'self' | 'borrowed';
export type InvoiceStatus = 'open' | 'closed' | 'paid' | 'partial';
export type InstallmentStatus = 'pending' | 'billed' | 'paid';
export type PaymentType = 'full' | 'partial';

export type PaymentMethod =
  | 'pix'
  | 'boleto'
  | 'debit_card'
  | 'cash'
  | 'credit_card'
  | 'vr_va'
  | 'prepaid_debit';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix',
  boleto: 'Boleto',
  debit_card: 'Débito',
  cash: 'Dinheiro',
  credit_card: 'Cartão de crédito',
  vr_va: 'VR/VA',
  prepaid_debit: 'Pré-pago',
};

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  type: CardType;
  cardSubtype?: CardSubtype;
  debitMode?: DebitMode;
  lastFourDigits?: string;
  creditLimit: number;
  reloadType?: ReloadType;
  closingDay: number;
  dueDay: number;
  owner: CardOwner;
  ownerName?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CardBalance {
  limit: number;
  used: number;
  available: number;
  currentInvoice: number;
}

export interface CreditCardPurchase {
  id: string;
  userId: string;
  cardId: string;
  categoryId: string;
  description: string;
  totalAmount: number;
  installments: number;
  installmentAmount: number;
  purchaseDate: string;
  firstBillingMonth: string;
  tags?: string[];
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCardInstallment {
  id: string;
  purchaseId: string;
  cardId: string;
  userId: string;
  installmentNumber: number;
  billingMonth: string;
  amount: number;
  status: InstallmentStatus;
}

export interface CreditCardInvoice {
  id: string;
  cardId: string;
  userId: string;
  billingMonth: string;
  totalAmount: number;
  paidAmount?: number;
  paymentType?: PaymentType;
  paymentDate?: string;
  status: InvoiceStatus;
  transactionId?: string;
  installments?: CreditCardInstallment[];
}

export interface CreditCardReload {
  id: string;
  cardId: string;
  userId: string;
  amount: number;
  reloadDate: string;
  notes?: string;
}

export interface CreateCardFormData {
  name: string;
  type: CardType;
  cardSubtype?: CardSubtype;
  debitMode?: DebitMode;
  lastFourDigits?: string;
  creditLimit: string;
  reloadType?: ReloadType;
  closingDay: string;
  dueDay: string;
  owner: CardOwner;
  ownerName?: string;
  color?: string;
  icon?: string;
}

export interface CreatePurchaseFormData {
  categoryId: string;
  description: string;
  totalAmount: string;
  installments: string;
  purchaseDate: string;
  firstBillingMonth: string;
}
