import { IUser, useAuth } from '@/contexts/AuthContext';

export interface SettingsFormData {
  theme: 'light' | 'dark' | 'system';
  currency: 'BRL' | 'USD' | 'EUR';
  language: 'pt-BR' | 'en-US';
  notifications: boolean;
  emailAlerts: boolean;
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

export const defaultProfile: IUser = {
  name: '',
  email: '',
  plan: 'free',
  createdAt: '',
  id: '',
  sessionId: '',
  theme: 'system',
  currency: 'BRL',
  language: 'pt-BR',
  notifications: true,
  emailAlerts: true,
};
