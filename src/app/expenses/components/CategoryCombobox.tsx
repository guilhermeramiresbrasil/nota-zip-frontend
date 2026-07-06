"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Popover as PopoverPrimitive, Dialog as DialogPrimitive } from 'radix-ui';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface ComboboxOption {
  value: string;
  label: string;
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
  const filtered = allOptions.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  const selected = allOptions.find((o) => o.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearch('');
  };

  const triggerContent = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && setOpen(true)}
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background',
        'focus:outline-none focus:ring-1 focus:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        !selected && 'text-muted-foreground'
      )}
    >
      <span className="truncate">{selected ? selected.label : placeholder}</span>
      <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
    </button>
  );

  const listContent = (
    <div className="flex flex-col">
      <div className="flex items-center border-b px-3 py-2 gap-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={searchRef}
          autoFocus
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" onClick={() => setSearch('')}>
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
      <div className="overflow-y-auto max-h-60">
        {filtered.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma opção encontrada</p>
        )}
        {filtered.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => handleSelect(o.value)}
            className={cn(
              'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-left',
              o.value === value && 'font-medium'
            )}
          >
            <Check className={cn('h-4 w-4 shrink-0', o.value === value ? 'opacity-100' : 'opacity-0')} />
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {triggerContent}
        <DialogPrimitive.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(''); }}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
            <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-background shadow-lg focus:outline-none max-h-[85dvh]">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <DialogPrimitive.Title className="text-base font-semibold">
                  {placeholder}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close asChild>
                  <button type="button" className="rounded-full p-1 hover:bg-accent">
                    <X className="h-4 w-4" />
                  </button>
                </DialogPrimitive.Close>
              </div>
              {listContent}
              <div className="h-safe-area-inset-bottom pb-4" />
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </>
    );
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(''); }}>
      <PopoverPrimitive.Trigger asChild>
        {triggerContent}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-50 w-[var(--radix-popover-trigger-width)] rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95"
        >
          {listContent}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
