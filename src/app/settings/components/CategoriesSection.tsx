'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tag, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { categoryService, Category } from '@/app/expenses/logics/services/categoryService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<string, string> = {
  credit: 'text-green-600 bg-green-50',
  debit: 'text-red-600 bg-red-50',
  both: 'text-slate-600 bg-slate-100',
};

interface FormState {
  name: string;
  parentId: string;
}

const emptyForm: FormState = { name: '', parentId: '' };

export function CategoriesSection() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // Categorias globais (pai disponíveis para selecionar)
  const [globalCats, setGlobalCats] = useState<Category[]>([]);
  // Subcategorias do usuário agrupadas por pai
  const [userSubs, setUserSubs] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Busca tudo (globais + do usuário); API retorna raízes com subcategories[] aninhadas
      const roots = await categoryService.fetchCategories(undefined, user.id);
      // Categorias raiz globais (sem userId = sistema)
      setGlobalCats(roots.filter((c) => !c.userId));
      // Achata todas as subcategories de todas as raízes e filtra as do usuário
      const allSubs = roots.flatMap((c) => c.subcategories ?? []);
      setUserSubs(allSubs.filter((s) => s.userId === user.id));
    } catch {
      showError('Erro', 'Não foi possível carregar as categorias.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const openCreate = (preselectedParentId?: string) => {
    setEditTarget(null);
    setForm({ name: '', parentId: preselectedParentId ?? '' });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setForm({ name: cat.name, parentId: cat.parentId ?? '' });
    setModalOpen(true);
  };

  const selectedParent = globalCats.find((c) => c.id === form.parentId);

  const handleSave = async () => {
    if (!user?.id || !form.name.trim() || !form.parentId) return;
    setSaving(true);
    try {
      if (editTarget) {
        await categoryService.updateCategory(editTarget.id, {
          userId: user.id,
          name: form.name.trim(),
          type: selectedParent?.type as 'credit' | 'debit' | 'both' | undefined,
        });
        showSuccess('Subcategoria atualizada!');
      } else {
        await categoryService.createCategory({
          name: form.name.trim(),
          type: (selectedParent?.type ?? 'both') as 'credit' | 'debit' | 'both',
          parentId: form.parentId,
          userId: user.id,
        });
        showSuccess('Subcategoria criada!');
      }
      setModalOpen(false);
      await load();
    } catch {
      showError('Erro', 'Não foi possível salvar a subcategoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !deleteTarget) return;
    setDeleting(true);
    try {
      await categoryService.deleteCategory(deleteTarget.id, user.id);
      showSuccess('Subcategoria excluída.');
      setDeleteTarget(null);
      await load();
    } catch {
      showError('Erro', 'Não foi possível excluir a subcategoria.');
    } finally {
      setDeleting(false);
    }
  };

  // Agrupa subcategorias do usuário por categoria pai
  const grouped = globalCats
    .map((parent) => ({
      parent,
      subs: userSubs.filter((s) => s.parentId === parent.id),
    }))
    .filter((g) => g.subs.length > 0);

  const totalSubs = userSubs.length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Minhas Subcategorias
              </CardTitle>
              <CardDescription className="mt-1">
                Adicione subcategorias personalizadas dentro das categorias padrão (ex: "Açaí" em Alimentação).
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => openCreate()} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nova
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-6">Carregando…</p>
          ) : totalSubs === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
              <Tag className="h-8 w-8 opacity-30" />
              <p className="text-sm">Nenhuma subcategoria personalizada ainda.</p>
              <Button variant="outline" size="sm" onClick={() => openCreate()} className="mt-1 gap-1.5">
                <Plus className="h-4 w-4" />
                Criar primeira subcategoria
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map(({ parent, subs }) => (
                <div key={parent.id}>
                  {/* Cabeçalho do grupo pai */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: parent.color ?? '#94a3b8' }}
                      />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {parent.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCreate(parent.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-0.5 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Adicionar
                    </button>
                  </div>
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 overflow-hidden">
                    {subs.map((sub) => (
                      <li key={sub.id} className="flex items-center justify-between px-3 py-2.5 gap-3 bg-white">
                        <div className="flex items-center gap-2 min-w-0">
                          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                          <span className="text-sm text-slate-800 truncate">{sub.name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEdit(sub)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            aria-label="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(sub)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Editar subcategoria' : 'Nova subcategoria'}</DialogTitle>
            <DialogDescription>
              {editTarget
                ? 'Altere o nome da subcategoria.'
                : 'Escolha uma categoria pai e dê um nome à subcategoria.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            {/* Categoria pai */}
            <div className="space-y-1.5">
              <Label>Categoria pai</Label>
              <Select
                value={form.parentId}
                onValueChange={(v) => setForm((f) => ({ ...f, parentId: v }))}
                disabled={!!editTarget}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria…" />
                </SelectTrigger>
                <SelectContent>
                  {globalCats.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color ?? '#94a3b8' }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedParent && (
                <p className="text-[11px] text-slate-400">
                  Tipo herdado:{' '}
                  <span className={cn('font-semibold px-1 py-0.5 rounded', TYPE_COLORS[selectedParent.type ?? 'both'])}>
                    {selectedParent.type === 'credit' ? 'Receita' : selectedParent.type === 'debit' ? 'Despesa' : 'Ambos'}
                  </span>
                </p>
              )}
            </div>

            {/* Nome */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Nome</Label>
              <Input
                id="cat-name"
                name="cat-name"
                placeholder="Ex: Açaí, Academia, Uber…"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.parentId}
              >
                {saving ? 'Salvando…' : editTarget ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir subcategoria</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.name}</strong>? Transações existentes não serão afetadas.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Excluindo…' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
