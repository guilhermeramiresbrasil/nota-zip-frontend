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

const TYPE_LABELS: Record<string, string> = {
  credit: 'Receita',
  debit: 'Despesa',
  both: 'Ambos',
};

const TYPE_COLORS: Record<string, string> = {
  credit: 'text-green-600 bg-green-50',
  debit: 'text-red-600 bg-red-50',
  both: 'text-slate-600 bg-slate-100',
};

interface FormState {
  name: string;
  type: 'credit' | 'debit' | 'both';
  parentId?: string;
}

const emptyForm: FormState = { name: '', type: 'both' };

export function CategoriesSection() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const all = await categoryService.fetchCategories(undefined, user.id);
      // Exibe apenas categorias raiz do usuário (userId === user.id)
      setCategories(all.filter((c) => !c.parentId && c.userId === user.id));
    } catch {
      showError('Erro', 'Não foi possível carregar as categorias.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setForm({ name: cat.name, type: (cat.type as 'credit' | 'debit' | 'both') ?? 'both' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user?.id || !form.name.trim()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await categoryService.updateCategory(editTarget.id, {
          userId: user.id,
          name: form.name.trim(),
          type: form.type,
        });
        showSuccess('Categoria atualizada!');
      } else {
        await categoryService.createCategory({
          name: form.name.trim(),
          type: form.type,
          userId: user.id,
        });
        showSuccess('Categoria criada!');
      }
      setModalOpen(false);
      await load();
    } catch {
      showError('Erro', 'Não foi possível salvar a categoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !deleteTarget) return;
    setDeleting(true);
    try {
      await categoryService.deleteCategory(deleteTarget.id, user.id);
      showSuccess('Categoria excluída.');
      setDeleteTarget(null);
      await load();
    } catch {
      showError('Erro', 'Não foi possível excluir a categoria.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Minhas Categorias
              </CardTitle>
              <CardDescription className="mt-1">
                Categorias personalizadas aparecem junto com as categorias padrão ao registrar transações.
              </CardDescription>
            </div>
            <Button size="sm" onClick={openCreate} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nova
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-6">Carregando…</p>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
              <Tag className="h-8 w-8 opacity-30" />
              <p className="text-sm">Nenhuma categoria personalizada ainda.</p>
              <Button variant="outline" size="sm" onClick={openCreate} className="mt-1 gap-1.5">
                <Plus className="h-4 w-4" />
                Criar primeira categoria
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                    <span className="text-sm font-medium text-slate-800 truncate">{cat.name}</span>
                    <span className={cn('text-[11px] font-semibold px-1.5 py-0.5 rounded-full shrink-0', TYPE_COLORS[cat.type ?? 'both'])}>
                      {TYPE_LABELS[cat.type ?? 'both']}
                    </span>
                    {(cat.subcategories?.length ?? 0) > 0 && (
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {cat.subcategories!.length} sub
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cat)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
            <DialogDescription>
              {editTarget ? 'Altere o nome ou tipo da categoria.' : 'Crie uma categoria personalizada para suas transações.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Nome</Label>
              <Input
                id="cat-name"
                name="cat-name"
                placeholder="Ex: Pet Shop, Trabalho…"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as FormState['type'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Despesa</SelectItem>
                  <SelectItem value="credit">Receita</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving || !form.name.trim()}>
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
            <DialogTitle>Excluir categoria</DialogTitle>
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
