import { Garantia, GarantiaFormData } from '../../types/garantia.types';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class GarantiaService {
  private static instance: GarantiaService;

  private constructor() {}

  static getInstance(): GarantiaService {
    if (!GarantiaService.instance) {
      GarantiaService.instance = new GarantiaService();
    }
    return GarantiaService.instance;
  }

  async fetchGarantias(): Promise<Garantia[]> {
    // TODO: Integrar com API real
    // const response = await fetch(`${GATEWAY_URL}/api/garantias`, {
    //   headers: { Authorization: `Bearer ${token}` },
    // });
    // return response.json();

    // Mock data
    return [
      {
        id: '1',
        nome: 'Notebook Dell',
        arquivoUrl: '/files/notebook.pdf',
        arquivoNome: 'nota_fiscal_notebook.pdf',
        dataExpiracao: '2025-12-31',
        dataUpload: '2024-01-15',
        tags: ['eletrônicos', 'notebook'],
      },
    ];
  }

  validateFileSize(file: File, uploadLimit: number): { valid: boolean; error?: string } {
    const fileSizeMB = file.size / (1024 * 1024);
    if (uploadLimit === 0) {
      return { valid: false, error: 'O plano Grátis não permite upload de arquivos. Faça upgrade para o plano Básico ou Premium.' };
    }
    if (fileSizeMB > uploadLimit) {
      return { valid: false, error: `O arquivo excede o limite de ${uploadLimit} MB do seu plano.` };
    }
    return { valid: true };
  }

  async createGarantia(formData: GarantiaFormData, file: File, uploadLimit: number): Promise<Garantia> {
    const validation = this.validateFileSize(file, uploadLimit);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // TODO: Integrar com API real
    // const formDataObj = new FormData();
    // formDataObj.append('nome', formData.nome);
    // formDataObj.append('arquivo', file);
    // formDataObj.append('dataExpiracao', formData.dataExpiracao);
    // formDataObj.append('tags', JSON.stringify(formData.tags));

    // const response = await fetch(`${GATEWAY_URL}/api/garantias`, {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${token}` },
    //   body: formDataObj,
    // });
    // return response.json();

    throw new Error('Not implemented');
  }

  async updateGarantia(id: string, formData: GarantiaFormData, file?: File, uploadLimit?: number): Promise<Garantia> {
    if (file && uploadLimit !== undefined) {
      const validation = this.validateFileSize(file, uploadLimit);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    // TODO: Integrar com API real
    // const formDataObj = new FormData();
    // formDataObj.append('nome', formData.nome);
    // if (file) formDataObj.append('arquivo', file);
    // formDataObj.append('dataExpiracao', formData.dataExpiracao);
    // formDataObj.append('tags', JSON.stringify(formData.tags));

    // const response = await fetch(`${GATEWAY_URL}/api/garantias/${id}`, {
    //   method: 'PUT',
    //   headers: { Authorization: `Bearer ${token}` },
    //   body: formDataObj,
    // });
    // return response.json();

    throw new Error('Not implemented');
  }

  async deleteGarantia(id: string): Promise<void> {
    // TODO: Integrar com API real
    // await fetch(`${GATEWAY_URL}/api/garantias/${id}`, {
    //   method: 'DELETE',
    //   headers: { Authorization: `Bearer ${token}` },
    // });

    throw new Error('Not implemented');
  }
}

export const garantiaService = GarantiaService.getInstance();
