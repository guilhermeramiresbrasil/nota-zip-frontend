import { DetailedTransaction, SummaryStats } from '../../types/report.types';
import Color from 'color';

export class ExportService {
  private static instance: ExportService;

  private constructor() {}

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  exportToCSV(data: DetailedTransaction[], filename: string): void {
    const headers = ['Data', 'Descri\u00e7\u00e3o', 'Categoria', 'Tipo', 'Valor'];
    const rows = data.map((t) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      t.type === 'credit' ? 'Receita' : 'Despesa',
      t.amount.toFixed(2),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  exportSummaryCSV(stats: SummaryStats, filename: string): void {
    const lines = [
      'M\u00e9trica,Valor',
      `Total Receitas,${stats.totalIncome.toFixed(2)}`,
      `Total Despesas,${stats.totalExpenses.toFixed(2)}`,
      `Saldo,${stats.balance.toFixed(2)}`,
      `M\u00e9dia Di\u00e1ria,${stats.avgDaily.toFixed(2)}`,
      `Maior Despesa,${stats.largestExpense.toFixed(2)}`,
      `Maior Receita,${stats.largestIncome.toFixed(2)}`,
      `Categoria Top,${stats.topCategory}`,
      `Crescimento,${stats.growthRate.toFixed(1)}%`,
    ];

    const csv = lines.join('\n');
    this.downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  async exportToPDF(element: HTMLElement, filename: string): Promise<void> {
    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');

    // Force all elements to use inline hex colors by computing and setting them
    this.forceHexColors(element);

    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        ignoreElements: (element) => {
          // Ignore elements that might cause issues
          return false;
        },
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    } finally {
      // Note: We don't restore the original styles as they're computed values
      // The page will reload or the user can refresh to restore
    }
  }

  async exportChartAsImage(chartRef: HTMLElement, filename: string): Promise<void> {
    const { default: html2canvas } = await import('html2canvas');

    // Force all elements to use inline hex colors by computing and setting them
    this.forceHexColors(chartRef);

    try {
      const canvas = await html2canvas(chartRef, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      // Note: We don't restore the original styles as they're computed values
    }
  }

  async exportDashboardAsImage(containerRef: HTMLElement, filename: string): Promise<void> {
    await this.exportChartAsImage(containerRef, filename);
  }

  private forceHexColors(element: HTMLElement): void {
    const computedStyle = getComputedStyle(element);
    
    // Get computed color values and convert to hex
    const colorProperties = [
      'color', 'backgroundColor', 'borderColor', 'borderTopColor',
      'borderRightColor', 'borderBottomColor', 'borderLeftColor',
      'outlineColor', 'textDecorationColor', 'fill', 'stroke'
    ];

    colorProperties.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value.includes('oklch')) {
        const hex = this.oklchToHexSimple(value);
        if (hex) {
          element.style.setProperty(prop, hex, 'important');
        }
      }
    });

    // Recursively process children
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
      this.forceHexColors(children[i] as HTMLElement);
    }
  }

  private oklchToHexSimple(oklchString: string): string | null {
    try {
      // Use the color library to convert oklch to hex
      const color = Color(oklchString);
      return color.hex();
    } catch (e) {
      console.error('Error converting color:', e);
      // Fallback to white if conversion fails
      return '#ffffff';
    }
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob(['\uFEFF' + content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

export const exportService = ExportService.getInstance();
