'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Mail, MessageCircle, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { OnboardingProgress } from './components/OnboardingProgress';
import { WelcomeStep } from './components/WelcomeStep';
import { EmailVerificationStep } from './components/EmailVerificationStep';
import { WhatsAppConnectionStep } from './components/WhatsAppConnectionStep';
import { PreferencesStep } from './components/PreferencesStep';
import { OnboardingNavigation } from './components/OnboardingNavigation';

const steps = [
  {
    id: 1,
    title: 'Bem-vindo ao Nota Zip',
    description: 'Vamos configurar sua conta em alguns passos simples',
    icon: Wallet,
    skippable: false,
  },
  {
    id: 2,
    title: 'Verifique seu email',
    description: 'Enviamos um código de verificação para seu email',
    icon: Mail,
    skippable: false,
  },
  {
    id: 3,
    title: 'Conecte seu WhatsApp',
    description: 'Adicione seu WhatsApp para enviar notas por mensagem (opcional)',
    icon: MessageCircle,
    skippable: true,
  },
  {
    id: 4,
    title: 'Preferências',
    description: 'Personalize sua experiência',
    icon: Settings,
    skippable: true,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    emailCode: '',
    whatsappConnected: false,
    currency: 'BRL',
    language: 'pt-BR',
    notifications: true,
  });
  const [qrCodeData, setQrCodeData] = useState<{ code: string; qrCode: string; expiresAt: string } | null>(null);
  const [loadingQrCode, setLoadingQrCode] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleNext = async () => {
    if (currentStep < steps.length) {
      // When moving from step 1 (Welcome) to step 2 (Email Verification), send email code
      if (currentStep === 1) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/generate-email-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id, email: user?.email }),
          });
          const data = await res.json();
          if (data.success) {
            showSuccess('Código enviado para seu email!');
            setResendCooldown(60);
          }
        } catch (e) {
          console.error('Failed to send email code:', e);
          showError('Erro ao enviar código de verificação');
        }
      }
      // When moving from step 2 (Email Verification) to step 3 (WhatsApp Connection), generate WhatsApp code
      if (currentStep === 2) {
        await generateWhatsAppCode();
      }
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/home');
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/home');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const generateWhatsAppCode = async () => {
    setLoadingQrCode(true);
    try {
      const userId = user?.id || '';
      if (!userId) return;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/generate-phone-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (data.success) {
        setQrCodeData(data.data);
      }
    } catch (error) {
      console.error('Error generating WhatsApp code:', error);
    } finally {
      setLoadingQrCode(false);
    }
  };

  // Generate QR code when entering step 3
  useEffect(() => {
    if (currentStep === 3) {
      generateWhatsAppCode();
    }
  }, [currentStep]);

  const renderStep = () => {
    const currentStepData = steps[currentStep - 1];

    switch (currentStep) {
      case 1:
        return (
          <WelcomeStep
            title={currentStepData.title}
            description={currentStepData.description}
            icon={currentStepData.icon}
          />
        );

      case 2:
        return (
          <EmailVerificationStep
            title={currentStepData.title}
            description={currentStepData.description}
            icon={currentStepData.icon}
            emailCode={formData.emailCode}
            emailVerified={emailVerified}
            resendCooldown={resendCooldown}
            onEmailCodeChange={(value) => handleChange('emailCode', value)}
            onVerifyEmail={async () => {
              setEmailVerifying(true);
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user?.id, code: formData.emailCode }),
                });
                const data = await res.json();
                if (data.success) setEmailVerified(true);
              } catch (e) {
                console.error('Email verification failed:', e);
              } finally {
                setEmailVerifying(false);
              }
            }}
            onResendCode={async () => {
              if (resendCooldown > 0) return;
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/generate-email-code`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user?.id, email: user?.email }),
                });
                const data = await res.json();
                if (data.success) {
                  showSuccess('Código reenviado para seu email!');
                  setResendCooldown(60);
                }
              } catch (e) {
                console.error('Failed to resend code:', e);
                showError('Erro ao reenviar código');
              }
            }}
            emailVerifying={emailVerifying}
            userId={user?.id}
            userEmail={user?.email}
          />
        );

      case 3:
        return (
          <WhatsAppConnectionStep
            title={currentStepData.title}
            description={currentStepData.description}
            icon={currentStepData.icon}
            qrCodeData={qrCodeData}
            loadingQrCode={loadingQrCode}
            onGenerateQRCode={generateWhatsAppCode}
          />
        );

      case 4:
        return (
          <PreferencesStep
            title={currentStepData.title}
            description={currentStepData.description}
            icon={currentStepData.icon}
            currency={formData.currency}
            language={formData.language}
            notifications={formData.notifications}
            onCurrencyChange={(value) => handleChange('currency', value)}
            onLanguageChange={(value) => handleChange('language', value)}
            onNotificationsChange={(value) => handleChange('notifications', value)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <OnboardingProgress currentStep={currentStep} totalSteps={steps.length} />

          <Card className="shadow-xl">
            <CardContent className="p-8">
              {renderStep()}

              <OnboardingNavigation
                currentStep={currentStep}
                totalSteps={steps.length}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
                isStepSkippable={steps[currentStep - 1].skippable}
                isNextDisabled={currentStep === 2 && !emailVerified}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
