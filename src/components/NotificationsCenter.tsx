'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X, Check, Archive, AlertTriangle, Info, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslations, useLocale } from 'next-intl';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Alert {
  id: string;
  userId: string;
  type: 'warning' | 'success' | 'error' | 'info';
  title: string;
  message: string;
  actionUrl?: string;
  actionType?: string;
  actionCompleted: boolean;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

export function NotificationsCenter() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const t = useTranslations('notifications');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 300);
    } else {
      setIsOpen(true);
    }
  };

  const fetchAlerts = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/alerts/user/${user.id}/unarchived`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(data.data || []);
        setUnreadCount(data.data?.filter((a: Alert) => !a.isRead).length || 0);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/alerts/${alertId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, isRead: true } : a));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAsArchived = async (alertId: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/alerts/${alertId}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        setAlerts(alerts.filter(a => a.id !== alertId));
        const alert = alerts.find(a => a.id === alertId);
        if (alert && !alert.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        showSuccess(t('archived'));
      }
    } catch (error) {
      console.error('Error archiving alert:', error);
    }
  };

  const handleActionClick = async (alert: Alert) => {
    if (!alert.actionUrl) return;

    // Mark as read when clicking action
    if (!alert.isRead) {
      await markAsRead(alert.id);
    }

    // Navigate to action URL
    router.push(alert.actionUrl);
    setIsOpen(false);
  };

  const markAllAsRead = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/alerts/user/${user?.id}/read-all`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        setAlerts(alerts.map(a => ({ ...a, isRead: true })));
        setUnreadCount(0);
        showSuccess(t('allMarkedAsRead'));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-gray-100 transition-colors"
        onClick={handleToggle}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30 md:hidden"
            onClick={handleToggle}
          />
          {/* Mobile version */}
          <div className={`md:hidden fixed inset-x-0 top-16 bg-white border-t border-gray-200 z-20 ${isClosing ? 'animate-slide-up' : 'animate-slide-down'}`}>
            <div className="px-4 pt-4 pb-6">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{t('title')}</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        {t('markAllAsRead')}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleToggle}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-sm text-gray-500">{t('loading')}</p>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">{t('noNotifications')}</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 mb-2 rounded-lg border ${getAlertBgColor(alert.type)} ${
                          !alert.isRead ? 'border-l-4' : 'opacity-75'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{alert.title}</p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                            {alert.actionUrl && !alert.actionCompleted && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 mt-2 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700"
                                onClick={() => handleActionClick(alert)}
                              >
                                <ExternalLink className="h-3 w-3 mr-1 text-blue-600" />
                                {alert.actionType === 'shared_group_setup' ? t('actions.shared_group_setup') :
                                 alert.actionType === 'email_verification' ? t('actions.email_verification') :
                                 alert.actionType === 'whatsapp_verification' ? t('actions.whatsapp_verification') :
                                 t('actions.view_details')}
                              </Button>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(alert.createdAt).toLocaleString(locale)}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            {!alert.isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => markAsRead(alert.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => markAsArchived(alert.id)}
                            >
                              <Archive className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop version */}
          <div className={`hidden md:block absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 ${isClosing ? 'animate-slide-up' : 'animate-slide-down'}`}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{t('title')}</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      {t('markAllAsRead')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggle}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-gray-500">{t('loading')}</p>
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">{t('noNotifications')}</p>
                </div>
              ) : (
                <div className="p-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 mb-2 rounded-lg border ${getAlertBgColor(alert.type)} ${
                        !alert.isRead ? 'border-l-4' : 'opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{alert.title}</p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                          {alert.actionUrl && !alert.actionCompleted && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 mt-2 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700"
                              onClick={() => handleActionClick(alert)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1 text-blue-600" />
                              {alert.actionType === 'shared_group_setup' ? t('actions.shared_group_setup') :
                               alert.actionType === 'email_verification' ? t('actions.email_verification') :
                               alert.actionType === 'whatsapp_verification' ? t('actions.whatsapp_verification') :
                               t('actions.view_details')}
                            </Button>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(alert.createdAt).toLocaleString(locale)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {!alert.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => markAsRead(alert.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => markAsArchived(alert.id)}
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
