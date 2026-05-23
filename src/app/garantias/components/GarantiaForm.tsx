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

interface GarantiaFormProps {
  uploadLimit: number;
  userPlan: string;
  userId: string;
  onGarantiaCreated?: () => void;
}

interface GarantiaFormData {
  nome: string;
  arquivo: File | null;
  dataExpiracao: string;
  tags: string[];
}

export const GarantiaForm: React.FC<GarantiaFormProps> = ({ uploadLimit, userPlan, userId, onGarantiaCreated }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<GarantiaFormData>({
    nome: '',
    arquivo: null,
    dataExpiracao: '',
    tags: [],
  });
  const [error, setError] = React.useState('');
  const [uploadError, setUploadError] = React.useState('');

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
    if (!formData.nome || !formData.arquivo) return;
    setError('');

    try {
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
    } catch (err) {
      console.error('Error creating garantia:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar garantia');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, arquivo: file }));
    setUploadError('');

    if (file) {
      const perFileLimit = PLAN_PER_FILE_LIMITS[userPlan] ?? PLAN_PER_FILE_LIMITS.free;
      if (file.size > perFileLimit) {
        setUploadError(`O arquivo excede o limite por arquivo do plano ${userPlan} (${perFileLimit / (1024 * 1024)} MB). Tamanho: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      }
    }
  };

  const formatUploadLimit = (limit: number) => {
    if (limit === 0) return '0 MB (não permitido)';
    if (limit >= 1024) return `${(limit / 1024).toFixed(0)} GB`;
    return `${limit} MB`;
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Garantia
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Garantia</DialogTitle>
          <DialogDescription>
            Faça upload da nota fiscal ou documento de garantia
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Produto</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Notebook Dell"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arquivo">
                Arquivo da Nota Fiscal
                <span className="text-gray-500 text-sm ml-2">
                  (Limite por arquivo: {(PLAN_PER_FILE_LIMITS[userPlan] ?? PLAN_PER_FILE_LIMITS.free) / (1024 * 1024)} MB)
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
              <Label htmlFor="dataExpiracao">Data de Expiração da Garantia</Label>
              <Input
                id="dataExpiracao"
                type="date"
                value={formData.dataExpiracao}
                onChange={(e) => setFormData({ ...formData, dataExpiracao: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="Ex: eletrônicos, notebook"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.nome || !formData.arquivo || !!uploadError}>
              Salvar Garantia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
