import { Garantia, GarantiaFormData } from '../../types/garantia.types';
import { compressImage, fileToBase64 } from '../utils/imageCompressor';

// Hardcoded production URL
const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const PLAN_PER_FILE_LIMITS: Record<string, number> = {
  free: 2 * 1024 * 1024,
  basic: 5 * 1024 * 1024,
  premium: 10 * 1024 * 1024,
  shared: 10 * 1024 * 1024,
};

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export class GarantiaService {
  private static instance: GarantiaService;

  private constructor() {}

  static getInstance(): GarantiaService {
    if (!GarantiaService.instance) {
      GarantiaService.instance = new GarantiaService();
    }
    return GarantiaService.instance;
  }

  async fetchGarantias(userId: string): Promise<Garantia[]> {
    const response = await fetch(`${GATEWAY_URL}/api/warranties/list`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Erro ao buscar garantias');
    const json = await response.json();
    const items: any[] = json.data ?? [];
    return items.map((w) => ({
      id: w.id,
      nome: w.nome,
      arquivoUrl: this.generateDownloadUrl(w.arquivoBase64, w.arquivoTipo),
      arquivoNome: w.arquivoNome,
      dataExpiracao: w.dataExpiracao ?? '',
      dataUpload: new Date(w.createdAt).toISOString().split('T')[0],
      tags: w.tags ?? [],
    }));
  }

  private generateDownloadUrl(base64: string, mimeType: string): string {
    return `data:${mimeType};base64,${base64}`;
  }

  async createGarantia(
    formData: GarantiaFormData,
    file: File,
    userId: string,
    userPlan: string
  ): Promise<Garantia> {
    const perFileLimit = PLAN_PER_FILE_LIMITS[userPlan] ?? PLAN_PER_FILE_LIMITS.free;

    const processedFile = await compressImage(file);

    if (processedFile.size > perFileLimit) {
      throw new Error(
        `Arquivo excede o limite por arquivo do plano ${userPlan} (${perFileLimit / (1024 * 1024)} MB). Tamanho atual: ${(processedFile.size / (1024 * 1024)).toFixed(2)} MB`
      );
    }

    const arquivoBase64 = await fileToBase64(processedFile);

    const response = await fetch(`${GATEWAY_URL}/api/warranties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId,
        userPlan,
        nome: formData.nome,
        arquivoBase64,
        arquivoNome: processedFile.name,
        arquivoTipo: processedFile.type || file.type,
        arquivoTamanhoBytes: processedFile.size,
        dataExpiracao: formData.dataExpiracao || undefined,
        tags: formData.tags,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erro ao criar garantia');
    }

    const json = await response.json();
    const w = json.data;
    return {
      id: w.id,
      nome: w.nome,
      arquivoUrl: '',
      arquivoNome: w.arquivoNome,
      dataExpiracao: w.dataExpiracao ?? '',
      dataUpload: new Date(w.createdAt).toISOString().split('T')[0],
      tags: w.tags ?? [],
    };
  }

  async deleteGarantia(id: string, userId: string): Promise<void> {
    const response = await fetch(`${GATEWAY_URL}/api/warranties/${id}?userId=${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erro ao deletar garantia');
    }
  }

  async updateGarantia(
    id: string,
    formData: GarantiaFormData,
    file: File | null,
    userId: string,
    userPlan: string
  ): Promise<Garantia> {
    const body: any = {
      nome: formData.nome,
      dataExpiracao: formData.dataExpiracao || undefined,
      tags: formData.tags,
    };

    if (file) {
      const perFileLimit = PLAN_PER_FILE_LIMITS[userPlan] ?? PLAN_PER_FILE_LIMITS.free;
      const processedFile = await compressImage(file);

      if (processedFile.size > perFileLimit) {
        throw new Error(
          `Arquivo excede o limite por arquivo do plano ${userPlan} (${perFileLimit / (1024 * 1024)} MB). Tamanho atual: ${(processedFile.size / (1024 * 1024)).toFixed(2)} MB`
        );
      }

      body.arquivoBase64 = await fileToBase64(processedFile);
      body.arquivoNome = processedFile.name;
      body.arquivoTipo = processedFile.type || file.type;
      body.arquivoTamanhoBytes = processedFile.size;
    }

    const response = await fetch(`${GATEWAY_URL}/api/warranties/${id}?userId=${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erro ao atualizar garantia');
    }

    const json = await response.json();
    const w = json.data;
    return {
      id: w.id,
      nome: w.nome,
      arquivoUrl: this.generateDownloadUrl(w.arquivoBase64, w.arquivoTipo),
      arquivoNome: w.arquivoNome,
      dataExpiracao: w.dataExpiracao ?? '',
      dataUpload: new Date(w.createdAt).toISOString().split('T')[0],
      tags: w.tags ?? [],
    };
  }

  async fetchStorageUsage(userId: string): Promise<{ usedBytes: number }> {
    try {
      const response = await fetch(`${GATEWAY_URL}/api/warranties/storage/${userId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const err = await response.json();
        console.error('Erro ao buscar uso de storage:', err);
        return { usedBytes: 0 }; // Retorna 0 em caso de erro para não quebrar a UI
      }
      const json = await response.json();
      return json.data ?? { usedBytes: 0 };
    } catch (error) {
      console.error('Erro ao buscar uso de storage:', error);
      return { usedBytes: 0 }; // Retorna 0 em caso de erro para não quebrar a UI
    }
  }
}

export const garantiaService = GarantiaService.getInstance();
