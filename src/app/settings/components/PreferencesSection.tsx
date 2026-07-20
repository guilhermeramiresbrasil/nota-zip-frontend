import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Palette, CreditCard } from 'lucide-react';
import { IUser } from '@/contexts/AuthContext';


interface PreferencesSectionProps {
  preferences: IUser;
  onChangePreferences: (preferences: IUser) => void;
  handleSavePreferences: () => Promise<void>;
  isLoading: boolean;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({ preferences, onChangePreferences, handleSavePreferences, isLoading }) => {
  const t = useTranslations('settings');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          {t('preferences')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>{t('theme')}</Label>
          <Select
            value={preferences?.theme}
            onValueChange={(value: 'light' | 'dark' | 'system') =>
              onChangePreferences({ ...preferences, theme: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t('light')}</SelectItem>
              <SelectItem value="dark">{t('dark')}</SelectItem>
              <SelectItem value="system">{t('system')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('currency')}</Label>
          <Select
            value={preferences?.currency}
            onValueChange={(value: 'BRL' | 'USD' | 'EUR') =>
              onChangePreferences({ ...preferences, currency: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">{t('real')}</SelectItem>
              <SelectItem value="USD">{t('dollar')}</SelectItem>
              <SelectItem value="EUR">{t('euro')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('language')}</Label>
          <Select
            value={preferences?.language}
            onValueChange={(value: 'pt-BR' | 'en-US' | 'es-ES') =>
              onChangePreferences({ ...preferences, language: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">{t('portuguese')}</SelectItem>
              <SelectItem value="en-US">{t('english')}</SelectItem>
              <SelectItem value="es-ES">{t('spanish')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-500" />
            <Label>{t('notifications')}</Label>
          </div>
          <input
            type="checkbox"
            checked={preferences?.notifications}
            onChange={(e) => onChangePreferences({ ...preferences, notifications: e.target.checked })}
            className="h-4 w-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <Label>{t('emailAlerts')}</Label>
          </div>
          <input
            type="checkbox"
            checked={preferences?.emailAlerts}
            onChange={(e) => onChangePreferences({ ...preferences, emailAlerts: e.target.checked })}
            className="h-4 w-4"
          />
        </div>

        <Button onClick={handleSavePreferences} disabled={isLoading}>
          {isLoading ? t('saving') : t('save')}
        </Button>
      </CardContent>
    </Card>
  );
};
