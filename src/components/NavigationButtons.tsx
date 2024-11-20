import React, { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapIcon, StarIcon, CalendarIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAlertStore } from '../stores/alertStore';
import { useAuth } from '../hooks/useAuth';

const navigationButtons = [
  { to: "/map", icon: MapIcon, label: "Map" },
  { to: "/top-rated", icon: StarIcon, label: "Top Rated" },
  { to: "/events", icon: CalendarIcon, label: "Events" },
  { to: "/alerts", icon: BellIcon, label: "Alerts" },
];

export default function NavigationButtons() {
  const location = useLocation();
  const { alerts, fetchAlerts } = useAlertStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchAlerts().catch(error => {
        console.error('Error fetching alerts in NavigationButtons:', error);
      });
    }
  }, [fetchAlerts, user?.id]);
  
  const unreadCount = useMemo(() => {
    if (!user?.id || !alerts.length) return 0;
    if (location.pathname === '/alerts') return 0;

    return alerts.filter(alert => {
      const isActive = alert.status === 'active';
      const isNotExpired = !alert.expiresAt || new Date(alert.expiresAt) > new Date();
      const isTargetAudience = alert.targetAudience === 'all' || 
        (alert.targetAudience === 'students' && user?.studentId) ||
        (alert.targetAudience === 'businesses' && user?.role === 'admin');
      const readBy = Array.isArray(alert.readBy) ? alert.readBy : [];
      const isUnread = !readBy.includes(user.id);
      return isActive && isNotExpired && isTargetAudience && isUnread;
    }).length;
  }, [alerts, user, location.pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around py-2">
          {navigationButtons.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            const showBadge = to === '/alerts' && unreadCount > 0;

            return (
              <Link
                key={to}
                to={to}
                className={`relative flex flex-col items-center px-2 py-1 text-xs font-medium transition-colors duration-200
                  ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center text-[10px] text-white bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="mt-0.5">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}