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

    // Temporarily replace oklch colors with hex for html2canvas compatibility
    const originalStyle = document.documentElement.getAttribute('style');
    this.replaceOklchWithHex();

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
      // Restore original colors
      if (originalStyle) {
        document.documentElement.setAttribute('style', originalStyle);
      } else {
        document.documentElement.removeAttribute('style');
      }
    }
  }

  async exportChartAsImage(chartRef: HTMLElement, filename: string): Promise<void> {
    const html2canvas = (await import('html2canvas')).default;

    // Temporarily replace oklch colors with hex for html2canvas compatibility
    const originalStyle = document.documentElement.getAttribute('style');
    this.replaceOklchWithHex();

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
      // Restore original colors
      if (originalStyle) {
        document.documentElement.setAttribute('style', originalStyle);
      } else {
        document.documentElement.removeAttribute('style');
      }
    }
  }

  async exportDashboardAsImage(containerRef: HTMLElement, filename: string): Promise<void> {
    await this.exportChartAsImage(containerRef, filename);
  }

  private replaceOklchWithHex(): void {
    const style = document.documentElement.style;
    const computedStyle = getComputedStyle(document.documentElement);
    
    // Common oklch to hex mappings for the theme
    const colorMap: Record<string, string> = {
      'oklch(1 0 0)': '#ffffff',
      'oklch(0.145 0 0)': '#242424',
      'oklch(0.205 0 0)': '#404040',
      'oklch(0.97 0 0)': '#f5f5f5',
      'oklch(0.556 0 0)': '#8a8a8a',
      'oklch(0.577 0.245 27.325)': '#ef4444',
      'oklch(0.922 0 0)': '#ebebeb',
      'oklch(0.708 0 0)': '#b4b4b4',
      'oklch(0.87 0 0)': '#dedede',
      'oklch(0.439 0 0)': '#6f6f6f',
      'oklch(0.371 0 0)': '#5e5e5e',
      'oklch(0.269 0 0)': '#444444',
      'oklch(0.985 0 0)': '#fcfcfc',
      'oklch(0.704 0.191 22.216)': '#dc2626',
      'oklch(0.488 0.243 264.376)': '#7c3aed',
    };

    // Replace CSS variables
    for (const [oklch, hex] of Object.entries(colorMap)) {
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          const rules = sheet.cssRules || sheet.rules;
          for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            if (rule.cssText && rule.cssText.includes(oklch)) {
              // This is a simplified approach - in production you might want to clone rules
            }
          }
        } catch (e) {
          // Ignore cross-origin stylesheet errors
        }
      });
    }

    // Force inline style override for common variables
    const root = document.documentElement;
    root.style.setProperty('--background', '#ffffff');
    root.style.setProperty('--foreground', '#242424');
    root.style.setProperty('--card', '#ffffff');
    root.style.setProperty('--card-foreground', '#242424');
    root.style.setProperty('--popover', '#ffffff');
    root.style.setProperty('--popover-foreground', '#242424');
    root.style.setProperty('--primary', '#404040');
    root.style.setProperty('--primary-foreground', '#fcfcfc');
    root.style.setProperty('--secondary', '#f5f5f5');
    root.style.setProperty('--secondary-foreground', '#404040');
    root.style.setProperty('--muted', '#f5f5f5');
    root.style.setProperty('--muted-foreground', '#8a8a8a');
    root.style.setProperty('--accent', '#f5f5f5');
    root.style.setProperty('--accent-foreground', '#404040');
    root.style.setProperty('--destructive', '#ef4444');
    root.style.setProperty('--border', '#ebebeb');
    root.style.setProperty('--input', '#ebebeb');
    root.style.setProperty('--ring', '#b4b4b4');
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
