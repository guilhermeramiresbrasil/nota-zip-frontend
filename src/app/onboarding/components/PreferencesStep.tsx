import { LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';

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
          <Combobox
            searchable={false}
            options={[{ value: 'BRL', label: 'R$ - Real Brasileiro' }, { value: 'USD', label: '$ - Dólar Americano' }, { value: 'EUR', label: '€ - Euro' }]}
            value={currency}
            onChange={onCurrencyChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Idioma</Label>
          <Combobox
            searchable={false}
            options={[{ value: 'pt-BR', label: 'Português (Brasil)' }, { value: 'en-US', label: 'English (US)' }]}
            value={language}
            onChange={onLanguageChange}
          />
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
