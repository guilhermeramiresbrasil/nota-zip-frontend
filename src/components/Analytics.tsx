'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

function gtag(...args: (string | object)[]) {
  if (typeof window !== 'undefined' && 'dataLayer' in window) {
    (window as any).dataLayer.push(args);
  }
}

function updateConsent(consent: 'granted' | 'denied') {
  gtag('consent', 'update', {
    ad_storage: consent,
    analytics_storage: consent,
    ad_user_data: consent,
    ad_personalization: consent,
  });
}

export function Analytics() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('nota-zip-consent');
    if (!stored) {
      setShowBanner(true);
    } else if (stored === 'granted') {
      updateConsent('granted');
    }
  }, []);

  const handleConsent = (consent: 'granted' | 'denied') => {
    localStorage.setItem('nota-zip-consent', consent);
    setShowBanner(false);
    if (consent === 'granted') {
      updateConsent('granted');
    }
  };

  if (!GA_ID && !GTM_ID) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { send_page_view: true });
              gtag('consent', 'default', {
                ad_storage: 'denied',
                analytics_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                wait_for_update: 500
              });
            `}
          </Script>
        </>
      )}
      {GTM_ID && (
        <Script id="gtm-init" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
      )}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t p-4 shadow-lg">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-700">
              Usamos cookies para melhorar a experiência e medir o desempenho das campanhas. Você pode aceitar ou recusar.
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleConsent('denied')}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                Recusar
              </button>
              <button
                onClick={() => handleConsent('granted')}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Aceitar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
