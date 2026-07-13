'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function TemporaryPasswordGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.isTemporaryPassword) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/change-password' && currentPath !== '/login') {
        router.push('/change-password');
      }
    }
  }, [user, router]);

  if (user?.isTemporaryPassword) {
    const currentPath = window.location.pathname;
    if (currentPath !== '/change-password' && currentPath !== '/login') {
      return null;
    }
  }

  return <>{children}</>;
}
