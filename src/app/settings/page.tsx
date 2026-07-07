'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { ProfileSection } from './components/ProfileSection';
import { CategoriesSection } from './components/CategoriesSection';
import { WhatsAppSection } from './components/WhatsAppSection';
import { DeleteAccountDialog } from './components/DeleteAccountDialog';
import { IUser, useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import userService from '@/services/userService';
import { defaultProfile } from './types/settings.types';

export default function SettingsPage() {
  const { user, logout, deleteAccount, updatedUser } = useAuth();
  const router = useRouter();  
  const { showSuccess, showError } = useToast();

  const [formUser, setFormUser] = useState<IUser>(defaultProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormUser({
        ...user,
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const handleDeleteAccount = async () => {
    try { 
      setIsDeleting(true);
      await deleteAccount();
      showSuccess('Conta excluída com sucesso');
      handleLogout();
    } catch (error) {
      showError('Erro ao excluir conta', 'Não foi possível excluir sua conta. Tente novamente.');
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };
  

  const handleSave = async () => {
    if (!formUser.id) return;
    setIsLoading(true);
    try {
      await updatedUser(formUser);
      showSuccess('Perfil salvo com sucesso!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar perfil';
      showError('Erro ao salvar perfil', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageHeader title="Configurações" description="Gerencie sua conta e preferências" />

        <div className="space-y-6">
          <ProfileSection 
            user={formUser} 
            onChangeUser={setFormUser}
            handleSave={handleSave}
            isLoading={isLoading}
          />
          <CategoriesSection />
          <WhatsAppSection />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              Sair da Conta
            </button>
            <DeleteAccountDialog 
              handleDeleteAccount={handleDeleteAccount}
              isDeleting={isDeleting}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
