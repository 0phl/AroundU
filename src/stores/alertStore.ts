import { create } from 'zustand';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Alert } from '../types';

interface AlertStore {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  fetchAlerts: () => Promise<void>;
  addAlert: (alert: Omit<Alert, 'id'>) => Promise<void>;
  updateAlert: (id: string, alert: Partial<Alert>) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  loading: false,
  error: null,

  fetchAlerts: async () => {
    set({ loading: true, error: null });
    try {
      const alertsRef = collection(db, 'alerts');
      const querySnapshot = await getDocs(alertsRef);
      
      const alerts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || null
        } as Alert;
      });
      
      set({ alerts, loading: false });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      set({ error: 'Failed to fetch alerts', loading: false });
    }
  },

  addAlert: async (alertData) => {
    try {
      const alertsRef = collection(db, 'alerts');
      const newAlert = {
        ...alertData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        expiresAt: alertData.expiresAt ? Timestamp.fromDate(new Date(alertData.expiresAt)) : null
      };

      const docRef = await addDoc(alertsRef, newAlert);
      const alert = {
        ...newAlert,
        id: docRef.id,
        createdAt: newAlert.createdAt.toDate(),
        updatedAt: newAlert.updatedAt.toDate(),
        expiresAt: newAlert.expiresAt?.toDate() || null
      } as Alert;

      set(state => ({
        alerts: [alert, ...state.alerts]
      }));
    } catch (error) {
      console.error('Error adding alert:', error);
      set({ error: 'Failed to add alert' });
      throw error;
    }
  },

  updateAlert: async (id, alertData) => {
    try {
      const alertRef = doc(db, 'alerts', id);
      const updateData = {
        ...alertData,
        updatedAt: Timestamp.now(),
        expiresAt: alertData.expiresAt ? Timestamp.fromDate(new Date(alertData.expiresAt)) : null
      };

      await updateDoc(alertRef, updateData);

      set(state => ({
        alerts: state.alerts.map(alert =>
          alert.id === id
            ? {
                ...alert,
                ...alertData,
                updatedAt: new Date(),
                expiresAt: alertData.expiresAt ? new Date(alertData.expiresAt) : null
              }
            : alert
        )
      }));
    } catch (error) {
      console.error('Error updating alert:', error);
      set({ error: 'Failed to update alert' });
      throw error;
    }
  },

  deleteAlert: async (id) => {
    try {
      await deleteDoc(doc(db, 'alerts', id));
      set(state => ({
        alerts: state.alerts.filter(alert => alert.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting alert:', error);
      set({ error: 'Failed to delete alert' });
      throw error;
    }
  }
}));