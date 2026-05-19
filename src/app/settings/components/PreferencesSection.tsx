import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Palette, Globe, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserPreferences } from '@/stores/useAuthStore';

export const PreferencesSection: React.FC = () => {
  const { user, updatePreferences } = useAuthStore();
  const [preferences, setPreferences] = React.useState<UserPreferences>({
    theme: user?.theme || 'light',
    currency: user?.currency || 'BRL',
    language: user?.language || 'pt-BR',
    notifications: user?.notifications ?? true,
    emailAlerts: user?.emailAlerts ?? true,
  });

  const handleSave = async () => {
    try {
      await updatePreferences(preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

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
            value={preferences.theme}
            onValueChange={(value: 'light' | 'dark' | 'system') =>
              setPreferences({ ...preferences, theme: value })
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
            value={preferences.currency}
            onValueChange={(value: 'BRL' | 'USD' | 'EUR') =>
              setPreferences({ ...preferences, currency: value })
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
            value={preferences.language}
            onValueChange={(value: 'pt-BR' | 'en-US') =>
              setPreferences({ ...preferences, language: value })
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
            checked={preferences.notifications}
            onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
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
            checked={preferences.emailAlerts}
            onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
            className="h-4 w-4"
          />
        </div>

        <Button onClick={handleSave}>Salvar Preferências</Button>
      </CardContent>
    </Card>
  );
};
