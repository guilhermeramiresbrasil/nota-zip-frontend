import { DetailedTransaction, SummaryStats } from '../../types/report.types';

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
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  }

  async exportChartAsImage(chartRef: HTMLElement, filename: string): Promise<void> {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(chartRef, { scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async exportDashboardAsImage(containerRef: HTMLElement, filename: string): Promise<void> {
    await this.exportChartAsImage(containerRef, filename);
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
