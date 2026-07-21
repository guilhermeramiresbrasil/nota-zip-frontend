'use client';

import authService from '@/services/authService';
import userService from '@/services/userService';
import * as cryptoClient from '@/lib/crypto/cryptoClient';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface IUser {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'basic' | 'premium' | 'shared';
  createdAt: string;
  sessionId?: string;
  accessToken?: string;
  theme?: 'light' | 'dark' | 'system';
  currency?: 'BRL' | 'USD' | 'EUR';
  language?: 'pt-BR' | 'en-US' | 'es-ES';
  notifications?: boolean;
  emailAlerts?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isTemporaryPassword?: boolean;
  sharedGroupId?: string;
  partnerNickname?: string;
  selfNickname?: string;
  publicKey?: string;
  encryptionSalt?: string;
  keyVersion?: number;
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
  const router = useRouter();
  const authServiceInstance = new authService();
  const userServiceInstance = new userService();
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getStoredAuthData = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedAccessToken = localStorage.getItem('accessToken');
      return { storedUser, storedAccessToken };
    } catch (error) {
      console.error('Error accessing localStorage (possibly private browsing):', error);
      return { storedUser: null, storedAccessToken: null };
    }
  };

  const validateStoredUser = (parsedUser: any): boolean => {
    return !!(parsedUser.id && parsedUser.name && parsedUser.email);
  };

  const clearInvalidAuthData = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('sessionId');
    } catch (error) {
      console.error('Error clearing localStorage (possibly private browsing):', error);
    }
  };

  const restoreUserFromStorage = (parsedUser: any, storedAccessToken: string): IUser => {
    try {
      return {
        ...parsedUser,
        accessToken: storedAccessToken,
        sessionId: parsedUser.sessionId || localStorage.getItem('sessionId') || undefined,
      };
    } catch (error) {
      console.error('Error accessing localStorage (possibly private browsing):', error);
      return {
        ...parsedUser,
        accessToken: storedAccessToken,
        sessionId: parsedUser.sessionId || undefined,
      };
    }
  };

  const buildUpdatedUser = (userData: any, parsedUser: any, storedAccessToken: string): IUser => {
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      plan: userData.planId || userData.plan || 'free',
      createdAt: userData.createdAt,
      sessionId: parsedUser.sessionId,
      accessToken: storedAccessToken,
      theme: userData.theme || 'light',
      currency: userData.currency || 'BRL',
      language: userData.language || 'pt-BR',
      notifications: userData.notifications ?? true,
      emailAlerts: userData.emailAlerts ?? true,
      emailVerified: userData.emailVerified ?? false,
      phoneVerified: userData.phoneVerified ?? false,
      isTemporaryPassword: userData.isTemporaryPassword ?? false,
      sharedGroupId: userData.sharedGroupId,
      partnerNickname: userData.partnerNickname,
      selfNickname: userData.selfNickname,
      publicKey: userData.publicKey,
      encryptionSalt: userData.encryptionSalt,
      keyVersion: userData.keyVersion,
    };
  };

  const fetchFreshUserData = async (userId: string) => {
    return await userServiceInstance.getUserById(userId);
  };

  const loadUserData = async () => {
    const { storedUser, storedAccessToken } = getStoredAuthData();

    if (storedUser && storedAccessToken) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (!validateStoredUser(parsedUser)) {
          clearInvalidAuthData();
          setIsLoading(false);
          return;
        }

        const restoredUser = restoreUserFromStorage(parsedUser, storedAccessToken);
        setUser(restoredUser);

        try {
          const userResponse = await fetchFreshUserData(parsedUser.id);
          if (userResponse.success) {
            const userData = userResponse.data;
            const updatedUser = buildUpdatedUser(userData, parsedUser, storedAccessToken);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            const publicKey = updatedUser.publicKey;
            if (publicKey) {
              cryptoClient.loadPersistedPrivateKey().then((privateKey) => {
                if (publicKey && privateKey) {
                  cryptoClient.setVaultKeys(publicKey, privateKey);
                }
              });
            }

          }
        } catch (error) {
          console.error('Error fetching fresh user data:', error);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        clearInvalidAuthData();
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const publicInfo = await userServiceInstance.getUserByEmail(email);
      if (!publicInfo?.success || !publicInfo.data) {
        throw new Error('User not found');
      }
      const { id: userId, encryptionSalt, publicKey } = publicInfo.data;
      if (!encryptionSalt) {
        throw new Error('Account not ready for zero-knowledge login');
      }

      const { authKey } = await cryptoClient.deriveKeys(password, encryptionSalt, 'moderate');
      const authKeyB64 = await cryptoClient.authKeyToString(authKey);

      const loginInfo = await authServiceInstance.login({ email, password: authKeyB64 });
      if (!loginInfo?.data) {
        throw new Error('Invalid user data');
      }
      const loginDetails = loginInfo.data;

      try {
        localStorage.setItem('accessToken', loginDetails.accessToken);
        localStorage.setItem('sessionId', loginDetails.sessionId);
      } catch (error) {
        console.error('Error setting localStorage (possibly private browsing):', error);
      }

      const userInfo = await userServiceInstance.getUserById(loginDetails.userId);
      if (!userInfo?.data) {
        throw new Error('Invalid user response');
      }
      const userDetails = userInfo.data;

      let finalPublicKey = userDetails.publicKey || publicKey;
      let finalSalt = userDetails.encryptionSalt || encryptionSalt;
      let finalKeyVersion = userDetails.keyVersion || 1;
      let privateKey: string | null = null;

      if (userDetails.encryptedPrivateKey && finalPublicKey && finalSalt) {
        try {
          privateKey = await cryptoClient.unlockVault(
            password,
            finalSalt,
            userDetails.encryptedPrivateKey,
            userDetails.encryptionNonce
          );
        } catch (error) {
          if (userDetails.isTemporaryPassword) {
            console.warn('Vault unlock failed for temporary password; recreating vault with same salt');
            const vault = await cryptoClient.createVaultWithSalt(password, finalSalt);
            await userServiceInstance.setVault(userDetails.id, {
              publicKey: vault.publicKey,
              encryptedPrivateKey: vault.encryptedPrivateKey,
              encryptionNonce: vault.encryptionNonce,
              encryptionSalt: vault.salt,
              keyVersion: vault.keyVersion,
            });
            finalPublicKey = vault.publicKey;
            finalSalt = vault.salt;
            finalKeyVersion = vault.keyVersion;
            privateKey = vault.privateKey;
          } else {
            console.error('Vault unlock failed:', error);
            throw new Error('Não foi possível destravar o cofre. Tente redefinir a senha.');
          }
        }
      }

      if (!privateKey || !finalPublicKey) {
        const saltForNewVault = finalSalt || (await cryptoClient.generateSalt());
        const vault = await cryptoClient.createVaultWithSalt(password, saltForNewVault);
        await userServiceInstance.setVault(userDetails.id, {
          publicKey: vault.publicKey,
          encryptedPrivateKey: vault.encryptedPrivateKey,
          encryptionNonce: vault.encryptionNonce,
          encryptionSalt: vault.salt,
          keyVersion: vault.keyVersion,
        });
        finalPublicKey = vault.publicKey;
        finalSalt = vault.salt;
        finalKeyVersion = vault.keyVersion;
        privateKey = vault.privateKey;
      }

      if (privateKey && finalPublicKey) {
        await cryptoClient.persistPrivateKey(privateKey);
        cryptoClient.setVaultKeys(finalPublicKey, privateKey);
      }

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
        emailVerified: userDetails.emailVerified ?? loginDetails.emailVerified ?? false,
        phoneVerified: userDetails.phoneVerified ?? loginDetails.phoneVerified ?? false,
        isTemporaryPassword: userDetails.isTemporaryPassword ?? false,
        publicKey: finalPublicKey,
        encryptionSalt: finalSalt,
        keyVersion: finalKeyVersion,
      };

      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));

      if (userObj.isTemporaryPassword) {
        router.push('/change-password');
      } else if (!userObj.emailVerified || !userObj.phoneVerified) {
        router.push('/home');
      } else {
        router.push('/home');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const vault = await cryptoClient.createVault(password);

      const registerInfo = await userServiceInstance.registerUser({
        name,
        email,
        password: vault.authKeyB64,
        encryptionSalt: vault.salt,
        publicKey: vault.publicKey,
        encryptedPrivateKey: vault.encryptedPrivateKey,
        encryptionNonce: vault.encryptionNonce,
        keyVersion: vault.keyVersion,
      });

      if (!registerInfo) {
        throw new Error('Invalid registration response');
      }

      await cryptoClient.persistPrivateKey(vault.privateKey);
      cryptoClient.setVaultKeys(vault.publicKey, vault.privateKey);

      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao criar conta. Tente novamente.');
    }
  };

  const logout = async () => {
    try {
      await authServiceInstance.logout(user?.sessionId || '');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    clearInvalidAuthData();
    await cryptoClient.clearCryptoState();
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

      const updated = { ...user };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
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
