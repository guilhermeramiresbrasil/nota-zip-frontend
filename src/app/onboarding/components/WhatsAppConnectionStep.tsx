import { LucideIcon } from 'lucide-react';
import { QrCode } from 'lucide-react';

interface WhatsAppConnectionStepProps {
  title: string;
  description: string;
  icon: LucideIcon;
  qrCodeData: { code: string; qrCode: string; expiresAt: string } | null;
  loadingQrCode: boolean;
  onGenerateQRCode: () => void;
}

export function WhatsAppConnectionStep({
  title,
  description,
  icon: Icon,
  qrCodeData,
  loadingQrCode,
  onGenerateQRCode,
}: WhatsAppConnectionStepProps) {
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
            Envie uma mensagem para o número: <strong>+55 51 99619-6672</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
