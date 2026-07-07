import React from 'react';
import {
  Home, Utensils, Car, Heart, BookOpen, Music2,
  ShoppingCart, TrendingUp, Briefcase, MoreHorizontal,
  Shirt, Repeat, FileText, PawPrint,
  Laptop, Building2,
} from 'lucide-react';
import { Category } from '../logics/services/categoryService';
import { ComboboxOption } from '../components/CategoryCombobox';

export const ICON_MAP: Record<string, React.ReactNode> = {
  home:            <Home className="h-3 w-3" />,
  utensils:        <Utensils className="h-3 w-3" />,
  car:             <Car className="h-3 w-3" />,
  heart:           <Heart className="h-3 w-3" />,
  book:            <BookOpen className="h-3 w-3" />,
  'book-open':     <BookOpen className="h-3 w-3" />,
  gamepad:         <Music2 className="h-3 w-3" />,
  'shopping-cart': <ShoppingCart className="h-3 w-3" />,
  'trending-up':   <TrendingUp className="h-3 w-3" />,
  briefcase:       <Briefcase className="h-3 w-3" />,
  'plus-circle':   <MoreHorizontal className="h-3 w-3" />,
  'minus-circle':  <MoreHorizontal className="h-3 w-3" />,
  shirt:           <Shirt className="h-3 w-3" />,
  repeat:          <Repeat className="h-3 w-3" />,
  'file-text':     <FileText className="h-3 w-3" />,
  'shopping-bag':  <ShoppingCart className="h-3 w-3" />,
  laptop:          <Laptop className="h-3 w-3" />,
  'rotate-ccw':    <Repeat className="h-3 w-3" />,
  'building-2':    <Building2 className="h-3 w-3" />,
  pawprint:        <PawPrint className="h-3 w-3" />,
};

/**
 * Constrói a lista unificada de ComboboxOption a partir de categorias raiz.
 * Cada categoria raiz vira um grupo (heading).
 * Se tiver subcategorias → subcategorias são os itens selecionáveis.
 * Se não tiver            → a própria categoria raiz é o item selecionável.
 */
export function buildCategoryOptions(rootCategories: Category[]): ComboboxOption[] {
  const opts: ComboboxOption[] = [];
  for (const cat of rootCategories) {
    const color = cat.color || undefined;
    const bg    = cat.color ? `${cat.color}22` : undefined;
    const icon  = cat.icon ? (ICON_MAP[cat.icon] ?? undefined) : undefined;
    const subs  = cat.subcategories ?? [];
    if (subs.length > 0) {
      for (const sub of subs) {
        opts.push({
          value: sub.id,
          label: sub.name,
          groupLabel: cat.name,
          groupColor: color,
          groupBg: bg,
          groupIcon: icon,
        });
      }
    } else {
      opts.push({
        value: cat.id,
        label: cat.name,
        groupLabel: cat.name,
        groupColor: color,
        groupBg: bg,
        groupIcon: icon,
      });
    }
  }
  return opts;
}
