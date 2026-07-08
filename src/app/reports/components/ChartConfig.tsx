'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { ChartConfig as ChartConfigType, ChartType, ColorPalette } from '../types/report.types';
import { Settings, RotateCcw } from 'lucide-react';

interface ChartConfigProps {
  config: ChartConfigType;
  onConfigChange: (config: Partial<ChartConfigType>) => void;
  onReset: () => void;
}

const chartTypes: { value: ChartType; label: string }[] = [
  { value: 'pie', label: 'Pizza' },
  { value: 'bar', label: 'Barras' },
  { value: 'line', label: 'Linha' },
  { value: 'area', label: 'Área' },
];

const palettes: { value: ColorPalette; label: string }[] = [
  { value: 'default', label: 'Padrão' },
  { value: 'warm', label: 'Quente' },
  { value: 'cool', label: 'Frio' },
  { value: 'pastel', label: 'Pastel' },
];

export const ChartConfigComponent: React.FC<ChartConfigProps> = ({ config, onConfigChange, onReset }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configurações do Gráfico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Tipo</Label>
            <Combobox
              searchable={false}
              options={chartTypes}
              value={config.chartType}
              onChange={(v) => onConfigChange({ chartType: v as ChartType })}
            />
          </div>
          <div>
            <Label className="text-xs">Cores</Label>
            <Combobox
              searchable={false}
              options={palettes}
              value={config.colorPalette}
              onChange={(v) => onConfigChange({ colorPalette: v as ColorPalette })}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={config.showLegend} onChange={(e) => onConfigChange({ showLegend: e.target.checked })} />
            Legenda
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={config.showLabels} onChange={(e) => onConfigChange({ showLabels: e.target.checked })} />
            Labels
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={config.showTooltip} onChange={(e) => onConfigChange({ showTooltip: e.target.checked })} />
            Tooltip
          </label>
        </div>

        <div>
          <Label className="text-xs">Orientação</Label>
          <Combobox
            searchable={false}
            options={[{ value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' }]}
            value={config.orientation}
            onChange={(v) => onConfigChange({ orientation: v as 'horizontal' | 'vertical' })}
          />
        </div>

        <Button variant="outline" size="sm" onClick={onReset} className="w-full text-xs">
          <RotateCcw className="h-3 w-3 mr-1" />
          Resetar
        </Button>
      </CardContent>
    </Card>
  );
};
