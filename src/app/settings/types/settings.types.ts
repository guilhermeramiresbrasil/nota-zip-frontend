import { UserPreferences } from '@/stores/useAuthStore';

export interface SettingsFormData extends UserPreferences {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export interface ProfileSectionData {
  name: string;
  email: string;
  plan: 'free' | 'basic' | 'premium';
  createdAt: string;
}
