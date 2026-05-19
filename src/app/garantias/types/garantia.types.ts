export interface GarantiaFormData {
  nome: string;
  arquivo: File | null;
  dataExpiracao: string;
  tags: string[];
}

export interface Garantia {
  id: string;
  nome: string;
  arquivoUrl: string;
  arquivoNome: string;
  dataExpiracao: string;
  dataUpload: string;
  tags: string[];
}
