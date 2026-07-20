'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LoginLogo } from '../login/components/LoginLogo';
import { RegisterForm } from './components/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RegisterFormData } from '@/app/login/types/auth.types';
import { registerValidation } from './logics/validations/registerValidation';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
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
      showError(t('validationError'), tErrors(validation.error || 'generic'));
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      showSuccess(t('accountCreated'), t('redirecting'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('registerError');
      showError(t('registerError'), errorMessage);
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
            {t('alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
