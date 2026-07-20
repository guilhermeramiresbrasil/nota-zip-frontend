'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Edit2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function PersonalDataSection() {
  const t = useTranslations('settings');
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const updatePersonalData = async () => {
    if (!user?.id || !name) return;
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(t('dataUpdated'), t('dataUpdatedDescription'));
        setIsEditing(false);
        // Refresh user data
        window.location.reload();
      } else {
        showError('Erro', data.error || t('dataUpdateError'));
      }
    } catch {
      showError('Erro', t('dataUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(user?.name || '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          {t('personalData')}
        </CardTitle>
        <CardDescription className="mt-1">
          {t('personalDataDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name display and edit */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <User className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-800">{t('name')}</p>
              <p className="text-xs text-slate-500">{user?.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            className="h-8 w-8"
          >
            {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Name edit form */}
        {isEditing && (
          <div className="space-y-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="space-y-2">
              <Label htmlFor="name">{t('fullName')}</Label>
              <Input
                id="name"
                placeholder={t('fullNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={updatePersonalData}
                disabled={loading || !name}
                className="flex-1"
              >
                {loading ? t('updating') : t('updateData')}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
