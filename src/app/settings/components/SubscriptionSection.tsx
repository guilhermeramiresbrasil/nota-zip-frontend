'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function SubscriptionSection() {
  const t = useTranslations('settings');
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  const handleManageSubscription = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/create-portal-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error(t('portalError'));
      }

      const data = await response.json();
      if (data.success && data.data?.url) {
        window.open(data.data.url, '_blank');
      }
    } catch (error) {
      showError('Erro', t('portalError'));
    } finally {
      setLoading(false);
    }
  };

  const getPlanLabel = () => {
    switch (user?.plan) {
      case 'free':
        return t('planFree');
      case 'basic':
        return t('planBasic');
      case 'premium':
        return t('planPremium');
      case 'shared':
        return t('planShared');
      default:
        return t('planUnknown');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('subscription')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t('currentPlanLabel')}</p>
            <p className="font-semibold text-lg">{getPlanLabel()}</p>
          </div>
        </div>
        
        {user?.plan !== 'free' && (
          <Button
            onClick={handleManageSubscription}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('loadingPortal')}
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('manageSubscription')}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
