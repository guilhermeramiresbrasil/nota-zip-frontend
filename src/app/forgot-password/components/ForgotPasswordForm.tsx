import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ForgotPasswordFormProps {
  email: string;
  isLoading: boolean;
  error: string;
  success: boolean;
  onChangeEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  email,
  isLoading,
  error,
  success,
  onChangeEmail,
  onSubmit,
}) => {

  if (success) {
    return (
      <Card className="shadow-xl">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Email enviado!</h3>
              <p className="text-sm text-gray-600 mt-2">
                Enviamos instruções para recuperação de senha para {email}
              </p>
            </div>
            <div className="space-y-2">
              <Link href="/login">
                <Button className="w-full">Voltar ao Login</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Recuperar Senha</CardTitle>
        <CardDescription className="text-center">
          Digite seu email para receber instruções de recuperação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10"
                value={email}
                onChange={(e) => onChangeEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar Instruções'}
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
