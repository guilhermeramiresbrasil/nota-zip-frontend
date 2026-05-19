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
import { useGarantiasPageStore } from '../stores/useGarantiasPageStore';
import { useAuthStore } from '@/stores/useAuthStore';

interface GarantiaFormProps {
  uploadLimit: number;
}

export const GarantiaForm: React.FC<GarantiaFormProps> = ({ uploadLimit }) => {
  const { dialogOpen, setDialogOpen, formData, setFormData, resetFormData } = useGarantiasPageStore();
  const [error, setError] = React.useState('');
  const [uploadError, setUploadError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.arquivo) return;

    try {
      // TODO: Call service to create garantia with uploadLimit
      console.log('Creating garantia:', formData);
      resetFormData();
      setDialogOpen(false);
      setUploadError('');
    } catch (error) {
      console.error('Error creating garantia:', error);
      setError(error instanceof Error ? error.message : 'Erro ao criar garantia');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ arquivo: file });
    setUploadError('');

    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (uploadLimit === 0) {
        setUploadError('O plano Grátis não permite upload de arquivos. Faça upgrade para o plano Básico ou Premium.');
      } else if (fileSizeMB > uploadLimit) {
        setUploadError(`O arquivo excede o limite de ${uploadLimit} MB do seu plano. Tamanho atual: ${fileSizeMB.toFixed(2)} MB`);
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
        <Button className="flex items-center gap-2" disabled={uploadLimit === 0}>
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
            {uploadLimit === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold">Plano Grátis</p>
                  <p>O upload de arquivos não está disponível no plano Grátis. Faça upgrade para o plano Básico ou Premium.</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Produto</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ nome: e.target.value })}
                placeholder="Ex: Notebook Dell"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arquivo">
                Arquivo da Nota Fiscal
                <span className="text-gray-500 text-sm ml-2">
                  (Limite: {formatUploadLimit(uploadLimit)})
                </span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="arquivo"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  disabled={uploadLimit === 0}
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
                onChange={(e) => setFormData({ dataExpiracao: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
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
            <Button type="submit" disabled={!formData.nome || !formData.arquivo || uploadLimit === 0 || !!uploadError}>
              Salvar Garantia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
