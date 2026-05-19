import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'basic' | 'premium';
  createdAt: string;
  sessionId?: string;
  accessToken?: string;
  refreshToken?: string;
  theme?: 'light' | 'dark' | 'system';
  currency?: 'BRL' | 'USD' | 'EUR';
  language?: 'pt-BR' | 'en-US';
  notifications?: boolean;
  emailAlerts?: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: 'BRL' | 'USD' | 'EUR';
  language: 'pt-BR' | 'en-US';
  notifications: boolean;
  emailAlerts: boolean;
  plan?: 'free' | 'basic' | 'premium';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  updatePreferences: (preferences: UserPreferences) => Promise<void>;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      hydrate: () => {
        const user = get().user;
        set({ isAuthenticated: !!user, isLoading: false });
      },

      login: async (email: string, password: string) => {
        try {
          const response = await fetch(`${GATEWAY_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password,
              authMethod: 'password',
            }),
          });

          if (!response.ok) {
            throw new Error('Login failed');
          }

          const data = await response.json();

          // Get user details
          const userResponse = await fetch(`${GATEWAY_URL}/api/users/email/${email}`);
          const userData = await userResponse.json();

          const userObj: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            plan: userData.plan || 'free',
            createdAt: userData.createdAt,
            sessionId: data.sessionId,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };

          set({ user: userObj, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          // Create user in user-ms via gateway
          const userResponse = await fetch(`${GATEWAY_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              password,
              plan: 'free',
            }),
          });

          if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new Error(errorData.error || errorData.message || 'Registration failed');
          }

          const userData = await userResponse.json();

          // Auto-login after registration
          await get().login(email, password);
        } catch (error) {
          console.error('Registration error:', error);
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Erro ao criar conta. Tente novamente.');
        }
      },

      logout: () => {
        const user = get().user;
        if (user?.sessionId) {
          fetch(`${GATEWAY_URL}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: user.sessionId }),
          }).catch(console.error);
        }
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('sessionId');
      },

      deleteAccount: async () => {
        const user = get().user;
        if (!user?.id) return;

        try {
          await fetch(`${GATEWAY_URL}/api/users/${user.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.accessToken}`,
            },
          });

          get().logout();
        } catch (error) {
          console.error('Delete account error:', error);
          throw error;
        }
      },

      updatePreferences: async (preferences: UserPreferences) => {
        const user = get().user;
        if (!user) return;

        try {
          await fetch(`${GATEWAY_URL}/api/users/${user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.accessToken}`,
            },
            body: JSON.stringify(preferences),
          });

          const updatedUser = { ...user, ...preferences };
          set({ user: updatedUser });
        } catch (error) {
          console.error('Update preferences error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
