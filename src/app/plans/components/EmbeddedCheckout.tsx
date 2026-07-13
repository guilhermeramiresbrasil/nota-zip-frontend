'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface EmbeddedCheckoutModalProps {
  publishableKey: string;
  clientSecret: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function EmbeddedCheckoutModal({
  publishableKey,
  clientSecret,
  open,
  onOpenChange,
  onComplete,
}: EmbeddedCheckoutModalProps) {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  useEffect(() => {
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    }
  }, [publishableKey]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Finalizar pagamento</DialogTitle>
        </DialogHeader>
        <div className="px-2 pb-6 min-h-[400px]">
          {stripePromise ? (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret, onComplete: onComplete || (() => onOpenChange(false)) }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          ) : (
            <div className="flex h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
