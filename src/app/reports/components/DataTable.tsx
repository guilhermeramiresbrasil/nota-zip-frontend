'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DetailedTransaction } from '../types/report.types';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps {
  data: DetailedTransaction[];
}

type SortField = 'date' | 'description' | 'category' | 'type' | 'amount' | 'payment_method' | 'card_name' | 'installments';

const PAGE_SIZE = 10;

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(0);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Transações Detalhadas</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-gray-500 py-4 text-sm">Nenhuma transação encontrada</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    {([
                      ['date', 'Data'],
                      ['description', 'Descrição'],
                      ['category', 'Categoria'],
                      ['type', 'Tipo'],
                      ['payment_method', 'Pagamento'],
                      ['card_name', 'Cartão'],
                      ['installments', 'Parcelas'],
                      ['amount', 'Valor'],
                    ] as [SortField, string][]).map(([field, label]) => (
                      <th
                        key={field}
                        className="py-2 px-2 cursor-pointer hover:bg-gray-50 text-xs font-medium whitespace-nowrap"
                        onClick={() => toggleSort(field)}
                      >
                        {label} <SortIcon field={field} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 text-xs">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                      <td className="py-2 px-2 text-xs">{t.description}</td>
                      <td className="py-2 px-2 text-xs">{t.category}</td>
                      <td className="py-2 px-2 text-xs">
                        <span className={t.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                          {t.type === 'credit' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs">
                        {t.payment_method === 'credit_card' ? 'Cartão' : t.payment_method === 'debit' ? 'Débito' : t.payment_method || '-'}
                      </td>
                      <td className="py-2 px-2 text-xs">{t.card_name || '-'}</td>
                      <td className="py-2 px-2 text-xs">
                        {t.installments && t.installments > 1 ? `${t.installments}x` : '-'}
                      </td>
                      <td className={`py-2 px-2 text-xs font-medium ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, sorted.length)} de {sorted.length}
                </span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
