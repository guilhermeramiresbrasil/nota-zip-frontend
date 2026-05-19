import { SettingsFormData } from '../../types/settings.types';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class SettingsService {
  private static instance: SettingsService;

  private constructor() {}

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  async updatePreferences(preferences: SettingsFormData): Promise<void> {
    // TODO: Integrar com API real
    // await fetch(`${GATEWAY_URL}/api/users/preferences`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(preferences),
    // });

    throw new Error('Not implemented');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // TODO: Integrar com API real
    // await fetch(`${GATEWAY_URL}/api/auth/change-password`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ currentPassword, newPassword }),
    // });

    throw new Error('Not implemented');
  }

  async deleteAccount(): Promise<void> {
    // TODO: Integrar com API real
    // await fetch(`${GATEWAY_URL}/api/users/me`, {
    //   method: 'DELETE',
    // });

    throw new Error('Not implemented');
  }
}

export const settingsService = SettingsService.getInstance();
