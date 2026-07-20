'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';
import { ChartConfig, ChartType, ColorPalette } from '../types/report.types';
import { Settings } from 'lucide-react';

interface ChartConfigModalProps {
  config: ChartConfig;
  onConfigChange: (config: Partial<ChartConfig>) => void;
  onReset: () => void;
}

export const ChartConfigModal: React.FC<ChartConfigModalProps> = ({
  config,
  onConfigChange,
  onReset,
}) => {
  const t = useTranslations('reports');
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('configureChart')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('chartType')}</Label>
            <Select
              value={config.chartType}
              onValueChange={(value) => onConfigChange({ chartType: value as ChartType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">{t('pie')}</SelectItem>
                <SelectItem value="bar">{t('bar')}</SelectItem>
                <SelectItem value="line">{t('line')}</SelectItem>
                <SelectItem value="area">{t('area')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('colorPalette')}</Label>
            <Select
              value={config.colorPalette}
              onValueChange={(value) => onConfigChange({ colorPalette: value as ColorPalette })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{t('default')}</SelectItem>
                <SelectItem value="warm">{t('warm')}</SelectItem>
                <SelectItem value="cool">{t('cool')}</SelectItem>
                <SelectItem value="pastel">{t('pastel')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.chartType === 'bar' && (
            <div className="space-y-2">
              <Label>{t('orientation')}</Label>
              <Select
                value={config.orientation}
                onValueChange={(value) => onConfigChange({ orientation: value as 'horizontal' | 'vertical' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">{t('horizontal')}</SelectItem>
                  <SelectItem value="vertical">{t('vertical')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-legend">{t('showLegend')}</Label>
              <Switch
                id="show-legend"
                checked={config.showLegend}
                onCheckedChange={(checked) => onConfigChange({ showLegend: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-labels">{t('showLabels')}</Label>
              <Switch
                id="show-labels"
                checked={config.showLabels}
                onCheckedChange={(checked) => onConfigChange({ showLabels: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-tooltip">{t('showTooltip')}</Label>
              <Switch
                id="show-tooltip"
                checked={config.showTooltip}
                onCheckedChange={(checked) => onConfigChange({ showTooltip: checked })}
              />
            </div>
          </div>

          <Button onClick={onReset} variant="outline" className="w-full">
            {t('restoreDefaults')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
