import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface GarantiaSearchProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export const GarantiaSearch: React.FC<GarantiaSearchProps> = ({ searchQuery, onSearchQueryChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Buscar garantias..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};
