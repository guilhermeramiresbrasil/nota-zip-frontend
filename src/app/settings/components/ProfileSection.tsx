'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { IUser } from '@/contexts/AuthContext';

interface ProfileSectionProps {
  user: IUser;
  onChangeUser: (user: IUser) => void;
  handleSave: () => void;
  isLoading: boolean;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onChangeUser, handleSave, isLoading }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const t = useTranslations('settings');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t('profile')}
        </CardTitle>
        <CardDescription>{t('profileDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('name')}</Label>
          <Input
            id="name"
            value={user.name}
            onChange={(e) => onChangeUser({ ...user, name: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            onChange={(e) => onChangeUser({ ...user, email: e.target.value })}
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label>{t('currentPlan')}</Label>
          <div className="text-sm text-gray-600 capitalize">{user?.plan || 'free'}</div>
        </div>

        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? t('saving') : t('save')}
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>{t('editProfile')}</Button>
        )}
      </CardContent>
    </Card>
  );
};
