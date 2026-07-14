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

    // Inject temporary CSS to override oklch colors with hex
    const styleId = 'temp-export-styles';
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      :root {
        --background: #ffffff !important;
        --foreground: #242424 !important;
        --card: #ffffff !important;
        --card-foreground: #242424 !important;
        --popover: #ffffff !important;
        --popover-foreground: #242424 !important;
        --primary: #404040 !important;
        --primary-foreground: #fcfcfc !important;
        --secondary: #f5f5f5 !important;
        --secondary-foreground: #404040 !important;
        --muted: #f5f5f5 !important;
        --muted-foreground: #8a8a8a !important;
        --accent: #f5f5f5 !important;
        --accent-foreground: #404040 !important;
        --destructive: #ef4444 !important;
        --border: #ebebeb !important;
        --input: #ebebeb !important;
        --ring: #b4b4b4 !important;
        --chart-1: #dedede !important;
        --chart-2: #8a8a8a !important;
        --chart-3: #6f6f6f !important;
        --chart-4: #5e5e5e !important;
        --chart-5: #444444 !important;
        --sidebar: #fcfcfc !important;
        --sidebar-foreground: #242424 !important;
        --sidebar-primary: #404040 !important;
        --sidebar-primary-foreground: #fcfcfc !important;
        --sidebar-accent: #f5f5f5 !important;
        --sidebar-accent-foreground: #404040 !important;
        --sidebar-border: #ebebeb !important;
        --sidebar-ring: #b4b4b4 !important;
      }
      .dark {
        --background: #242424 !important;
        --foreground: #fcfcfc !important;
        --card: #404040 !important;
        --card-foreground: #fcfcfc !important;
        --popover: #404040 !important;
        --popover-foreground: #fcfcfc !important;
        --primary: #ebebeb !important;
        --primary-foreground: #404040 !important;
        --secondary: #444444 !important;
        --secondary-foreground: #fcfcfc !important;
        --muted: #444444 !important;
        --muted-foreground: #b4b4b4 !important;
        --accent: #444444 !important;
        --accent-foreground: #fcfcfc !important;
        --destructive: #dc2626 !important;
        --border: rgba(255, 255, 255, 0.1) !important;
        --input: rgba(255, 255, 255, 0.15) !important;
        --ring: #8a8a8a !important;
        --sidebar: #404040 !important;
        --sidebar-foreground: #fcfcfc !important;
        --sidebar-primary: #7c3aed !important;
        --sidebar-primary-foreground: #fcfcfc !important;
        --sidebar-accent: #444444 !important;
        --sidebar-accent-foreground: #fcfcfc !important;
        --sidebar-border: rgba(255, 255, 255, 0.1) !important;
        --sidebar-ring: #8a8a8a !important;
      }
    `;
    document.head.appendChild(style);

    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    } finally {
      document.head.removeChild(style);
    }
  }

  async exportChartAsImage(chartRef: HTMLElement, filename: string): Promise<void> {
    const html2canvas = (await import('html2canvas')).default;

    // Inject temporary CSS to override oklch colors with hex
    const styleId = 'temp-export-styles';
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      :root {
        --background: #ffffff !important;
        --foreground: #242424 !important;
        --card: #ffffff !important;
        --card-foreground: #242424 !important;
        --popover: #ffffff !important;
        --popover-foreground: #242424 !important;
        --primary: #404040 !important;
        --primary-foreground: #fcfcfc !important;
        --secondary: #f5f5f5 !important;
        --secondary-foreground: #404040 !important;
        --muted: #f5f5f5 !important;
        --muted-foreground: #8a8a8a !important;
        --accent: #f5f5f5 !important;
        --accent-foreground: #404040 !important;
        --destructive: #ef4444 !important;
        --border: #ebebeb !important;
        --input: #ebebeb !important;
        --ring: #b4b4b4 !important;
        --chart-1: #dedede !important;
        --chart-2: #8a8a8a !important;
        --chart-3: #6f6f6f !important;
        --chart-4: #5e5e5e !important;
        --chart-5: #444444 !important;
        --sidebar: #fcfcfc !important;
        --sidebar-foreground: #242424 !important;
        --sidebar-primary: #404040 !important;
        --sidebar-primary-foreground: #fcfcfc !important;
        --sidebar-accent: #f5f5f5 !important;
        --sidebar-accent-foreground: #404040 !important;
        --sidebar-border: #ebebeb !important;
        --sidebar-ring: #b4b4b4 !important;
      }
      .dark {
        --background: #242424 !important;
        --foreground: #fcfcfc !important;
        --card: #404040 !important;
        --card-foreground: #fcfcfc !important;
        --popover: #404040 !important;
        --popover-foreground: #fcfcfc !important;
        --primary: #ebebeb !important;
        --primary-foreground: #404040 !important;
        --secondary: #444444 !important;
        --secondary-foreground: #fcfcfc !important;
        --muted: #444444 !important;
        --muted-foreground: #b4b4b4 !important;
        --accent: #444444 !important;
        --accent-foreground: #fcfcfc !important;
        --destructive: #dc2626 !important;
        --border: rgba(255, 255, 255, 0.1) !important;
        --input: rgba(255, 255, 255, 0.15) !important;
        --ring: #8a8a8a !important;
        --sidebar: #404040 !important;
        --sidebar-foreground: #fcfcfc !important;
        --sidebar-primary: #7c3aed !important;
        --sidebar-primary-foreground: #fcfcfc !important;
        --sidebar-accent: #444444 !important;
        --sidebar-accent-foreground: #fcfcfc !important;
        --sidebar-border: rgba(255, 255, 255, 0.1) !important;
        --sidebar-ring: #8a8a8a !important;
      }
    `;
    document.head.appendChild(style);

    try {
      const canvas = await html2canvas(chartRef, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      document.head.removeChild(style);
    }
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
