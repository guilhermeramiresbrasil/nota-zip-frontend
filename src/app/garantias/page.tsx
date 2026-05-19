'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { GarantiaSearch } from './components/GarantiaSearch';
import { GarantiaTags } from './components/GarantiaTags';
import { GarantiaList } from './components/GarantiaList';
import { GarantiaForm } from './components/GarantiaForm';
import { StorageUsageBar } from './components/StorageUsageBar';
import { garantiaService } from './logics/services/garantiaService';
import { planService } from '../plans/logics/services/planService';
import { Garantia } from './types/garantia.types';
import { useAuthStore } from '@/stores/useAuthStore';

export default function GarantiasPage() {
  const { user } = useAuthStore();
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLimit, setUploadLimit] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0); // em MB

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [garantiasData, plansData] = await Promise.all([
          garantiaService.fetchGarantias(),
          planService.fetchPlans(),
        ]);
        setGarantias(garantiasData);

        const userPlan = plansData.find(p => p.id === user?.plan);
        setUploadLimit(userPlan?.uploadLimit || 0);

        // TODO: Calcular tamanho real dos arquivos quando tiver dados reais
        // Por enquanto, simulamos um valor
        setStorageUsed(garantiasData.length * 5); // Assume 5MB por arquivo
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.plan]);

  const handleEdit = (garantia: Garantia) => {
    console.log('Edit garantia:', garantia);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (id: string) => {
    try {
      await garantiaService.deleteGarantia(id);
      setGarantias(garantias.filter((g) => g.id !== id));
      // Recalcula o storage usado
      setStorageUsed(prev => Math.max(prev - 5, 0));
    } catch (error) {
      console.error('Error deleting garantia:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <PageHeader title="Guarda Garantias" description="Armazene suas notas fiscais e documentos de garantia" />
          <GarantiaForm uploadLimit={uploadLimit} />
        </div>

        <div className="space-y-4 mb-6">
          <StorageUsageBar used={storageUsed} limit={uploadLimit} />
          <GarantiaSearch />
          <GarantiaTags />
        </div>

        {loading ? (
          <div className="text-center py-8">Carregando garantias...</div>
        ) : garantias.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {uploadLimit === 0 ? (
              <>
                <p>Nenhuma garantia cadastrada.</p>
                <p className="mt-2">O upload de arquivos não está disponível no plano Grátis. Faça upgrade para o plano Básico ou Premium.</p>
              </>
            ) : (
              'Nenhuma garantia cadastrada. Clique em "Nova Garantia" para começar.'
            )}
          </div>
        ) : (
          <GarantiaList garantias={garantias} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>
    </ProtectedRoute>
  );
}
