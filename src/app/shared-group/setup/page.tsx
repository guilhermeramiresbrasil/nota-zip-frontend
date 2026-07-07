'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sharedGroupService } from '@/services/sharedGroupService';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Link, Copy, Check, Share2, ArrowRight } from 'lucide-react';

export default function SharedGroupSetupPage() {
  const router = useRouter();
  const { user, updatedUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [form, setForm] = useState({
    ownerNickname: '',
    ownerSelfNickname: '',
  });

  const handleGenerate = async () => {
    if (!form.ownerNickname.trim() || !form.ownerSelfNickname.trim()) {
      showError('Preencha os dois campos antes de continuar.');
      return;
    }
    if (!user?.id) return;
    setLoading(true);
    try {
      const group = await sharedGroupService.setup(user.id, form.ownerNickname.trim(), form.ownerSelfNickname.trim());
      setInviteCode(group.inviteCode);
      await updatedUser({
        ...user,
        sharedGroupId: group.id,
        partnerNickname: form.ownerNickname.trim(),
        selfNickname: form.ownerSelfNickname.trim(),
      });
      setStep(2);
    } catch (err: any) {
      showError(err.message || 'Erro ao gerar código de convite.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Te convido para compartilhar meu controle financeiro no Nota Zip.\nUse o código: *${inviteCode}*\n\nBaixe o app e acesse Configurações > Grupo Compartilhado > Entrar em grupo.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Link className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Plano Compartilhado</h1>
            <p className="text-gray-500 mt-1 text-sm">Passo {step} de 2</p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
            <div
              className="bg-gradient-to-r from-rose-500 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>

          <Card className="shadow-xl">
            <CardContent className="p-8">
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <CardTitle className="text-xl mb-2">Como vamos chamar vocês?</CardTitle>
                    <p className="text-gray-500 text-sm">
                      Defina apelidos para identificar os registros de cada pessoa na visão compartilhada.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerNickname">Como você vai chamar o outro membro?</Label>
                      <Input
                        id="ownerNickname"
                        placeholder="Ex: João, Mãe, Sócio, Ana"
                        value={form.ownerNickname}
                        onChange={(e) => setForm({ ...form, ownerNickname: e.target.value })}
                        maxLength={30}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerSelfNickname">Como você quer ser chamado(a)?</Label>
                      <Input
                        id="ownerSelfNickname"
                        placeholder="Ex: Guilherme, Eu, Maria"
                        value={form.ownerSelfNickname}
                        onChange={(e) => setForm({ ...form, ownerSelfNickname: e.target.value })}
                        maxLength={30}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    {loading ? 'Gerando...' : (
                      <>Gerar código de convite <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <CardTitle className="text-xl mb-2">Compartilhe o código</CardTitle>
                    <p className="text-gray-500 text-sm">
                      Envie este código para a pessoa que vai compartilhar o controle financeiro com você.
                    </p>
                  </div>

                  <div className="bg-gray-50 border-2 border-dashed border-rose-200 rounded-xl p-6 text-center">
                    <p className="text-4xl font-mono font-bold tracking-widest text-rose-600">{inviteCode}</p>
                    <p className="text-xs text-gray-400 mt-2">Código de uso único</p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <><Check className="h-4 w-4 mr-2 text-green-600" />Copiado!</>
                      ) : (
                        <><Copy className="h-4 w-4 mr-2" />Copiar</>
                      )}
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleShareWhatsApp}
                    >
                      <Share2 className="h-4 w-4 mr-2" />WhatsApp
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    O outro membro deve acessar <strong>Configurações &gt; Grupo Compartilhado &gt; Entrar em grupo</strong> e inserir este código.
                  </p>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.push('/home')}
                  >
                    Ir para o início
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
