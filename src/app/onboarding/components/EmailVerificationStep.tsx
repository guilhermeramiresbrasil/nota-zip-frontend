import { useTranslations } from 'next-intl';
import { LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface EmailVerificationStepProps {
  title: string;
  description: string;
  icon: LucideIcon;
  emailCode: string;
  emailVerified?: boolean;
  resendCooldown: number;
  onEmailCodeChange: (value: string) => void;
  onResendCode: () => void;
}

export function EmailVerificationStep({
  title,
  description,
  icon: Icon,
  emailCode,
  emailVerified,
  resendCooldown,
  onEmailCodeChange,
  onResendCode,
}: EmailVerificationStepProps) {
  const t = useTranslations('onboarding');
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
          <Label htmlFor="emailCode">{t('verificationCodeLabel')}</Label>
          <Input
            id="emailCode"
            type="text"
            placeholder={emailVerified ? t('verifiedPlaceholder') : t('codePlaceholder')}
            value={emailCode}
            disabled={emailVerified}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEmailCodeChange(e.target.value)}
            maxLength={6}
          />
          <p className="text-sm text-gray-500">
            {t('didNotReceiveCode')} <button
              type="button"
              className={`text-blue-600 hover:underline ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : ''}`}
              disabled={resendCooldown > 0}
              onClick={onResendCode}
            >{resendCooldown > 0 ? t('resendIn', { seconds: resendCooldown }) : t('resend')}</button>
          </p>
        </div>
      </div>
    </div>
  );
}
