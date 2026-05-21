import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { LoginFormData } from '../types/auth.types';

interface LoginFormProps {
  formData: LoginFormData;
  isLoading: boolean;
  error: string;
  onChangeFormData: (data: LoginFormData) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  formData, 
  isLoading, 
  error, 
  onChangeFormData, 
  onSubmit 
}) => {

  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Bem-vindo de volta</CardTitle>
        <CardDescription className="text-center">
          Entre com suas credenciais para acessar sua conta
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
                value={formData.email}
                onChange={(e) => onChangeFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={formData.password}
                onChange={(e) => onChangeFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
