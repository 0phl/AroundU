import React from 'react';
import { useAlertStore } from '../stores/alertStore';
import { BellIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

export default function Alerts() {
  const { alerts } = useAlertStore();
  const { user } = useAuth();

  // Filter alerts based on status, expiration, and user role
  const activeAlerts = alerts.filter(alert => {
    const isActive = alert.status === 'active';
    const isNotExpired = !alert.expiresAt || new Date(alert.expiresAt) > new Date();
    const isTargetAudience = alert.targetAudience === 'all' || 
      (alert.targetAudience === 'students' && user?.studentId) ||
      (alert.targetAudience === 'businesses' && user?.role === 'admin');
    
    return isActive && isNotExpired && isTargetAudience;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 text-blue-800';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800';
      case 'success':
        return 'bg-green-50 text-green-800';
      case 'error':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Alerts & Notifications</h1>
      </div>

      <div className="space-y-4">
        {activeAlerts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No active alerts at the moment.</p>
          </div>
        ) : (
          activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg shadow-md p-4 ${getAlertColors(alert.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{alert.title}</h2>
                    <div className="flex items-center space-x-4">
                      {alert.priority === 'high' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          High Priority
                        </span>
                      )}
                      <span className="text-sm">
                        {format(new Date(alert.createdAt), 'PPp')}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2">{alert.message}</p>
                  {alert.expiresAt && (
                    <p className="mt-2 text-sm">
                      Expires: {format(new Date(alert.expiresAt), 'PPp')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}