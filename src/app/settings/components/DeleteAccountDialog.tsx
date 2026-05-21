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
import { Trash2, AlertTriangle } from 'lucide-react';


interface DeleteAccountDialogProps {
  handleDeleteAccount: () => void;
  isDeleting: boolean;
}

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ handleDeleteAccount, isDeleting }) => {
  const [isOpen, setIsOpen] = React.useState(false);


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir Conta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Excluir Conta
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente
            removidos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
