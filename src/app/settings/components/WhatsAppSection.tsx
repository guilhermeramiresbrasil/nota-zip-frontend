'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, QrCode, CheckCircle2, RefreshCw, Edit2, X, Copy } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);

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

  const handleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      generateCode();
    } else {
      setQrData(null);
    }
  };

  const shareViaWhatsApp = () => {
    if (!qrData) return;
    const message = `Olá! Estou conectando meu WhatsApp ao Nota Zip. Meu código de conexão é: ${qrData.code}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            {isConnected ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            ) : (
              <MessageCircle className="h-5 w-5 text-slate-400 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-800">
                {isConnected ? 'Número conectado' : 'Nenhum número conectado'}
              </p>
              <p className="text-xs text-slate-500">
                {isConnected ? 'Seu WhatsApp está ativo e pronto para uso.' : 'Gere o QR code para conectar.'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
            className="h-8 w-8"
          >
            {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* QR Code area */}
        {isEditing && (
          <div className="space-y-3 p-3 rounded-lg bg-green-50 border border-green-100">
            {!qrData ? (
              <div className="flex justify-center py-4">
                <Button
                  onClick={generateCode}
                  disabled={loading}
                  className="gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  {loading ? 'Gerando…' : 'Gerar QR Code'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <img src={qrData.qrCode} alt="QR Code WhatsApp" className="w-44 h-44" />
                </div>
                <p className="text-sm text-slate-700 text-center">
                  Escaneie o QR code ou envie o código para o número do WhatsApp:
                </p>
                <p className="text-sm font-semibold text-slate-800">+55 51 99619-6672</p>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-green-200">
                  <span className="text-xs text-slate-500">Código:</span>
                  <span className="text-sm font-bold text-green-600 tracking-wider">{qrData.code}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Expira às {new Date(qrData.expiresAt).toLocaleTimeString('pt-BR')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareViaWhatsApp}
                    className="flex-1 gap-1.5"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Compartilhar no WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateCode}
                    disabled={loading}
                    className="gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
