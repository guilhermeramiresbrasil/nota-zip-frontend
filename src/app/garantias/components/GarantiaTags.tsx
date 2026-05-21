import React from 'react';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';

interface GarantiaTagsProps {
  selectedTag: string;
  onTagSelect: (tag: string) => void;
}

export const GarantiaTags: React.FC<GarantiaTagsProps> = ({ selectedTag, onTagSelect }) => {
  const commonTags = ['eletrônicos', 'eletrodomésticos', 'móveis', 'veículos', 'outros'];

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant={selectedTag === '' ? 'default' : 'outline'}
        onClick={() => onTagSelect('')}
      >
        Todas
      </Button>
      {commonTags.map((tag) => (
        <Button
          key={tag}
          size="sm"
          variant={selectedTag === tag ? 'default' : 'outline'}
          onClick={() => onTagSelect(tag)}
          className="flex items-center gap-1"
        >
          <Tag className="h-3 w-3" />
          {tag}
        </Button>
      ))}
    </div>
  );
};
