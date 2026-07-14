import { DetailedTransaction, SummaryStats } from '../../types/report.types';
import { domToPng } from 'modern-screenshot';

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
    // Use window.print() as the most reliable method for PDF export
    // modern-screenshot and html2canvas both have issues with oklch colors
    window.print();
  }

  async exportChartAsImage(chartRef: HTMLElement, filename: string): Promise<void> {
    try {
      const dataUrl = await domToPng(chartRef, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Exportação de imagem falhou. Tente usar "Exportar PDF" ou imprima a página (Ctrl+P / Cmd+P).');
    }
  }

  async exportDashboardAsImage(containerRef: HTMLElement, filename: string): Promise<void> {
    try {
      const dataUrl = await domToPng(containerRef, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Exportação de imagem falhou. Tente usar "Exportar PDF" ou imprima a página (Ctrl+P / Cmd+P).');
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
