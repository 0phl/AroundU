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
  const { alerts, loading, error, fetchAlerts } = useAlertStore();
  const { user } = useAuth();

  useEffect(() => {
    console.log('Fetching alerts...');
    try {
      fetchAlerts().catch(err => {
        console.error('Error in fetchAlerts:', err);
      });
    } catch (err) {
      console.error('Error in useEffect:', err);
    }
  }, [fetchAlerts]);

  console.log('Alerts component state:', { alerts, loading, error, user });

  // Helper function to check if date is within last 24 hours
  const isWithinLast24Hours = (date: Date) => {
    return Math.abs(differenceInHours(new Date(), date)) <= 24;
  };

  // Filter alerts based on status, expiration, and user role
  const activeAlerts = alerts.filter(alert => {
    const isActive = alert.status === 'active';
    const isNotExpired = !alert.expiresAt || new Date(alert.expiresAt) > new Date();
    const isTargetAudience = alert.targetAudience === 'all' || 
      (alert.targetAudience === 'students' && user?.studentId) ||
      (alert.targetAudience === 'businesses' && user?.role === 'admin');
    
    return isActive && isNotExpired && isTargetAudience;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex items-center space-x-2">
          <BellIcon className="h-5 w-5 text-gray-400" />
          <span className="text-gray-500">Loading alerts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-700">Error loading alerts: {error}</span>
          </div>
        </div>
      </div>
    );
  }

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
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'success':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'error':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 ring-red-600/20';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case 'low':
        return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Alerts & Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Stay updated with important announcements and notifications
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {activeAlerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No active alerts at the moment.</p>
          </div>
        ) : (
          activeAlerts.map((alert) => {
            const isRecent = isWithinLast24Hours(new Date(alert.createdAt));
            
            return (
              <div
                key={alert.id}
                className={`rounded-lg shadow-sm border transition-all duration-200 transform hover:scale-[1.01] ${getAlertColors(alert.type)}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h2 className="text-lg font-semibold truncate pr-2">
                          {alert.title}
                          {isRecent && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                              New
                            </span>
                          )}
                        </h2>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getPriorityStyles(alert.priority)}`}>
                            {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)} Priority
                          </span>
                          <span className="inline-flex items-center text-xs text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {format(new Date(alert.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                        {alert.message}
                      </p>
                      {alert.expiresAt && (
                        <p className="mt-2 text-xs text-gray-500">
                          Expires on {format(new Date(alert.expiresAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}