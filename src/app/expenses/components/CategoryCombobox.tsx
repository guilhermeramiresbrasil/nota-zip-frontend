"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Popover as PopoverPrimitive, Dialog as DialogPrimitive } from 'radix-ui';
import { ChevronsUpDown, Search, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
  groupLabel?: string;
  groupColor?: string;
  groupBg?: string;
  groupIcon?: React.ReactNode;
}

interface CategoryComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  extraOption?: ComboboxOption;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function CategoryCombobox({
  options,
  value,
  onChange,
  placeholder = 'Selecione',
  disabled = false,
  extraOption,
}: CategoryComboboxProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const allOptions = extraOption ? [...options, extraOption] : options;
  const selected = allOptions.find((o) => o.value === value);

  const filtered = search.trim()
    ? allOptions.filter((o) =>
        normalize(o.label).includes(normalize(search)) ||
        (o.groupLabel && normalize(o.groupLabel).includes(normalize(search)))
      )
    : allOptions;

  // Build grouped structure for display
  type Group = { label: string; color?: string; bg?: string; icon?: React.ReactNode; items: ComboboxOption[] };
  const grouped = filtered.reduce<Group[]>((acc, opt) => {
    if (!opt.groupLabel) {
      // ungrouped — put in a special bucket
      let ug = acc.find((g) => g.label === '__ungrouped__');
      if (!ug) { ug = { label: '__ungrouped__', items: [] }; acc.push(ug); }
      ug.items.push(opt);
      return acc;
    }
    let g = acc.find((g) => g.label === opt.groupLabel);
    if (!g) {
      g = { label: opt.groupLabel, color: opt.groupColor, bg: opt.groupBg, icon: opt.groupIcon, items: [] };
      acc.push(g);
    }
    g.items.push(opt);
    return acc;
  }, []);

  const handleSelect = useCallback((val: string) => {
    onChange(val);
    setOpen(false);
    setSearch('');
  }, [onChange]);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) setSearch('');
    if (v) setTimeout(() => searchRef.current?.focus(), 50);
  };

  // Trigger display
  const TriggerInner = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && handleOpenChange(true)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm transition',
        'hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400',
        'disabled:cursor-not-allowed disabled:opacity-50',
        !selected && 'text-slate-400'
      )}
    >
      {selected?.groupColor ? (
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: selected.groupBg, color: selected.groupColor }}
        >
          {selected.groupIcon && <span className="flex-shrink-0">{selected.groupIcon}</span>}
          {selected.label}
        </span>
      ) : (
        <span className="truncate">{selected ? selected.label : placeholder}</span>
      )}
      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-40 ml-2" />
    </button>
  );

  const ListContent = (
    <div className="flex flex-col">
      {/* Search */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 flex-shrink-0">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          ref={searchRef}
          id="cat-search"
          name="cat-search"
          autoComplete="off"
          autoFocus
          className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          placeholder="Buscar categoria…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto" style={{ maxHeight: 300, scrollbarWidth: 'thin' }}>
        {grouped.length === 0 && (
          <p className="py-7 text-center text-sm text-slate-400">Nenhuma categoria encontrada.</p>
        )}
        {grouped.map((group, gi) => (
          <div key={group.label}>
            {gi > 0 && <div className="mx-3 my-1 h-px bg-slate-100" />}
            {group.label !== '__ungrouped__' && (
              <div
                className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wide select-none pointer-events-none"
                style={{ color: group.color || '#94a3b8' }}
              >
                {group.icon && <span className="flex-shrink-0">{group.icon}</span>}
                {group.label}
              </div>
            )}
            {group.items.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(opt.value); }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-sm text-slate-700 transition-colors',
                  'hover:bg-slate-50',
                  opt.value === value && 'font-medium'
                )}
              >
                <span className="flex items-center gap-2">
                  {opt.groupBg && opt.groupColor && (
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded flex-shrink-0"
                      style={{ background: opt.groupBg, color: opt.groupColor }}
                    >
                      {opt.groupIcon}
                    </span>
                  )}
                  {opt.label}
                </span>
                <Check className={cn('h-3.5 w-3.5 text-indigo-500 shrink-0', opt.value === value ? 'opacity-100' : 'opacity-0')} />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {TriggerInner}
        <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
            <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-xl focus:outline-none" style={{ maxHeight: '85dvh' }}>
              <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-100">
                <DialogPrimitive.Title className="text-base font-semibold text-slate-800">
                  {placeholder}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close asChild>
                  <button type="button" className="rounded-full p-1.5 hover:bg-slate-100">
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                </DialogPrimitive.Close>
              </div>
              {ListContent}
              <div className="pb-safe" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }} />
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </>
    );
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        {TriggerInner}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-50 w-[var(--radix-popover-trigger-width)] rounded-xl border border-slate-200 bg-white shadow-lg outline-none"
        >
          {ListContent}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
