'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { sharedGroupService, SharedGroup } from '@/services/sharedGroupService';
import { Link, Users, Copy, Check, UserPlus } from 'lucide-react';

export function SharedGroupSection() {
  const { user } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<SharedGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.id || user.plan !== 'shared') {
      setLoading(false);
      return;
    }
    sharedGroupService.getGroup(user.id).then((g) => {
      setGroup(g);
      setLoading(false);
    });
  }, [user?.id, user?.plan]);

  const handleCopy = async () => {
    if (!group?.inviteCode) return;
    await navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (user?.plan !== 'shared') return null;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-gray-400">Carregando grupo compartilhado...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link className="h-5 w-5 text-rose-500" />
          Grupo Compartilhado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!group ? (
          <div className="text-center py-4 space-y-3">
            <p className="text-gray-500 text-sm">Você ainda não configurou seu grupo compartilhado.</p>
            <Button
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
              onClick={() => router.push('/shared-group/setup')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Configurar grupo
            </Button>
          </div>
        ) : group.status === 'pending' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>Aguardando o outro membro aceitar o convite.</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Código de convite</p>
              <p className="text-2xl font-mono font-bold tracking-widest text-rose-600">{group.inviteCode}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleCopy}>
              {copied ? (
                <><Check className="h-4 w-4 mr-2 text-green-600" />Copiado!</>
              ) : (
                <><Copy className="h-4 w-4 mr-2" />Copiar código</>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>Grupo ativo — visão compartilhada disponível.</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">Você</p>
                <p className="font-medium">{user?.selfNickname || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">Outro membro</p>
                <p className="font-medium">{user?.partnerNickname || '—'}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full text-sm"
              onClick={() => router.push('/shared-group/setup')}
            >
              Atualizar apelidos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
