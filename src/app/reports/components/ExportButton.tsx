'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  onExportCSV: () => void;
  onExportSummaryCSV: () => void;
  onExportPDF: () => Promise<void>;
  onExportImage: () => Promise<void>;
  onExportDashboard: () => Promise<void>;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExportCSV,
  onExportSummaryCSV,
  onExportPDF,
  onExportImage,
  onExportDashboard,
}) => {
  const t = useTranslations('reports');
  const [exporting, setExporting] = useState(false);

  const handleAsync = async (fn: () => Promise<void>) => {
    setExporting(true);
    try {
      await fn();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting} className="no-print">
          {exporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          {t('export')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="no-print">
        <DropdownMenuItem onClick={onExportCSV}>{t('exportRawCSV')}</DropdownMenuItem>
        <DropdownMenuItem onClick={onExportSummaryCSV}>{t('exportSummaryCSV')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAsync(onExportPDF)}>{t('exportPDF')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAsync(onExportImage)}>{t('exportImage')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAsync(onExportDashboard)}>{t('exportDashboard')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
