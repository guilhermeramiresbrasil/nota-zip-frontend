'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import userService from '@/services/userService';
import * as cryptoClient from '@/lib/crypto/cryptoClient';

export default function ChangePasswordPage() {
  const t = useTranslations('auth');
  const { user } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return t('passwordMinLength');
    }
    if (!/[A-Z]/.test(password)) {
      return t('passwordUppercase');
    }
    if (!/[a-z]/.test(password)) {
      return t('passwordLowercase');
    }
    if (!/[0-9]/.test(password)) {
      return t('passwordNumber');
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t('fillAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      if (!user?.id || !user.encryptionSalt) {
        throw new Error('User vault data unavailable');
      }

      const keys = cryptoClient.getVaultKeys();
      if (!keys) {
        throw new Error('Private key not loaded in this session');
      }

      const oldSalt = user.encryptionSalt;
      const { authKey: oldAuthKey } = await cryptoClient.deriveKeys(currentPassword, oldSalt, 'moderate');
      const oldAuthKeyB64 = await cryptoClient.authKeyToString(oldAuthKey);

      const newVault = await cryptoClient.reEncryptVault(keys.privateKey, newPassword, oldSalt);
      const { authKey: newAuthKey } = await cryptoClient.deriveKeys(newPassword, newVault.salt, 'moderate');
      const newAuthKeyB64 = await cryptoClient.authKeyToString(newAuthKey);

      const userServiceInstance = new userService();
      await userServiceInstance.changePassword(user.id, {
        currentPassword: oldAuthKeyB64,
        newPassword: newAuthKeyB64,
        vault: {
          publicKey: keys.publicKey,
          encryptedPrivateKey: newVault.encryptedPrivateKey,
          encryptionNonce: newVault.encryptionNonce,
          encryptionSalt: newVault.salt,
          keyVersion: newVault.keyVersion,
        },
      });

      await cryptoClient.persistPrivateKey(keys.privateKey);
      cryptoClient.setVaultKeys(keys.publicKey, keys.privateKey);

      showSuccess(t('passwordChangedSuccess'), t('passwordChangedRedirect'));
      setTimeout(() => {
        router.push('/home');
      }, 1500);
    } catch (error) {
      console.error('Password change error:', error);
      setError(t('passwordChangeError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">{t('changePasswordTitle')}</CardTitle>
          <CardDescription className="text-center">
            {t('changePasswordDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder={t('currentPasswordPlaceholder')}
                  className="pl-10 pr-10"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('newPassword')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder={t('newPasswordPlaceholder')}
                  className="pl-10 pr-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {t('passwordRequirementsHint')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('confirmNewPasswordPlaceholder')}
                  className="pl-10 pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? t('changing') : t('changePassword')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
