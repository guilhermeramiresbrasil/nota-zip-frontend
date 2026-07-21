'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations, useMessages, useLocale } from 'next-intl';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type BillingCycle = 'monthly' | 'yearly';

interface Plan {
  id: string;
  name: string;
  description?: string | null;
  monthlyPrice: string;
  yearlyPrice: string;
  trialDays: number;
  features?: string[] | null;
}

interface CheckoutData {
  clientSecret: string;
  publishableKey: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function CustomPricingTable() {
  const { user } = useAuth();
  const t = useTranslations('plans');
  const messages = useMessages();
  const locale = useLocale();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [pending, setPending] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/subscriptions/plans`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const visible = res.data.filter((p: Plan) => ['basic', 'premium', 'shared'].includes(p.name));
          setPlans(visible);
        } else {
          setError(t('error'));
        }
      })
      .catch(() => setError(t('error')))
      .finally(() => setLoading(false));
  }, [t]);

  const formatPrice = (value: string) => {
    const n = parseFloat(value);
    if (Number.isNaN(n)) return value;
    const localeCode = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es' : 'en';
    return n.toLocaleString(localeCode, { style: 'currency', currency: 'BRL' });
  };

  const planMessages: Record<string, { name?: string; description?: string; features?: string; button?: string }> =
    useMemo(() => {
      const raw = (messages as any).plans || {};
      return {
        basic: raw.basic || {},
        premium: raw.premium || {},
        shared: raw.shared || {},
      };
    }, [messages]);

  const handleSubscribe = async (planId: string, hasTrial: boolean) => {
    if (!user?.id) {
      setError(t('loginToSubscribe'));
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/subscriptions/create-payment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          planId,
          billingCycle: cycle,
          paymentMethod: 'credit_card',
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || t('error'));
        return;
      }
      setCheckout({ clientSecret: data.data.clientSecret, publishableKey: data.data.publishableKey });
      setStripePromise(loadStripe(data.data.publishableKey));
    } catch {
      setError(t('error'));
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">{t('loading')}</p>;
  }

  if (error && !checkout) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 mb-10">
        <button
          type="button"
          onClick={() => setCycle('monthly')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition ${
            cycle === 'monthly' ? 'bg-[#0074d4] text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('monthly')}
        </button>
        <button
          type="button"
          onClick={() => setCycle('yearly')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition ${
            cycle === 'yearly' ? 'bg-[#0074d4] text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('yearly')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {plans.map((plan) => {
          const msgs = planMessages[plan.name] || {};
          const isYearly = cycle === 'yearly';
          const yearlyTotal = plan.yearlyPrice;
          const monthlyPrice = isYearly
            ? (parseFloat(plan.yearlyPrice) / 12).toFixed(2)
            : plan.monthlyPrice;
          const isPopular = plan.name === 'premium';
          const features = typeof msgs.features === 'string'
            ? msgs.features.split('|').map((f) => f.trim()).filter(Boolean)
            : plan.features || [];
          const buttonLabel = msgs.button || (plan.trialDays > 0 ? t('startTrial') : t('subscribe'));

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl p-6 bg-white border ${
                isPopular ? 'border-[#0074d4] shadow-md ring-1 ring-[#0074d4]' : 'border-slate-200 shadow-sm'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block rounded-full bg-[#0074d4] px-3 py-1 text-xs font-medium text-white">
                    {t('mostPopular')}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {msgs.name || plan.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {msgs.description || plan.description || ''}
                </p>
              </div>

              <div className="mb-1">
                <span className="text-4xl font-bold text-slate-900">{formatPrice(monthlyPrice)}</span>
                <span className="text-sm text-slate-500 ml-1">{t('perMonth')}</span>
              </div>
              {isYearly ? (
                <div className="mb-5 text-sm text-slate-500">
                  {formatPrice(yearlyTotal)} <span className="text-slate-400">{t('perYear')}</span>
                </div>
              ) : (
                <div className="mb-5" />
              )}

              <button
                type="button"
                disabled={pending}
                onClick={() => handleSubscribe(plan.id, plan.trialDays > 0)}
                className="w-full rounded-lg bg-[#0074d4] px-4 py-3 text-sm font-medium text-white hover:bg-[#0066ba] disabled:opacity-60"
              >
                {pending ? t('processing') : buttonLabel}
              </button>

              <div className="mt-6">
                <p className="text-sm font-medium text-slate-900 mb-3">{t('includes')}</p>
                <ul className="space-y-3">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-900 opacity-50" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {checkout && stripePromise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl bg-white p-4 shadow-2xl">
            <button
              type="button"
              onClick={() => setCheckout(null)}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-900"
              aria-label={t('close')}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="pt-6">
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: checkout.clientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
