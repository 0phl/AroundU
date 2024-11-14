import { create } from 'zustand';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Discount } from '../types';

interface DiscountStore {
  discounts: Discount[];
  loading: boolean;
  error: string | null;
  fetchDiscounts: () => Promise<void>;
  addDiscount: (discount: Omit<Discount, 'id'>) => Promise<void>;
  updateDiscount: (id: string, data: Partial<Discount>) => Promise<void>;
  deleteDiscount: (id: string) => Promise<void>;
}

export const useDiscountStore = create<DiscountStore>((set) => ({
  discounts: [],
  loading: false,
  error: null,

  fetchDiscounts: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Starting fetchDiscounts...');
      const discountsRef = collection(db, 'discounts');
      const querySnapshot = await getDocs(discountsRef);
      
      const discounts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw discount data:', doc.id, data);
        
        // Safely handle date conversions
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
          expiryDate: data.expiryDate instanceof Timestamp ? data.expiryDate.toDate() : new Date(data.expiryDate),
        } as Discount;
      });
      
      console.log('Processed discounts:', discounts);
      set({ discounts, loading: false });
    } catch (error) {
      console.error('Error in fetchDiscounts:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch discounts', loading: false });
      throw error;
    }
  },

  addDiscount: async (discountData) => {
    try {
      // Convert the expiryDate string to Firestore Timestamp
      const newDiscount = {
        ...discountData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        expiryDate: Timestamp.fromDate(new Date(discountData.expiryDate)),
      };

      console.log('Adding discount with data:', newDiscount);
      const discountsRef = collection(db, 'discounts');
      const docRef = await addDoc(discountsRef, newDiscount);

      const discount = {
        ...newDiscount,
        id: docRef.id,
        createdAt: newDiscount.createdAt.toDate(),
        updatedAt: newDiscount.updatedAt.toDate(),
        expiryDate: newDiscount.expiryDate.toDate(),
      } as Discount;

      set(state => ({
        discounts: [...state.discounts, discount]
      }));
    } catch (error) {
      console.error('Error adding discount:', error);
      throw error;
    }
  },

  updateDiscount: async (id, data) => {
    try {
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
        // Convert expiryDate to Timestamp if it's being updated
        ...(data.expiryDate && {
          expiryDate: Timestamp.fromDate(new Date(data.expiryDate))
        })
      };

      const discountRef = doc(db, 'discounts', id);
      await updateDoc(discountRef, updateData);

      set(state => ({
        discounts: state.discounts.map(discount =>
          discount.id === id
            ? {
                ...discount,
                ...data,
                updatedAt: new Date(),
                // Ensure expiryDate is a Date object in the state
                ...(data.expiryDate && {
                  expiryDate: new Date(data.expiryDate)
                })
              }
            : discount
        )
      }));
    } catch (error) {
      console.error('Error updating discount:', error);
      throw error;
    }
  },

  deleteDiscount: async (id) => {
    try {
      await deleteDoc(doc(db, 'discounts', id));
      set(state => ({
        discounts: state.discounts.filter(discount => discount.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting discount:', error);
      throw error;
    }
  }
}));