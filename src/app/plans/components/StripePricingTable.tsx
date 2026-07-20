'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const PRICING_TABLE_ID = 'prctbl_1TqyyS7ZGxkJBfmcxJlfeIGA';
const PUBLISHABLE_KEY = 'pk_test_51TXREK7ZGxkJBfmch0Ltz9BeQ9D9q3PD1BygSFZ0tM1rlSDkbAK8fmqvkW6wS4zzlREVn0IVM4e3vz5yP8FX1ay700sXOu9Zhx';
const SUCCESS_URL = 'http://localhost:3000/home';

export function StripePricingTable() {
  const { user } = useAuth();
  return <StripePricingTableInner key={user?.id ?? 'loading'} user={user} />;
}

interface StripePricingTableInnerProps {
  user?: { id?: string; email?: string } | null;
}

function StripePricingTableInner({ user }: StripePricingTableInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    const container = containerRef.current;
    if (container) {
      const pricingTable = document.createElement('stripe-pricing-table');
      pricingTable.setAttribute('pricing-table-id', PRICING_TABLE_ID);
      pricingTable.setAttribute('publishable-key', PUBLISHABLE_KEY);

      if (user?.email) {
        pricingTable.setAttribute('customer-email', user.email);
      }

      if (user?.id) {
        pricingTable.setAttribute('client-reference-id', user.id);
      }

      pricingTable.setAttribute('success-url', SUCCESS_URL);

      container.appendChild(pricingTable);

      const observer = new MutationObserver(() => {
        const iframe = container.querySelector('iframe');
        if (iframe) {
          iframe.style.background = '#f8fafc';
          iframe.style.borderRadius = '8px';
        }
      });

      observer.observe(container, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        document.body.removeChild(script);
        if (container) {
          container.innerHTML = '';
        }
      };
    }
  }, []);

  return <div ref={containerRef} className="min-h-[600px]" />;
}
