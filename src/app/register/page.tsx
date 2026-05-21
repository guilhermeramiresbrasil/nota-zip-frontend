'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoginLogo } from '../login/components/LoginLogo';
import { RegisterForm } from './components/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RegisterFormData } from '@/app/login/types/auth.types';
import { registerValidation } from './logics/validations/registerValidation';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = registerValidation.validate(formData);
    if (!validation.isValid) {
      showError('Erro de validação', validation.error || 'Verifique os campos e tente novamente');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      showSuccess('Conta criada com sucesso!', 'Você será redirecionado para o onboarding.');
      
      setTimeout(() => {
        router.push('/onboarding');
      }, 100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao realizar cadastro';
      showError('Erro ao criar conta', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <LoginLogo />
        <RegisterForm 
          formData={formData}
          isLoading={isLoading}
          error={error}
          onChangeFormData={setFormData}
          onSubmit={handleSubmit}
        />
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
