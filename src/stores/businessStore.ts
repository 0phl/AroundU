import { create } from 'zustand';
import type { Business } from '../types';
import { useDiscountStore } from './discountStore';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  Timestamp,
  getFirestore 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface BusinessStore {
  businesses: Business[];
  loading: boolean;
  fetchBusinesses: () => Promise<void>;
  addBusiness: (business: Omit<Business, 'id'>) => Promise<void>;
  updateBusiness: (id: string, business: Partial<Business>) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
}

interface FirestoreBusiness {
  name: string;
  description: string;
  category: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  website: string;
  hours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  photos: string[];
  rating: number;
  reviewCount: number;
  discounts: string[];
  searchTerms?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const useBusinessStore = create<BusinessStore>((set, get) => ({
  businesses: [],
  loading: false,

  fetchBusinesses: async () => {
    set({ loading: true });
    try {
      console.log('Fetching businesses...');
      const businessesRef = collection(db, 'businesses');
      const q = query(businessesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const businesses = querySnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreBusiness;
        console.log('Business data:', doc.id, data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          searchTerms: data.searchTerms || [],
          discounts: data.discounts || []
        } as Business;
      });

      console.log('Processed businesses:', businesses);
      set({ businesses, loading: false });
    } catch (error) {
      console.error('Error fetching businesses:', error);
      set({ loading: false });
      throw error;
    }
  },

  addBusiness: async (businessData) => {
    try {
      const businessesRef = collection(db, 'businesses');
      const newBusiness = {
        ...businessData,
        rating: 0,
        reviewCount: 0,
        discounts: [],
        searchTerms: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(businessesRef, newBusiness);
      const business = {
        ...newBusiness,
        id: docRef.id,
        createdAt: newBusiness.createdAt.toDate(),
        updatedAt: newBusiness.updatedAt.toDate(),
        searchTerms: [],
      } as Business;

      set(state => ({
        businesses: [business, ...state.businesses]
      }));
    } catch (error) {
      console.error('Error adding business:', error);
      throw error;
    }
  },

  updateBusiness: async (id, updatedData) => {
    try {
      const businessRef = doc(db, 'businesses', id);
      const updateData = {
        ...updatedData,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(businessRef, updateData);

      set(state => ({
        businesses: state.businesses.map(business =>
          business.id === id
            ? { ...business, ...updatedData, updatedAt: new Date() }
            : business
        )
      }));
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    }
  },

  deleteBusiness: async (id) => {
    try {
      const businessRef = doc(db, 'businesses', id);
      await deleteDoc(businessRef);

      // Also delete associated discounts
      const discountStore = useDiscountStore.getState();
      const discountsToDelete = discountStore.discounts.filter(d => d.businessId === id);
      discountsToDelete.forEach(d => discountStore.deleteDiscount(d.id));

      set(state => ({
        businesses: state.businesses.filter(business => business.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting business:', error);
      throw error;
    }
  },
}));