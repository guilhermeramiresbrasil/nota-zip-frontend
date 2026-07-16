'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PersonalDataSection } from './components/PersonalDataSection';
import { EmailSection } from './components/EmailSection';
import { CategoriesSection } from './components/CategoriesSection';
import { WhatsAppSection } from './components/WhatsAppSection';
import { SharedGroupSection } from './components/SharedGroupSection';
import { SubscriptionSection } from './components/SubscriptionSection';
import { DeleteAccountDialog } from './components/DeleteAccountDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, logout, deleteAccount } = useAuth();
  const router = useRouter();  
  const { showSuccess, showError } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

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

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageHeader title="Configurações" description="Gerencie sua conta e preferências" />

        <div className="space-y-6">
          <PersonalDataSection />
          <SubscriptionSection />
          <SharedGroupSection />
          <CategoriesSection />
          <EmailSection />
          <WhatsAppSection />
          

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              Sair da Conta
            </Button>
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
