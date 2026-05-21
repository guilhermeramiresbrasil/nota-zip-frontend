import React from 'react';
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
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Escuro</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Moeda</Label>
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
              <SelectItem value="BRL">Real (BRL)</SelectItem>
              <SelectItem value="USD">Dólar (USD)</SelectItem>
              <SelectItem value="EUR">Euro (EUR)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Idioma</Label>
          <Select
            value={preferences?.language}
            onValueChange={(value: 'pt-BR' | 'en-US') =>
              onChangePreferences({ ...preferences, language: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português</SelectItem>
              <SelectItem value="en-US">English</SelectItem>
            </SelectContent>
          </Select>
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
