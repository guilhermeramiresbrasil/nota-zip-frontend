'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DetailedTransaction } from '../types/report.types';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DataTableProps {
  data: DetailedTransaction[];
  isSharedView?: boolean;
}

type SortField = 'date' | 'description' | 'category' | 'type' | 'amount' | 'userNickname';

const PAGE_SIZE = 10;

export const DataTable: React.FC<DataTableProps> = ({ data, isSharedView = false }) => {
  const tx = useTranslations('reports');
  const { user } = useAuth();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField as keyof DetailedTransaction] || '';
      const bVal = b[sortField as keyof DetailedTransaction] || '';
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
        <CardTitle className="text-sm">{tx('detailedTransactions')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-gray-500 py-4 text-sm">{tx('noTransactionsFound')}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    {([
                      ['date', tx('date')],
                      ['description', tx('description')],
                      ['category', tx('category')],
                      ...(isSharedView ? [['userNickname', tx('source')] as [SortField, string]] : []),
                      ['type', tx('type')],
                      ['amount', tx('amount')],
                    ] as [SortField, string][]).map(([field, label]) => (
                      <th
                        key={field}
                        className="py-2 px-2 cursor-pointer hover:bg-gray-50 text-xs font-medium"
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
                      <td className="py-2 px-2 text-xs">{new Date(t.date).toLocaleDateString(user?.language || 'pt-BR')}</td>
                      <td className="py-2 px-2 text-xs">
                        {t.description.replace(/^(Receita|Despesa) \d+ - /, '')}
                      </td>
                      <td className="py-2 px-2 text-xs">{t.category}</td>
                      {isSharedView && (
                        <td className="py-2 px-2 text-xs">{t.userNickname || '-'}</td>
                      )}
                      <td className="py-2 px-2 text-xs">
                        <span className={t.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                          {t.type === 'credit' ? tx('income') : tx('expense')}
                        </span>
                      </td>
                      <td className={`py-2 px-2 text-xs font-medium ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {new Intl.NumberFormat(user?.language || 'pt-BR', { style: 'currency', currency: user?.currency || 'BRL' }).format(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {tx('pagination', { start: page * PAGE_SIZE + 1, end: Math.min((page + 1) * PAGE_SIZE, sorted.length), total: sorted.length })}
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
