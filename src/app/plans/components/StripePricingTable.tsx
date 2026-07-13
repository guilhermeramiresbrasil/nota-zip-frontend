'use client';

import { useEffect, useRef } from 'react';

interface StripePricingTableProps {
  pricingTableId: string;
  publishableKey: string;
  customerEmail?: string;
  clientReferenceId?: string;
  successUrl?: string;
}

export function StripePricingTable({ pricingTableId, publishableKey, customerEmail, clientReferenceId, successUrl }: StripePricingTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    const container = containerRef.current;
    if (container) {
      const pricingTable = document.createElement('stripe-pricing-table');
      pricingTable.setAttribute('pricing-table-id', pricingTableId);
      pricingTable.setAttribute('publishable-key', publishableKey);
      
      if (customerEmail) {
        pricingTable.setAttribute('customer-email', customerEmail);
      }
      
      if (clientReferenceId) {
        pricingTable.setAttribute('client-reference-id', clientReferenceId);
      }
      
      if (successUrl) {
        pricingTable.setAttribute('success-url', successUrl);
      }
      
      container.appendChild(pricingTable);

      // Customizar cor de fundo do iframe
      const observer = new MutationObserver(() => {
        const iframe = container.querySelector('iframe');
        if (iframe) {
          iframe.style.background = '#f8fafc'; // slate-50
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
  }, [pricingTableId, publishableKey]);

  return <div ref={containerRef} className="min-h-[600px]" />;
}
