import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Plus, AlertCircle } from 'lucide-react';
import { garantiaService, PLAN_PER_FILE_LIMITS } from '../logics/services/garantiaService';
import { useTranslations } from 'next-intl';
import { Garantia } from '../types/garantia.types';

interface GarantiaFormProps {
  uploadLimit: number;
  userPlan: string;
  userId: string;
  onGarantiaCreated?: () => void;
  editingGarantia?: Garantia | null;
  onEditComplete?: () => void;
}

interface GarantiaFormData {
  nome: string;
  arquivo: File | null;
  dataExpiracao: string;
  tags: string[];
}

export const GarantiaForm: React.FC<GarantiaFormProps> = ({ uploadLimit, userPlan, userId, onGarantiaCreated, editingGarantia, onEditComplete }) => {
  const t = useTranslations('garantias');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<GarantiaFormData>({
    nome: '',
    arquivo: null,
    dataExpiracao: '',
    tags: [],
  });
  const [error, setError] = React.useState('');
  const [uploadError, setUploadError] = React.useState('');

  // Sync form data when editingGarantia changes
  React.useEffect(() => {
    if (editingGarantia) {
      setFormData({
        nome: editingGarantia.nome,
        arquivo: null,
        dataExpiracao: editingGarantia.dataExpiracao,
        tags: editingGarantia.tags,
      });
      setDialogOpen(true);
    } else {
      resetFormData();
      setDialogOpen(false);
    }
  }, [editingGarantia]);

  const resetFormData = () => {
    setFormData({
      nome: '',
      arquivo: null,
      dataExpiracao: '',
      tags: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return;
    setError('');

    try {
      if (editingGarantia) {
        // Update existing garantia
        await garantiaService.updateGarantia(
          editingGarantia.id,
          { nome: formData.nome, arquivo: formData.arquivo, dataExpiracao: formData.dataExpiracao, tags: formData.tags },
          formData.arquivo,
          userId,
          userPlan
        );
        resetFormData();
        setDialogOpen(false);
        setUploadError('');
        onEditComplete?.();
      } else {
        // Create new garantia
        if (!formData.arquivo) return;
        await garantiaService.createGarantia(
          { nome: formData.nome, arquivo: formData.arquivo, dataExpiracao: formData.dataExpiracao, tags: formData.tags },
          formData.arquivo,
          userId,
          userPlan
        );
        resetFormData();
        setDialogOpen(false);
        setUploadError('');
        onGarantiaCreated?.();
      }
    } catch (err) {
      console.error('Error saving garantia:', err);
      setError(err instanceof Error ? err.message : t('saveError'));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, arquivo: file }));
    setUploadError('');

    if (file) {
      const perFileLimit = PLAN_PER_FILE_LIMITS[userPlan] ?? PLAN_PER_FILE_LIMITS.free;
      if (file.size > perFileLimit) {
        setUploadError(t('fileLimitExceeded', {
          plan: userPlan,
          limit: `${(perFileLimit / (1024 * 1024)).toFixed(0)} MB`,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        }));
      }
    }
  };

  const formatUploadLimit = (limit: number) => {
    if (limit === 0) return t('notAllowed');
    if (limit >= 1024) return t('gb', { value: (limit / 1024).toFixed(0) });
    return t('mb', { value: limit });
  };

  return (
    <>
      <Dialog open={dialogOpen && !editingGarantia} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          resetFormData();
        }
      }}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('newWarranty')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('addWarrantyTitle')}</DialogTitle>
            <DialogDescription>
              {t('addWarrantyDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">{t('productName')}</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder={t('productNamePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arquivo">
                  {t('fileLabel')}
                  <span className="text-gray-500 text-sm ml-2">
                    ({t('fileLimit', { limit: `${(PLAN_PER_FILE_LIMITS[userPlan] ?? PLAN_PER_FILE_LIMITS.free) / (1024 * 1024)} MB` })})
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="arquivo"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {formData.arquivo && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <Upload className="h-4 w-4" />
                      {formData.arquivo.name}
                    </span>
                  )}
                </div>
                {uploadError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {uploadError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataExpiracao">{t('expirationDate')}</Label>
                <Input
                  id="dataExpiracao"
                  type="date"
                  value={formData.dataExpiracao}
                  onChange={(e) => setFormData({ ...formData, dataExpiracao: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">{t('tags')}</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  placeholder={t('tagsPlaceholder')}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={!formData.nome || !formData.arquivo || !!uploadError}>
                {t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen && !!editingGarantia} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          resetFormData();
          onEditComplete?.();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('editWarrantyTitle')}</DialogTitle>
            <DialogDescription>
              {t('editWarrantyDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome-edit">{t('productName')}</Label>
                <Input
                  id="nome-edit"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder={t('productNamePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arquivo-edit">
                  {t('fileLabel')}
                  <span className="text-gray-500 text-sm ml-2">
                    ({t('keepFileEmpty')})
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="arquivo-edit"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {formData.arquivo && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <Upload className="h-4 w-4" />
                      {formData.arquivo.name}
                    </span>
                  )}
                </div>
                {uploadError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {uploadError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataExpiracao-edit">{t('expirationDate')}</Label>
                <Input
                  id="dataExpiracao-edit"
                  type="date"
                  value={formData.dataExpiracao}
                  onChange={(e) => setFormData({ ...formData, dataExpiracao: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags-edit">{t('tags')}</Label>
                <Input
                  id="tags-edit"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  placeholder={t('tagsPlaceholder')}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setDialogOpen(false);
                resetFormData();
                onEditComplete?.();
              }}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={!formData.nome || !!uploadError}>
                {t('update')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
