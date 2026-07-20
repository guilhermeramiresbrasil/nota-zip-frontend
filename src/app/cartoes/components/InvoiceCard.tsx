import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCardInvoice, PAYMENT_METHOD_LABELS, PaymentMethod } from '../types/card.types';

interface InvoiceCardProps {
  invoice: CreditCardInvoice;
  cardName: string;
  cardLastFour?: string;
  onPay: (invoiceId: string, paymentType: 'full' | 'partial', paidAmount?: number, categoryId?: string) => void;
  onViewDetails?: (invoiceId: string) => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  cardName,
  cardLastFour,
  onPay,
  onViewDetails,
}) => {
  const t = useTranslations('cards');
  const { user } = useAuth();
  const isClosed = invoice.status === 'closed';
  const isPaid = invoice.status === 'paid';
  const isPartial = invoice.status === 'partial';
  const remainingAmount = invoice.totalAmount - (invoice.paidAmount || 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(user?.language || 'pt-BR', { month: 'long', year: 'numeric' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(user?.language || 'pt-BR', {
      style: 'currency',
      currency: user?.currency || 'BRL',
    }).format(value);
  };

  const getStatusColor = () => {
    if (isPaid) return 'text-green-600 bg-green-50';
    if (isClosed) return 'text-orange-600 bg-orange-50';
    if (isPartial) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getStatusIcon = () => {
    if (isPaid) return <CheckCircle2 className="h-4 w-4" />;
    if (isClosed) return <AlertCircle className="h-4 w-4" />;
    if (isPartial) return <AlertCircle className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isPaid) return t('paid');
    if (isClosed) return t('closed');
    if (isPartial) return t('partial');
    return t('open');
  };

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">
                {cardName} {cardLastFour && `•••• ${cardLastFour}`}
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                {t('invoiceMonth', { month: formatDate(invoice.billingMonth) })}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            {getStatusText()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">{t('totalValue')}:</span>
          </div>
          <span className="text-xl font-bold text-slate-800">
            {formatCurrency(invoice.totalAmount)}
          </span>
        </div>

        {isPartial && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">{t('alreadyPaid')}:</span>
            </div>
            <span className="text-lg font-semibold text-green-600">
              {formatCurrency(invoice.paidAmount || 0)}
            </span>
          </div>
        )}

        {isPartial && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{t('remaining')}:</span>
            </div>
            <span className="text-lg font-semibold text-orange-600">
              {formatCurrency(remainingAmount)}
            </span>
          </div>
        )}

        {invoice.paymentDate && (
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{t('paidOn')}:</span>
            <span>{new Date(invoice.paymentDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}

        {invoice.paymentType && (
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{t('method')}:</span>
            <span>{PAYMENT_METHOD_LABELS[invoice.paymentType as PaymentMethod]}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {isClosed && (
            <Button
              onClick={() => onPay(invoice.id, 'full')}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {t('payInvoice')}
            </Button>
          )}
          {isPartial && (
            <Button
              onClick={() => onPay(invoice.id, 'full', remainingAmount)}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {t('payRemaining')}
            </Button>
          )}
          {onViewDetails && (
            <Button
              onClick={() => onViewDetails(invoice.id)}
              variant="outline"
              className="flex-1"
            >
              {t('viewDetails')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
