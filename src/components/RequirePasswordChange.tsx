'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface RequirePasswordChangeProps {
  children: React.ReactNode;
}

export function RequirePasswordChange({ children }: RequirePasswordChangeProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user doesn't have temporary password, redirect to home
    if (user && !user.isTemporaryPassword) {
      router.push('/home');
    }
  }, [user, router]);

  // Only render children if user has temporary password
  if (!user || !user.isTemporaryPassword) {
    return null;
  }

  return <>{children}</>;
}
