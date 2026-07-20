'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { GarantiaSearch } from './components/GarantiaSearch';
import { GarantiaList } from './components/GarantiaList';
import { GarantiaForm } from './components/GarantiaForm';
import { StorageUsageBar } from './components/StorageUsageBar';
import { garantiaService } from './logics/services/garantiaService';
import { planService } from '../../services/planService';
import { Garantia } from './types/garantia.types';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

export default function GarantiasPage() {
  const t = useTranslations('garantias');
  const { user } = useAuth();
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLimit, setUploadLimit] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingGarantia, setEditingGarantia] = useState<Garantia | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      try {
        const [garantiasData, plansData, storageData] = await Promise.all([
          garantiaService.fetchGarantias(user.id),
          planService.fetchPlans(),
          garantiaService.fetchStorageUsage(user.id),
        ]);
        setGarantias(garantiasData);

        const userPlan = plansData.find(p => p.id === user?.plan);
        setUploadLimit(userPlan?.uploadLimit || 0);

        setStorageUsed(storageData.usedBytes / (1024 * 1024));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, user?.plan]);

  const handleEdit = (garantia: Garantia) => {
    setEditingGarantia(garantia);
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    try {
      await garantiaService.deleteGarantia(id, user.id);
      setGarantias(garantias.filter((g) => g.id !== id));
      const storageData = await garantiaService.fetchStorageUsage(user.id);
      setStorageUsed(storageData.usedBytes / (1024 * 1024));
    } catch (error) {
      console.error('Error deleting garantia:', error);
    }
  };

  const handleGarantiaCreated = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [garantiasData, storageData] = await Promise.all([
        garantiaService.fetchGarantias(user.id),
        garantiaService.fetchStorageUsage(user.id),
      ]);
      setGarantias(garantiasData);
      setStorageUsed(storageData.usedBytes / (1024 * 1024));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComplete = async () => {
    if (!user?.id) return;
    setEditingGarantia(null);
    setLoading(true);
    try {
      const [garantiasData, storageData] = await Promise.all([
        garantiaService.fetchGarantias(user.id),
        garantiaService.fetchStorageUsage(user.id),
      ]);
      setGarantias(garantiasData);
      setStorageUsed(storageData.usedBytes / (1024 * 1024));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGarantias = garantias.filter(garantia => {
    const matchesSearch = garantia.nome.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <PageHeader title={t('title')} description={t('description')} />
          <GarantiaForm
            uploadLimit={uploadLimit}
            userPlan={user?.plan || 'free'}
            userId={user?.id || ''}
            onGarantiaCreated={handleGarantiaCreated}
            editingGarantia={editingGarantia}
            onEditComplete={handleEditComplete}
          />
        </div>

        <div className="space-y-4 mb-6">
          <StorageUsageBar used={storageUsed} limit={uploadLimit} />
          <GarantiaSearch searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
        </div>

        {loading ? (
          <div className="text-center py-8">{t('loading')}</div>
        ) : filteredGarantias.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('empty')}
          </div>
        ) : (
          <GarantiaList garantias={filteredGarantias} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>
    </ProtectedRoute>
  );
}
