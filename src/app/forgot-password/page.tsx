'use client';

import { useState } from 'react';
import { LoginLogo } from '../login/components/LoginLogo';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Email é obrigatório');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${GATEWAY_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Erro ao solicitar recuperação de senha');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar recuperação de senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <LoginLogo />
        <ForgotPasswordForm
          email={email}
          isLoading={isLoading}
          error={error}
          success={success}
          onChangeEmail={setEmail}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
