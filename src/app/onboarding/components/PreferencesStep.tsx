import { LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PreferencesStepProps {
  title: string;
  description: string;
  icon: LucideIcon;
  currency: string;
  language: string;
  notifications: boolean;
  onCurrencyChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onNotificationsChange: (value: boolean) => void;
}

export function PreferencesStep({
  title,
  description,
  icon: Icon,
  currency,
  language,
  notifications,
  onCurrencyChange,
  onLanguageChange,
  onNotificationsChange,
}: PreferencesStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
          <Icon className="h-10 w-10 text-white" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Moeda</Label>
          <Select value={currency} onValueChange={onCurrencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">R$ - Real Brasileiro</SelectItem>
              <SelectItem value="USD">$ - Dólar Americano</SelectItem>
              <SelectItem value="EUR">€ - Euro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Idioma</Label>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="notifications"
            checked={notifications}
            onChange={(e) => onNotificationsChange(e.target.checked)}
            className="w-4 h-4"
          />
          <Label htmlFor="notifications" className="cursor-pointer">
            Receber notificações por email
          </Label>
        </div>
      </div>
    </div>
  );
}
