'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle2, RefreshCw, Edit2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function EmailSection() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const isVerified = !!user?.emailVerified;

  const generateCode = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/generate-email-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setCodeSent(true);
        showSuccess('Código enviado', 'Um código de verificação foi enviado para seu email.');
      } else {
        showError('Erro', 'Não foi possível enviar o código de verificação.');
      }
    } catch {
      showError('Erro', 'Não foi possível enviar o código de verificação.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!user?.id || !code) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, code }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Email validado', 'Seu email foi validado com sucesso.');
        setCode('');
        setCodeSent(false);
        // Refresh user data
        window.location.reload();
      } else {
        showError('Erro', data.error || 'Código inválido ou expirado.');
      }
    } catch {
      showError('Erro', 'Não foi possível validar o código.');
    } finally {
      setLoading(false);
    }
  };

  const updateEmail = async () => {
    if (!user?.id || !newEmail) return;
    setEmailLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Email atualizado', 'Seu email foi atualizado com sucesso. Por favor, valide o novo email.');
        setNewEmail('');
        setIsEditingEmail(false);
        // Refresh user data
        window.location.reload();
      } else {
        showError('Erro', data.error || 'Não foi possível atualizar o email.');
      }
    } catch {
      showError('Erro', 'Não foi possível atualizar o email.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Email
        </CardTitle>
        <CardDescription className="mt-1">
          Valide seu email para garantir a segurança da sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email display and edit */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <Mail className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-800">Email atual</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditingEmail(!isEditingEmail)}
            className="h-8 w-8"
          >
            {isEditingEmail ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Email edit form */}
        {isEditingEmail && (
          <div className="space-y-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="space-y-2">
              <Label htmlFor="new-email">Novo email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="Digite seu novo email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={updateEmail}
                disabled={emailLoading || !newEmail}
                className="flex-1"
              >
                {emailLoading ? 'Atualizando...' : 'Atualizar email'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingEmail(false);
                  setNewEmail('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
          {isVerified ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800">Email validado</p>
                <p className="text-xs text-slate-500">Seu email está validado e seguro.</p>
              </div>
            </>
          ) : (
            <>
              <Mail className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800">Email não validado</p>
                <p className="text-xs text-slate-500">Valide seu email para garantir a segurança da conta.</p>
              </div>
            </>
          )}
        </div>

        {/* Verification area */}
        {!isVerified && (
          <>
            {!codeSent ? (
              <Button
                onClick={generateCode}
                disabled={loading}
                className="w-full gap-2"
              >
                <Mail className="h-4 w-4" />
                {loading ? 'Enviando código...' : 'Enviar código de verificação'}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email-code">Código de verificação</Label>
                  <Input
                    id="email-code"
                    placeholder="Digite o código recebido"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={verifyCode}
                    disabled={loading || !code}
                    className="flex-1"
                  >
                    {loading ? 'Validando...' : 'Validar'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={generateCode}
                    disabled={loading}
                    className="gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reenviar
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
