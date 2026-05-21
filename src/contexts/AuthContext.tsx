'use client';

import authService from '@/services/authService';
import userService from '@/services/userService';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Helper function to generate correlation ID
const generateCorrelationId = () => {
  return crypto.randomUUID();
};

export interface IUser {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'basic' | 'premium';
  createdAt: string;
  sessionId?: string;
  accessToken?: string;
  theme?: 'light' | 'dark' | 'system';
  currency?: 'BRL' | 'USD' | 'EUR';
  language?: 'pt-BR' | 'en-US';
  notifications?: boolean;
  emailAlerts?: boolean;
}

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updatedUser: (user: IUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const authServiceInstance = new authService();
  const userServiceInstance = new userService();
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clear old Zustand persist data
    localStorage.removeItem('auth-storage');

    // Check for existing session and refresh user data
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    
    const loadUserData = async () => {
      if (storedUser && storedAccessToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Check if user has required fields (id, name, email)
          if (!parsedUser.id || !parsedUser.name || !parsedUser.email) {
            console.log('Invalid user data, clearing storage');
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('sessionId');
            setIsLoading(false);
            return;
          }
          
          // Fetch fresh user data from backend
          try {
            
            const userResponse = await userServiceInstance.getUserById(parsedUser.id);
            if (userResponse.success) {
              const userData = userResponse.data;
              const updatedUser: IUser = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                plan: userData.plan || 'free',
                createdAt: userData.createdAt,
                sessionId: parsedUser.sessionId,
                accessToken: storedAccessToken,
                theme: userData.theme || 'light',
                currency: userData.currency || 'BRL',
                language: userData.language || 'pt-BR',
                notifications: userData.notifications ?? true,
                emailAlerts: userData.emailAlerts ?? true,
              };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
              // If fetch fails, use stored data
              setUser(parsedUser);
            }
          } catch (error) {
            console.error('Error fetching fresh user data:', error);
            setUser(parsedUser);
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('sessionId');
        }
      }
      setIsLoading(false);
    };

    loadUserData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const loginInfo = await authServiceInstance.login({ email, password });
      if (!loginInfo) {
        throw new Error('Invalid user data');
      }
      console.log('loginInfo', loginInfo);
      const loginDetails = loginInfo.data;

      const userInfo = await userServiceInstance.getUserById(loginDetails.userId);
      if (!userInfo) {
        throw new Error('Invalid user response');
      }      
      const userDetails = userInfo.data;
      
      const userObj: IUser = {
        id: loginDetails.userId,
        name: userDetails.name,
        email: userDetails.email || loginDetails.email,
        plan: userDetails.planId || loginDetails.planId || 'free',
        createdAt: userDetails.createdAt,
        sessionId: loginDetails.sessionId,
        accessToken: loginDetails.accessToken,
        theme: userDetails.theme || 'light',
        currency: userDetails.currency || 'BRL',
        language: userDetails.language || 'pt-BR',
        notifications: userDetails.notifications ?? true,
        emailAlerts: userDetails.emailAlerts ?? true,
      };

      await setUser(userObj);
      console.log('User object:', userObj); 
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('accessToken', loginDetails.accessToken);
      localStorage.setItem('sessionId', loginDetails.sessionId);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const registerInfo = await userServiceInstance.registerUser({ name, email, password });
      if (!registerInfo) {
        throw new Error('Invalid user data');
      }
      

    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao criar conta. Tente novamente.');
    }
  };

  const logout = async () => {
    await authServiceInstance.logout(user?.sessionId || '');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('sessionId');
  };

  const deleteAccount = async () => {
    const accessToken = localStorage.getItem('accessToken');
    

    try {
      if (!user || !user.id || !accessToken) return;
      await userServiceInstance.deleteUser(user.id);
      logout();
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  const updatedUser = async (user: IUser) => {
    if (!user) return;
    try {
      await userServiceInstance.updateUser(user);

      const updatedUser = { ...user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        deleteAccount,
        updatedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
