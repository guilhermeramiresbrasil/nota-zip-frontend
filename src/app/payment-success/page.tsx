'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  const receiptUrl = searchParams.get('receipt_url');
  const captureMethod = searchParams.get('capture_method');
  const orderNsu = searchParams.get('order_nsu');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/home');
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const paymentMethodLabel = captureMethod === 'pix' ? 'Pix' : 'Cartão de crédito';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-10 pb-8 flex flex-col items-center text-center gap-6">
          <div className="rounded-full bg-green-100 dark:bg-green-900 p-5">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Pagamento confirmado!
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Seu plano foi ativado com sucesso.
            </p>
          </div>

          {(captureMethod || orderNsu) && (
            <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm text-left space-y-2">
              {captureMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Método</span>
                  <span className="font-medium">{paymentMethodLabel}</span>
                </div>
              )}
              {orderNsu && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Pedido</span>
                  <span className="font-medium font-mono text-xs">{orderNsu}</span>
                </div>
              )}
            </div>
          )}

          <div className="w-full flex flex-col gap-3">
            {receiptUrl && (
              <Button variant="outline" className="w-full gap-2" asChild>
                <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                  <Receipt className="w-4 h-4" />
                  Ver comprovante
                </a>
              </Button>
            )}
            <Button className="w-full gap-2" onClick={() => router.push('/home')}>
              Ir para o início
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-xs text-gray-400">
            Redirecionando automaticamente em {countdown}s...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
