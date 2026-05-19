'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { ProfileSection } from './components/ProfileSection';
import { PreferencesSection } from './components/PreferencesSection';
import { DeleteAccountDialog } from './components/DeleteAccountDialog';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageHeader title="Configurações" description="Gerencie sua conta e preferências" />

        <div className="space-y-6">
          <ProfileSection />
          <PreferencesSection />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              Sair da Conta
            </button>
            <DeleteAccountDialog />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
