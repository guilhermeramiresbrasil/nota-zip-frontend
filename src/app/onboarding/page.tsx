'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Mail, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IUser, useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { OnboardingProgress } from './components/OnboardingProgress';
import { WelcomeStep } from './components/WelcomeStep';
import { EmailVerificationStep } from './components/EmailVerificationStep';
import { WhatsAppConnectionStep } from './components/WhatsAppConnectionStep';
import { OnboardingNavigation } from './components/OnboardingNavigation';

// Hardcoded production API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updatedUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    emailCode: '',
    whatsappConnected: false,
  });
  const [qrCodeData, setQrCodeData] = useState<{ code: string; qrCode: string; expiresAt: string } | null>(null);
  const [loadingQrCode, setLoadingQrCode] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(user?.emailVerified ?? false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Sincronizar emailVerified com o estado do usuário
  useEffect(() => {
    if (user?.emailVerified) {
      setEmailVerified(true);
    }
  }, [user?.emailVerified]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const generateEmailCode = async () => {
    if (user?.emailVerified) return setEmailVerified(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/generate-email-code`, {
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
  };

  const generateWhatsAppCode = async () => {
    setLoadingQrCode(true);
    try {
      const userId = user?.id || '';
      if (!userId) return;
      const response = await fetch(`${API_URL}/api/auth/generate-phone-code`, {
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

  const handleVerifyEmail = async () => {
    if (user?.emailVerified) {
      setEmailVerified(true);
      return true;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, code: formData.emailCode }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailVerified(true);
        await updatedUser({ ...user, emailVerified: true } as IUser);
        showSuccess('Email verificado com sucesso!');
        return true;
      } else {
        showError('Código de verificação inválido');
        return false;
      }
    } catch (e) {
      console.error('Email verification failed:', e);
      showError('Erro ao verificar email');
      return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length) {
      switch (currentStep) {
        case 1:
          await generateEmailCode();
          setCurrentStep(currentStep + 1);
          break;
        case 2:
          if (!emailVerified && !user?.emailVerified) {
            await handleVerifyEmail();
            if (emailVerified || user?.emailVerified) {
              await generateWhatsAppCode();
              setCurrentStep(currentStep + 1);
            }
          } else {
            await generateWhatsAppCode();
            setCurrentStep(currentStep + 1);
          }
          break;
        default:
          setCurrentStep(currentStep + 1);
      }
    } else {
      router.push('/plans');
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/plans');
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
            onResendCode={async () => {
              if (resendCooldown > 0) return;
              try {
                const res = await fetch(`${API_URL}/api/auth/generate-email-code`, {
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
                isNextDisabled={currentStep === 2 && !emailVerified && formData.emailCode.length < 6}
                emailVerified={emailVerified}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
