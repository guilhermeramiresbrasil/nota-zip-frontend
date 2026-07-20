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
import { useTranslations } from 'next-intl';
import { sharedGroupService, SharedGroup } from '@/services/sharedGroupService';
import { planService } from '@/services/planService';
import { Link, Users, Copy, Check, UserPlus, LogOut, Edit2, X, Share2, TrendingUp } from 'lucide-react';

export function SharedGroupSection() {
  const { user, updatedUser } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const t = useTranslations('sharedGroup');
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
    const text = encodeURIComponent(t('shareText', { code: group.inviteCode }));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleUpdateNicknames = async () => {
    if (!user?.id) return;
    if (!form.ownerNickname.trim() || !form.ownerSelfNickname.trim()) {
      showError('Erro', t('fillBoth'));
      return;
    }
    setLoading(true);
    try {
      await updatedUser({
        ...user,
        partnerNickname: form.ownerNickname.trim(),
        selfNickname: form.ownerSelfNickname.trim(),
      });
      showSuccess(t('nicknamesUpdated'), t('nicknamesUpdatedDescription'));
      setIsEditing(false);
    } catch (err: any) {
      showError('Erro', err.message || t('defaultError'));
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
      showSuccess(t('left'));
    } catch (err: any) {
      showError(err.message || t('leaveError'));
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
      showError('Erro', t('enterInviteCode'));
      return;
    }
    if (!form.ownerNickname.trim() || !form.ownerSelfNickname.trim()) {
      showError('Erro', t('fillNicknames'));
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
      showSuccess(t('joined'), t('joinedDescription'));
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
            {t('title')}
          </CardTitle>
          <CardDescription className="mt-1">
            {t('joinDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">{t('inviteCode')}</Label>
              <Input
                id="inviteCode"
                placeholder={t('inviteCodePlaceholder')}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="partnerNickname">{t('partnerNickname')}</Label>
                <Input
                  id="partnerNickname"
                  placeholder={t('partnerNicknamePlaceholder')}
                  value={form.ownerNickname}
                  onChange={(e) => setForm({ ...form, ownerNickname: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selfNickname">{t('selfNickname')}</Label>
                <Input
                  id="selfNickname"
                  placeholder={t('selfNicknamePlaceholder')}
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
              {joining ? t('joining') : t('joinGroup')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-gray-400">{t('loading')}</CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-rose-500" />
            {t('title')}
          </CardTitle>
          <CardDescription className="mt-1">
            {t('manageDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!group ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Users className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{t('notConfigured')}</p>
                  <p className="text-xs text-slate-500">{t('notConfiguredDescription')}</p>
                </div>
              </div>
              <Button
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                onClick={() => router.push('/shared-group/setup')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {t('setup')}
              </Button>
            </div>
          ) : group.status === 'pending' ? (
            <>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <Users className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{t('pending')}</p>
                    <p className="text-xs text-slate-500">{t('pendingDescription')}</p>
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
                      <><Check className="h-3.5 w-3.5" />{t('copied')}</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" />{t('copy')}</>
                    )}
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5"
                    onClick={handleShareWhatsApp}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    {t('whatsapp')}
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
                  <p className="text-sm font-medium text-slate-800">{t('active')}</p>
                  <p className="text-xs text-slate-500">{t('activeDescription')}</p>
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
                    <Label htmlFor="partnerNickname">{t('partnerNickname')}</Label>
                    <Input
                      id="partnerNickname"
                      placeholder={t('partnerNicknamePlaceholder')}
                      value={form.ownerNickname}
                      onChange={(e) => setForm({ ...form, ownerNickname: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="selfNickname">{t('selfNickname')}</Label>
                    <Input
                      id="selfNickname"
                      placeholder={t('selfNicknamePlaceholder')}
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
                    {loading ? t('updating') : t('updateNicknames')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                  >
                    {t('cancel')}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLeaveGroup}
                  disabled={leaving}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {leaving ? t('leaving') : t('leaveGroup')}
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
      title={t('leaveTitle')}
      description={t('leaveDescription')}
      confirmText={t('leaveConfirm')}
      cancelText={t('leaveCancel')}
      onConfirm={confirmLeaveGroup}
      variant="destructive"
    />
    </>
  );
}
