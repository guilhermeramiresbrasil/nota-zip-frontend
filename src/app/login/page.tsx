'use client';

import Link from 'next/link';
import { LoginLogo } from './components/LoginLogo';
import { LoginForm } from './components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <LoginLogo />
        <LoginForm />
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
