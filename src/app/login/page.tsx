'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoginLogo } from './components/LoginLogo';
import { LoginForm } from './components/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LoginFormData } from './types/auth.types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      showSuccess('Login realizado com sucesso!', 'Você será redirecionado para o home.');
      router.push('/home');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      showError('Erro ao fazer login', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <LoginLogo />
        <LoginForm 
          formData={formData}
          isLoading={isLoading}
          error={error}
          onChangeFormData={setFormData}
          onSubmit={handleSubmit}
        />
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Crie uma conta
            </Link>
          </p>
          <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-700">
            Esqueceu sua senha?
          </Link>
        </div>
      </div>
    </div>
  );
}
