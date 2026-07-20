'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartConfig as ChartConfigType, ChartType, ColorPalette } from '../types/report.types';
import { Settings, RotateCcw } from 'lucide-react';

interface ChartConfigProps {
  config: ChartConfigType;
  onConfigChange: (config: Partial<ChartConfigType>) => void;
  onReset: () => void;
}

const chartTypes: { value: ChartType; key: string }[] = [
  { value: 'pie', key: 'pie' },
  { value: 'bar', key: 'bar' },
  { value: 'line', key: 'line' },
  { value: 'area', key: 'area' },
];

const palettes: { value: ColorPalette; key: string }[] = [
  { value: 'default', key: 'default' },
  { value: 'warm', key: 'warm' },
  { value: 'cool', key: 'cool' },
  { value: 'pastel', key: 'pastel' },
];

export const ChartConfigComponent: React.FC<ChartConfigProps> = ({ config, onConfigChange, onReset }) => {
  const t = useTranslations('reports');
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          {t('chartSettings')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">{t('chartType')}</Label>
            <Select value={config.chartType} onValueChange={(v) => onConfigChange({ chartType: v as ChartType })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((ct) => (
                  <SelectItem key={ct.value} value={ct.value}>{t(ct.key)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t('colorPalette')}</Label>
            <Select value={config.colorPalette} onValueChange={(v) => onConfigChange({ colorPalette: v as ColorPalette })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {palettes.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{t(p.key)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={config.showLegend} onChange={(e) => onConfigChange({ showLegend: e.target.checked })} />
            {t('showLegend')}
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={config.showLabels} onChange={(e) => onConfigChange({ showLabels: e.target.checked })} />
            {t('showLabels')}
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={config.showTooltip} onChange={(e) => onConfigChange({ showTooltip: e.target.checked })} />
            {t('showTooltip')}
          </label>
        </div>

        <div>
          <Label className="text-xs">{t('orientation')}</Label>
          <Select value={config.orientation} onValueChange={(v) => onConfigChange({ orientation: v as 'horizontal' | 'vertical' })}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vertical">{t('vertical')}</SelectItem>
              <SelectItem value="horizontal">{t('horizontal')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" onClick={onReset} className="w-full text-xs">
          <RotateCcw className="h-3 w-3 mr-1" />
          {t('reset')}
        </Button>
      </CardContent>
    </Card>
  );
};
