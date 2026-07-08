import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Bell, Palette, CreditCard } from 'lucide-react';
import { IUser } from '@/contexts/AuthContext';


interface PreferencesSectionProps {
  preferences: IUser;
  onChangePreferences: (preferences: IUser) => void;
  handleSavePreferences: () => Promise<void>;
  isLoading: boolean;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({ preferences, onChangePreferences, handleSavePreferences, isLoading }) => {
 
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Preferências
        </CardTitle>
        <CardDescription>Personalize sua experiência</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Tema</Label>
          <Combobox
            searchable={false}
            options={[{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Escuro' }, { value: 'system', label: 'Sistema' }]}
            value={preferences?.theme || 'system'}
            onChange={(v) => onChangePreferences({ ...preferences, theme: v as 'light' | 'dark' | 'system' })}
          />
        </div>

        <div className="space-y-2">
          <Label>Moeda</Label>
          <Combobox
            searchable={false}
            options={[{ value: 'BRL', label: 'Real (BRL)' }, { value: 'USD', label: 'Dólar (USD)' }, { value: 'EUR', label: 'Euro (EUR)' }]}
            value={preferences?.currency || 'BRL'}
            onChange={(v) => onChangePreferences({ ...preferences, currency: v as 'BRL' | 'USD' | 'EUR' })}
          />
        </div>

        <div className="space-y-2">
          <Label>Idioma</Label>
          <Combobox
            searchable={false}
            options={[{ value: 'pt-BR', label: 'Português' }, { value: 'en-US', label: 'English' }]}
            value={preferences?.language || 'pt-BR'}
            onChange={(v) => onChangePreferences({ ...preferences, language: v as 'pt-BR' | 'en-US' })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-500" />
            <Label>Notificações</Label>
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
            <Label>Alertas por Email</Label>
          </div>
          <input
            type="checkbox"
            checked={preferences?.emailAlerts}
            onChange={(e) => onChangePreferences({ ...preferences, emailAlerts: e.target.checked })}
            className="h-4 w-4"
          />
        </div>

        <Button onClick={handleSavePreferences} disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </CardContent>
    </Card>
  );
};
