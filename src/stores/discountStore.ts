import { create } from 'zustand';
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
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Discount } from '../types';

interface DiscountStore {
  discounts: Discount[];
  loading: boolean;
  fetchDiscounts: () => Promise<void>;
  addDiscount: (discount: Omit<Discount, 'id'>) => Promise<void>;
  updateDiscount: (id: string, discount: Partial<Discount>) => Promise<void>;
  deleteDiscount: (id: string) => Promise<void>;
}

export const useDiscountStore = create<DiscountStore>((set, get) => ({
  discounts: [],
  loading: false,

  fetchDiscounts: async () => {
    set({ loading: true });
    try {
      const discountsRef = collection(db, 'discounts');
      const q = query(discountsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const discounts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          expiryDate: data.expiryDate?.toDate() || new Date(),
        } as Discount;
      });

      set({ discounts });
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      set({ loading: false });
    }
  },

  addDiscount: async (discountData) => {
    try {
      const discountsRef = collection(db, 'discounts');
      const newDiscount = {
        ...discountData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        expiryDate: Timestamp.fromDate(new Date(discountData.expiryDate)),
        status: 'active'
      };

      const docRef = await addDoc(discountsRef, newDiscount);
      
      const discount = {
        ...newDiscount,
        id: docRef.id,
        createdAt: newDiscount.createdAt.toDate(),
        updatedAt: newDiscount.updatedAt.toDate(),
        expiryDate: newDiscount.expiryDate.toDate(),
      } as Discount;

      set(state => ({
        discounts: [discount, ...state.discounts]
      }));

      await get().fetchDiscounts();
    } catch (error) {
      console.error('Error adding discount:', error);
      throw error;
    }
  },

  updateDiscount: async (id, updatedData) => {
    try {
      const discountRef = doc(db, 'discounts', id);
      const updateData = {
        ...updatedData,
        updatedAt: Timestamp.now(),
        ...(updatedData.expiryDate && {
          expiryDate: Timestamp.fromDate(new Date(updatedData.expiryDate))
        })
      };
      
      await updateDoc(discountRef, updateData);

      set(state => ({
        discounts: state.discounts.map(discount =>
          discount.id === id
            ? { 
                ...discount, 
                ...updatedData, 
                updatedAt: new Date(),
                ...(updatedData.expiryDate && {
                  expiryDate: new Date(updatedData.expiryDate)
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
      const discountRef = doc(db, 'discounts', id);
      await deleteDoc(discountRef);

      set(state => ({
        discounts: state.discounts.filter(discount => discount.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting discount:', error);
      throw error;
    }
  },
}));