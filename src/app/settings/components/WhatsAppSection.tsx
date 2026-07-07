'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, QrCode, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface QrData {
  code: string;
  qrCode: string;
  expiresAt: string;
}

export function WhatsAppSection() {
  const { user } = useAuth();
  const { showError } = useToast();

  const [qrData, setQrData] = useState<QrData | null>(null);
  const [loading, setLoading] = useState(false);

  const isConnected = !!user?.phoneVerified;

  const generateCode = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/generate-phone-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setQrData(data.data);
      } else {
        showError('Erro', 'Não foi possível gerar o QR code.');
      }
    } catch {
      showError('Erro', 'Não foi possível gerar o QR code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          WhatsApp
        </CardTitle>
        <CardDescription className="mt-1">
          Conecte seu WhatsApp para registrar transações por mensagem, foto ou áudio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
          {isConnected ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800">Número conectado</p>
                <p className="text-xs text-slate-500">Seu WhatsApp está ativo e pronto para uso.</p>
              </div>
            </>
          ) : (
            <>
              <MessageCircle className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800">Nenhum número conectado</p>
                <p className="text-xs text-slate-500">Gere o QR code abaixo para conectar.</p>
              </div>
            </>
          )}
        </div>

        {/* QR Code area */}
        {qrData ? (
          <div className="flex flex-col items-center gap-3 p-5 bg-blue-50 rounded-lg border border-blue-100">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <img src={qrData.qrCode} alt="QR Code WhatsApp" className="w-44 h-44" />
            </div>
            <p className="text-sm text-slate-700 text-center">
              Escaneie o QR code ou envie o código para o número do WhatsApp:
            </p>
            <p className="text-sm font-semibold text-slate-800">+55 51 99619-6672</p>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-blue-200">
              <span className="text-xs text-slate-500">Código:</span>
              <span className="text-sm font-bold text-blue-600 tracking-wider">{qrData.code}</span>
            </div>
            <p className="text-xs text-slate-400">
              Expira às {new Date(qrData.expiresAt).toLocaleTimeString('pt-BR')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateCode}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Gerar novo código
            </Button>
          </div>
        ) : (
          <Button
            onClick={generateCode}
            disabled={loading}
            className="w-full gap-2"
            variant={isConnected ? 'outline' : 'default'}
          >
            <QrCode className="h-4 w-4" />
            {loading
              ? 'Gerando…'
              : isConnected
              ? 'Reconectar / Trocar número'
              : 'Conectar WhatsApp'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
