import React, { useEffect } from 'react';
import { useAlertStore } from '../stores/alertStore';
import { 
  BellIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { format, differenceInHours } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

export default function Alerts() {
  const { alerts, loading, error, fetchAlerts, markAllAsRead } = useAlertStore();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      console.log('No user ID available, skipping alert fetch');
      return;
    }

    console.log('Fetching alerts for user:', user.id);
    fetchAlerts().catch(error => {
      console.error('Error fetching alerts:', error);
    });
  }, [fetchAlerts, user]);

  useEffect(() => {
    const markAllAlertsAsRead = async () => {
      if (!user?.id || alerts.length === 0) {
        return;
      }

      try {
        await markAllAsRead(user.id);
      } catch (error) {
        console.error('Error marking all alerts as read:', error);
      }
    };

    markAllAlertsAsRead();
  }, [alerts.length, markAllAsRead, user]);

  const getAlertIcon = (type: string) => {
    console.log('Alert type for icon:', type);
    // Normalize type to lowercase and handle null/undefined
    const normalizedType = (type || '').toLowerCase();
    
    switch (normalizedType) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      default:
        console.warn(`Unknown alert type: ${type}`);
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getAlertStyles = (type: string, isRead: boolean) => {
    console.log('Alert type for styles:', type, 'isRead:', isRead);
    const baseStyles = "p-4 rounded-lg shadow-sm border transition-all duration-200";
    
    // Normalize type to lowercase and handle null/undefined
    const normalizedType = (type || '').toLowerCase();
    
    switch (normalizedType) {
      case 'warning':
        return `${baseStyles} ${isRead ? 'bg-yellow-50/80' : 'bg-yellow-50'} border-yellow-200 hover:bg-yellow-100`;
      case 'info':
        return `${baseStyles} ${isRead ? 'bg-blue-50/80' : 'bg-blue-50'} border-blue-200 hover:bg-blue-100`;
      case 'success':
        return `${baseStyles} ${isRead ? 'bg-green-50/80' : 'bg-green-50'} border-green-200 hover:bg-green-100`;
      case 'error':
        return `${baseStyles} ${isRead ? 'bg-red-50/80' : 'bg-red-50'} border-red-200 hover:bg-red-100`;
      default:
        console.warn(`Unknown alert type: ${type}`);
        return `${baseStyles} ${isRead ? 'bg-gray-50/80' : 'bg-white'} border-gray-200 hover:bg-gray-50`;
    }
  };

  const isWithinLast24Hours = (date: Date) => {
    return Math.abs(differenceInHours(new Date(), date)) <= 24;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading alerts</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Alerts</h1>
      {alerts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No alerts</h3>
          <p className="mt-2 text-gray-500">You're all caught up! Check back later for new alerts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const readBy = Array.isArray(alert.readBy) ? alert.readBy : [];
            const isRead = user?.id ? readBy.includes(user.id) : false;
            
            return (
              <div
                key={alert.id}
                className={getAlertStyles(alert.type, isRead)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between">
                      <h2 className={`font-semibold truncate text-gray-900`}>
                        {alert.title}
                      </h2>
                      <div className="flex-shrink-0 ml-4">
                        <span className="text-sm text-gray-500">
                          {isWithinLast24Hours(alert.createdAt)
                            ? format(alert.createdAt, 'h:mm a')
                            : format(alert.createdAt, 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <p className={`mt-1 text-sm whitespace-pre-wrap text-gray-700`}>
                      {alert.message}
                    </p>
                    {alert.expiresAt && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Expires: {format(alert.expiresAt, 'MMM d, yyyy h:mm a')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}