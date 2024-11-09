import { create } from 'zustand';
import type { Alert } from '../types';

interface AlertStore {
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, alert: Partial<Alert>) => void;
  deleteAlert: (id: string) => void;
  markAllAsRead: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [
    {
      id: '1',
      title: 'System Maintenance',
      message: 'Scheduled maintenance this weekend',
      type: 'info',
      priority: 'medium',
      status: 'active',
      targetAudience: 'all',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ],
  addAlert: (alert) =>
    set((state) => ({
      alerts: [
        {
          ...alert,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        ...state.alerts
      ]
    })),
  updateAlert: (id, updatedAlert) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id
          ? { 
              ...alert, 
              ...updatedAlert, 
              updatedAt: new Date() 
            }
          : alert
      )
    })),
  deleteAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id)
    })),
  markAllAsRead: () =>
    set((state) => ({
      alerts: state.alerts.map((alert) => ({
        ...alert,
        status: 'inactive' as const,
        updatedAt: new Date()
      }))
    }))
}));