import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HardDrive, AlertTriangle } from 'lucide-react';

interface StorageUsageBarProps {
  used: number; // em MB
  limit: number; // em MB
}

export const StorageUsageBar: React.FC<StorageUsageBarProps> = ({ used, limit }) => {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const remaining = Math.max(limit - used, 0);

  const formatStorage = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(2)} MB`;
  };

  const getBarColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Uso de Armazenamento</span>
          </div>
          {percentage >= 90 && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Armazenamento quase cheio</span>
            </div>
          )}
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">
              {formatStorage(used)} usados
            </span>
            <span className="text-gray-600">
              {formatStorage(limit)} limite
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getBarColor()} transition-all duration-300`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-gray-600">
          {remaining === 0 ? (
            <span className="text-red-600 font-semibold">Armazenamento cheio</span>
          ) : (
            <span>{formatStorage(remaining)} disponíveis</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
};
