import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FileText, Calendar, Trash2, Edit, Download } from 'lucide-react';
import { Garantia } from '../types/garantia.types';

interface GarantiaListProps {
  garantias: Garantia[];
  onEdit: (garantia: Garantia) => void;
  onDelete: (id: string) => void;
}

export const GarantiaList: React.FC<GarantiaListProps> = ({
  garantias,
  onEdit,
  onDelete,
}) => {
  const t = useTranslations('garantias');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [garantiaToDelete, setGarantiaToDelete] = useState<Garantia | null>(null);

  const handleDelete = () => {
    if (garantiaToDelete) {
      onDelete(garantiaToDelete.id);
      setGarantiaToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const isExpiringSoon = (dataExpiracao: string) => {
    const expDate = new Date(dataExpiracao);
    const today = new Date();
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (dataExpiracao: string) => {
    return new Date(dataExpiracao) < new Date();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {garantias.map((garantia) => (
          <Card
            key={garantia.id}
            className={`${
              isExpired(garantia.dataExpiracao)
                ? 'border-red-500'
                : isExpiringSoon(garantia.dataExpiracao)
                ? 'border-yellow-500'
                : ''
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {garantia.nome}
                </span>
                {isExpired(garantia.dataExpiracao) && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                    {t('expired')}
                  </span>
                )}
                {isExpiringSoon(garantia.dataExpiracao) && !isExpired(garantia.dataExpiracao) && (
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                    {t('expiringSoon')}
                  </span>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('expiresOn', { date: new Date(garantia.dataExpiracao).toLocaleDateString('pt-BR') })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {garantia.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onEdit(garantia)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t('edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = garantia.arquivoUrl;
                      link.download = garantia.arquivoNome;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {t('download')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setGarantiaToDelete(garantia);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('deleteWarranty')}
        description={t('deleteWarrantyDescription', { name: garantiaToDelete?.nome })}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
};
