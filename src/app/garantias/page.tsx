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
import { useAuth } from '@/contexts/AuthContext';

export default function GarantiasPage() {
  const { user } = useAuth();
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLimit, setUploadLimit] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

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

        setStorageUsed(garantiasData.length * 5);
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
  };

  const handleDelete = async (id: string) => {
    try {
      await garantiaService.deleteGarantia(id);
      setGarantias(garantias.filter((g) => g.id !== id));
      setStorageUsed(prev => Math.max(prev - 5, 0));
    } catch (error) {
      console.error('Error deleting garantia:', error);
    }
  };

  const handleGarantiaCreated = () => {
    setGarantias([]);
    setLoading(true);
    fetchData();
  };

  const fetchData = async () => {
    try {
      const garantiasData = await garantiaService.fetchGarantias();
      setGarantias(garantiasData);
      setStorageUsed(garantiasData.length * 5);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGarantias = garantias.filter(garantia => {
    const matchesSearch = garantia.nome.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === '' || garantia.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <PageHeader title="Guarda Garantias" description="Armazene suas notas fiscais e documentos de garantia" />
          <GarantiaForm uploadLimit={uploadLimit} onGarantiaCreated={handleGarantiaCreated} />
        </div>

        <div className="space-y-4 mb-6">
          <StorageUsageBar used={storageUsed} limit={uploadLimit} />
          <GarantiaSearch searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
          <GarantiaTags selectedTag={selectedTag} onTagSelect={setSelectedTag} />
        </div>

        {loading ? (
          <div className="text-center py-8">Carregando garantias...</div>
        ) : filteredGarantias.length === 0 ? (
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
          <GarantiaList garantias={filteredGarantias} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>
    </ProtectedRoute>
  );
}
