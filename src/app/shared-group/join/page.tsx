'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sharedGroupService } from '@/services/sharedGroupService';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Users, ArrowRight, Check } from 'lucide-react';

export default function SharedGroupJoinPage() {
  const router = useRouter();
  const { user, updatedUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [form, setForm] = useState({
    partnerNickname: '',
    partnerSelfNickname: '',
  });

  const handleValidateCode = () => {
    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode.length < 6) {
      showError('Insira o código completo de convite (mínimo 6 caracteres).');
      return;
    }
    setCode(trimmedCode);
    setStep(2);
  };

  const handleJoin = async () => {
    if (!form.partnerNickname.trim() || !form.partnerSelfNickname.trim()) {
      showError('Preencha os dois campos de apelido.');
      return;
    }
    if (!user?.id) return;
    setLoading(true);
    try {
      const group = await sharedGroupService.join(
        user.id,
        code.trim().toUpperCase(),
        form.partnerNickname.trim(),
        form.partnerSelfNickname.trim()
      );
      await updatedUser({
        ...user,
        sharedGroupId: group.id,
        partnerNickname: form.partnerNickname.trim(),
        selfNickname: form.partnerSelfNickname.trim(),
      });
      showSuccess(`Visão compartilhada ativa com ${form.partnerNickname}!`);
      router.push('/home');
    } catch (err: any) {
      showError(err.message || 'Erro ao entrar no grupo compartilhado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Entrar em grupo compartilhado</h1>
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
                    <CardTitle className="text-xl mb-2">Insira o código de convite</CardTitle>
                    <p className="text-gray-500 text-sm">
                      Peça o código para quem te convidou para o grupo compartilhado.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Código de convite</Label>
                    <Input
                      id="code"
                      placeholder="Ex: ABCD1234"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      maxLength={10}
                      className="text-center text-xl font-mono tracking-widest"
                    />
                  </div>

                  <Button
                    className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold"
                    onClick={handleValidateCode}
                    disabled={code.trim().length < 6}
                  >
                    <>Próximo <ArrowRight className="ml-2 h-4 w-4" /></>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-xl mb-2">Código válido!</CardTitle>
                    <p className="text-gray-500 text-sm">
                      Defina como vocês vão se identificar na visão compartilhada.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="partnerNickname">Como você vai chamar o outro membro?</Label>
                      <Input
                        id="partnerNickname"
                        placeholder="Ex: Guilherme, Pai, Sócio"
                        value={form.partnerNickname}
                        onChange={(e) => setForm({ ...form, partnerNickname: e.target.value })}
                        maxLength={30}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partnerSelfNickname">Como você quer ser chamado(a)?</Label>
                      <Input
                        id="partnerSelfNickname"
                        placeholder="Ex: Ana, Eu, Maria"
                        value={form.partnerSelfNickname}
                        onChange={(e) => setForm({ ...form, partnerSelfNickname: e.target.value })}
                        maxLength={30}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold"
                    onClick={handleJoin}
                    disabled={loading}
                  >
                    {loading ? 'Entrando...' : (
                      <>Confirmar e entrar <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
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
