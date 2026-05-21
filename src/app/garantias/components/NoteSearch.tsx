import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface NoteSearchProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export const NoteSearch: React.FC<NoteSearchProps> = ({ searchQuery, onSearchQueryChange }) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Buscar notas..."
        className="pl-10"
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
      />
    </div>
  );
};
