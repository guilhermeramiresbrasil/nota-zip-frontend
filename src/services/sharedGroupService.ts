import { generateCorrelationId } from '../lib/utils';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getHeaders(): Record<string, string> {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    'x-correlation-id': generateCorrelationId(),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export interface SharedGroup {
  id: string;
  ownerId: string;
  partnerId: string | null;
  inviteCode: string;
  status: 'pending' | 'active' | 'inactive';
  ownerNickname: string | null;
  ownerSelfNickname: string | null;
  partnerNickname: string | null;
  partnerSelfNickname: string | null;
  inviteUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const sharedGroupService = {
  async setup(ownerId: string, ownerNickname: string, ownerSelfNickname: string): Promise<SharedGroup> {
    const res = await fetch(`${GATEWAY_URL}/api/shared-groups/setup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ownerId, ownerNickname, ownerSelfNickname }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erro ao configurar grupo compartilhado');
    return data.data;
  },

  async join(partnerId: string, code: string, partnerNickname: string, partnerSelfNickname: string): Promise<SharedGroup> {
    const res = await fetch(`${GATEWAY_URL}/api/shared-groups/join`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ partnerId, code, partnerNickname, partnerSelfNickname }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Código inválido ou já utilizado');
    return data.data;
  },

  async getGroup(userId: string): Promise<SharedGroup | null> {
    const res = await fetch(`${GATEWAY_URL}/api/shared-groups/${userId}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!data.success) return null;
    return data.data;
  },

  async leave(userId: string): Promise<void> {
    const res = await fetch(`${GATEWAY_URL}/api/shared-groups/${userId}/leave`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erro ao sair do grupo compartilhado');
  },
};
