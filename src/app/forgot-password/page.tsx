'use client';

import { LoginLogo } from '../login/components/LoginLogo';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <LoginLogo />
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
