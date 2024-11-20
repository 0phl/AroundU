import { create } from 'zustand';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, arrayUnion, query, orderBy, where, getDoc } from 'firebase/firestore';
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
  markAsRead: (id: string, userId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  loading: false,
  error: null,

  fetchAlerts: async () => {
    set({ loading: true, error: null });
    try {
      const alertsRef = collection(db, 'alerts');
      const alertsQuery = query(
        alertsRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(alertsQuery);
      const now = new Date();
      
      const alerts = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          console.log('Alert data from Firestore:', { id: doc.id, ...data });
          
          // Ensure readBy is always an array
          const readBy = data.readBy || [];
          if (!Array.isArray(readBy)) {
            console.warn('readBy is not an array for alert:', doc.id);
          }
          
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || now,
            updatedAt: data.updatedAt?.toDate() || now,
            expiresAt: data.expiresAt?.toDate() || null,
            readBy: Array.isArray(readBy) ? readBy : [],
            status: data.status || 'active',
            targetAudience: data.targetAudience || 'all',
            type: data.type || 'info'
          } as Alert;
        })
        .filter(alert => !alert.expiresAt || new Date(alert.expiresAt) > now);
      
      console.log('Processed alerts:', alerts);
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
        readBy: [],
        status: alertData.status || 'active',
        targetAudience: alertData.targetAudience || 'all',
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
      throw error;
    }
  },

  updateAlert: async (id, alertData) => {
    try {
      const alertRef = doc(db, 'alerts', id);
      const updateData = {
        ...alertData,
        updatedAt: Timestamp.now(),
        expiresAt: alertData.expiresAt ? Timestamp.fromDate(new Date(alertData.expiresAt)) : null,
        status: alertData.status || 'active',
        targetAudience: alertData.targetAudience || 'all'
      };

      await updateDoc(alertRef, updateData);

      set(state => ({
        alerts: state.alerts.map(alert =>
          alert.id === id
            ? {
                ...alert,
                ...alertData,
                updatedAt: new Date(),
                expiresAt: alertData.expiresAt ? new Date(alertData.expiresAt) : null,
                status: alertData.status || 'active',
                targetAudience: alertData.targetAudience || 'all'
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
  },

  markAsRead: async (id: string, userId: string) => {
    if (!userId) {
      console.error('No user ID provided to markAsRead');
      return;
    }

    try {
      const alertRef = doc(db, 'alerts', id);
      const alertDoc = await getDoc(alertRef);
      
      if (!alertDoc.exists()) {
        console.error('Alert document not found:', id);
        return;
      }

      const alertData = alertDoc.data();
      const readBy = Array.isArray(alertData.readBy) ? alertData.readBy : [];
      
      // Check if already read
      if (readBy.includes(userId)) {
        return;
      }

      // Update Firestore
      await updateDoc(alertRef, {
        readBy: arrayUnion(userId),
        updatedAt: Timestamp.now()
      });

      // Update local state immediately
      set(state => ({
        alerts: state.alerts.map(alert => 
          alert.id === id 
            ? {
                ...alert,
                readBy: [...(Array.isArray(alert.readBy) ? alert.readBy : []), userId],
                updatedAt: new Date()
              }
            : alert
        )
      }));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  },

  markAllAsRead: async (userId: string) => {
    if (!userId) {
      console.error('No user ID provided to markAllAsRead');
      return;
    }

    try {
      const state = get();
      const unreadAlerts = state.alerts.filter(alert => {
        const readBy = Array.isArray(alert.readBy) ? alert.readBy : [];
        return !readBy.includes(userId) && 
               alert.status === 'active' &&
               (!alert.expiresAt || new Date(alert.expiresAt) > new Date());
      });

      // Update local state immediately
      set(state => ({
        alerts: state.alerts.map(alert => {
          const readBy = Array.isArray(alert.readBy) ? alert.readBy : [];
          if (!readBy.includes(userId)) {
            return {
              ...alert,
              readBy: [...readBy, userId],
              updatedAt: new Date()
            };
          }
          return alert;
        })
      }));

      // Update Firestore in parallel
      await Promise.all(unreadAlerts.map(alert => {
        const alertRef = doc(db, 'alerts', alert.id);
        return updateDoc(alertRef, {
          readBy: arrayUnion(userId),
          updatedAt: Timestamp.now()
        });
      }));
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  }
}));