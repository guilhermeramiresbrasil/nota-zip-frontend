import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface QuickActionButtonProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  variant?: 'primary' | 'outline';
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  label,
  icon: Icon,
  href,
  variant = 'outline',
}) => {
  const buttonClassName =
    variant === 'primary'
      ? 'w-full h-auto py-6 flex flex-col gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
      : 'w-full h-auto py-6 flex flex-col gap-2';

  return (
    <Link href={href}>
      <Button variant={variant === 'primary' ? 'default' : 'outline'} className={buttonClassName}>
        <Icon className="h-6 w-6" />
        <span>{label}</span>
      </Button>
    </Link>
  );
};
