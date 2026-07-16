'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sharedGroupService, SharedGroup } from '@/services/sharedGroupService';
import { planService } from '@/services/planService';
import { Link, Users, Copy, Check, UserPlus, LogOut, Edit2, X, Share2, TrendingUp } from 'lucide-react';

export function SharedGroupSection() {
  const { user, updatedUser } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [group, setGroup] = useState<SharedGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [form, setForm] = useState({
    ownerNickname: user?.partnerNickname || '',
    ownerSelfNickname: user?.selfNickname || '',
  });

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

  const handleShareWhatsApp = () => {
    if (!group?.inviteCode) return;
    const text = encodeURIComponent(
      `Olá! Te convido para compartilhar meu controle financeiro no Nota Zip.\nUse o código: *${group.inviteCode}*\n\nBaixe o app e acesse Configurações > Grupo Compartilhado > Entrar em grupo.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleUpdateNicknames = async () => {
    if (!user?.id) return;
    if (!form.ownerNickname.trim() || !form.ownerSelfNickname.trim()) {
      showError('Erro', 'Preencha os dois campos.');
      return;
    }
    setLoading(true);
    try {
      await updatedUser({
        ...user,
        partnerNickname: form.ownerNickname.trim(),
        selfNickname: form.ownerSelfNickname.trim(),
      });
      showSuccess('Apelidos atualizados', 'Seus apelidos foram atualizados com sucesso.');
      setIsEditing(false);
    } catch (err: any) {
      showError('Erro', err.message || 'Não foi possível atualizar os apelidos.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!user?.id) return;
    setShowLeaveDialog(true);
  };

  const confirmLeaveGroup = async () => {
    if (!user?.id) return;
    setLeaving(true);
    try {
      await sharedGroupService.leave(user.id);
      await updatedUser({
        ...user,
        sharedGroupId: undefined,
        partnerNickname: undefined,
        selfNickname: undefined,
      });
      setGroup(null);
      showSuccess('Você saiu do grupo compartilhado.');
    } catch (err: any) {
      showError(err.message || 'Erro ao sair do grupo.');
    } finally {
      setLeaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({
      ownerNickname: user?.partnerNickname || '',
      ownerSelfNickname: user?.selfNickname || '',
    });
  };

  const handleJoinGroup = async () => {
    if (!user?.id) return;
    if (!inviteCode.trim()) {
      showError('Erro', 'Digite o código de convite.');
      return;
    }
    if (!form.ownerNickname.trim() || !form.ownerSelfNickname.trim()) {
      showError('Erro', 'Preencha os apelidos.');
      return;
    }
    setJoining(true);
    try {
      await sharedGroupService.join(
        user.id,
        inviteCode.trim(),
        form.ownerNickname.trim(),
        form.ownerSelfNickname.trim()
      );
      showSuccess('Sucesso', 'Você entrou no grupo compartilhado!');
      setInviteCode('');
      // Update user with shared plan
      await updatedUser({
        ...user,
        plan: 'shared',
      });
      // Reload group data
      const g = await sharedGroupService.getGroup(user.id);
      setGroup(g);
    } catch (err: any) {
      showError('Erro', err.message || 'Não foi possível entrar no grupo. Verifique o código.');
    } finally {
      setJoining(false);
    }
  };

  if (user?.plan !== 'shared') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-rose-500" />
            Grupo Compartilhado
          </CardTitle>
          <CardDescription className="mt-1">
            Entre em um grupo compartilhado usando um código de convite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Código de convite</Label>
              <Input
                id="inviteCode"
                placeholder="Digite o código de convite"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="partnerNickname">Como chamar o outro</Label>
                <Input
                  id="partnerNickname"
                  placeholder="Ex: João, Mãe"
                  value={form.ownerNickname}
                  onChange={(e) => setForm({ ...form, ownerNickname: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selfNickname">Como te chamam</Label>
                <Input
                  id="selfNickname"
                  placeholder="Ex: Eu, Maria"
                  value={form.ownerSelfNickname}
                  onChange={(e) => setForm({ ...form, ownerSelfNickname: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={handleJoinGroup}
              disabled={joining || !inviteCode.trim() || !form.ownerNickname.trim() || !form.ownerSelfNickname.trim()}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {joining ? 'Entrando...' : 'Entrar no grupo'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-gray-400">Carregando grupo compartilhado...</CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-rose-500" />
            Grupo Compartilhado
          </CardTitle>
          <CardDescription className="mt-1">
            Configure e gerencie seu grupo compartilhado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!group ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Users className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Grupo não configurado</p>
                  <p className="text-xs text-slate-500">Configure seu grupo para compartilhar finanças</p>
                </div>
              </div>
              <Button
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                onClick={() => router.push('/shared-group/setup')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          ) : group.status === 'pending' ? (
            <>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <Users className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Aguardando aceitação</p>
                    <p className="text-xs text-slate-500">Compartilhe o código com o outro membro</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-8 w-8"
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                </Button>
              </div>

              {isEditing && (
              <div className="space-y-3 p-3 rounded-lg bg-rose-50 border border-rose-100">
                <div className="flex items-center justify-center bg-white px-4 py-3 rounded-lg border border-rose-200">
                  <span className="text-2xl font-mono font-bold tracking-widest text-rose-600">{group.inviteCode}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="flex-1 gap-1.5"
                  >
                    {copied ? (
                      <><Check className="h-3.5 w-3.5" />Copiado!</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" />Copiar</>
                    )}
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5"
                    onClick={handleShareWhatsApp}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100">
              <div className="flex items-center gap-2.5">
                <Users className="h-5 w-5 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Grupo ativo</p>
                  <p className="text-xs text-slate-500">Visão compartilhada disponível</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 w-8"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
              </Button>
            </div>

            {isEditing && (
              <div className="space-y-3 p-3 rounded-lg bg-rose-50 border border-rose-100">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="partnerNickname">Como chamar o outro</Label>
                    <Input
                      id="partnerNickname"
                      placeholder="Ex: João, Mãe"
                      value={form.ownerNickname}
                      onChange={(e) => setForm({ ...form, ownerNickname: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="selfNickname">Como te chamam</Label>
                    <Input
                      id="selfNickname"
                      placeholder="Ex: Eu, Maria"
                      value={form.ownerSelfNickname}
                      onChange={(e) => setForm({ ...form, ownerSelfNickname: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateNicknames}
                    disabled={loading || !form.ownerNickname.trim() || !form.ownerSelfNickname.trim()}
                    className="flex-1"
                  >
                    {loading ? 'Atualizando...' : 'Atualizar apelidos'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLeaveGroup}
                  disabled={leaving}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {leaving ? 'Saindo...' : 'Sair do grupo'}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>

    <ConfirmDialog
      open={showLeaveDialog}
      onOpenChange={setShowLeaveDialog}
      title="Sair do grupo compartilhado"
      description="Tem certeza que deseja sair do grupo compartilhado? Esta ação não pode ser desfeita e você voltará ao seu plano anterior."
      confirmText="Sair do grupo"
      cancelText="Cancelar"
      onConfirm={confirmLeaveGroup}
      variant="destructive"
    />
    </>
  );
}
