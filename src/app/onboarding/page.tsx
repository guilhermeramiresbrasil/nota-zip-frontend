'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, ArrowRight, Check, Mail, MessageCircle, Settings, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    description: 'Adicione seu WhatsApp para enviar notas por mensagem',
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
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
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

  const generateWhatsAppCode = async () => {
    setLoadingQrCode(true);
    try {
      // TODO: Get user ID from auth context
      const userId = 'temp-user-id';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/whatsapp/generate-code`, {
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
    const Icon = steps[currentStep - 1].icon;

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Icon className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{steps[0].title}</h2>
              <p className="text-gray-600">{steps[0].description}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Controle completo de suas finanças</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Relatórios detalhados e insights</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Notas e anotações financeiras</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Icon className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{steps[1].title}</h2>
              <p className="text-gray-600">{steps[1].description}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailCode">Código de verificação</Label>
                <Input
                  id="emailCode"
                  type="text"
                  placeholder="Digite o código enviado para seu email"
                  value={formData.emailCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('emailCode', e.target.value)}
                  maxLength={6}
                />
                <p className="text-sm text-gray-500">
                  Não recebeu o código? <button className="text-blue-600 hover:underline">Reenviar</button>
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Icon className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{steps[2].title}</h2>
              <p className="text-gray-600">{steps[2].description}</p>
            </div>
            <div className="space-y-4">
              <div className="p-6 bg-blue-50 rounded-lg text-center">
                {loadingQrCode ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : qrCodeData ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img src={qrCodeData.qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
                    </div>
                    <p className="text-gray-700 mb-2">
                      Escaneie o QR code e envie a mensagem para o WhatsApp
                    </p>
                    <p className="text-sm text-gray-500">
                      Código: <strong className="text-blue-600">{qrCodeData.code}</strong>
                    </p>
                    <p className="text-xs text-gray-400">
                      Expira em: {new Date(qrCodeData.expiresAt).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <QrCode className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                )}
                <p className="text-sm text-gray-500 mt-4">
                  Envie uma mensagem para o número: <strong>+55 11 99999-9999</strong>
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Icon className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{steps[3].title}</h2>
              <p className="text-gray-600">{steps[3].description}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Moeda</Label>
                <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
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
                <Select value={formData.language} onValueChange={(value) => handleChange('language', value)}>
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
                  checked={formData.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="notifications" className="cursor-pointer">
                  Receber notificações por email
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Passo {currentStep} de {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round((currentStep / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {renderStep()}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Voltar
                </Button>
              )}
              <Button
                onClick={handleNext}
                className={`flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 ${
                  currentStep === 1 ? 'flex-1' : ''
                }`}
              >
                {currentStep === steps.length ? 'Concluir' : 'Próximo'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Skip button */}
            {steps[currentStep - 1].skippable && currentStep < steps.length && (
              <div className="text-center mt-4">
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Pular este passo
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skip entire onboarding */}
        {currentStep < steps.length && (
          <div className="text-center mt-4">
            <button
              onClick={() => router.push('/plans')}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Pular onboarding
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
