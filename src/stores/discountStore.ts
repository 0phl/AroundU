import { create } from 'zustand';
import type { Discount } from '../types';
import { useBusinessStore } from './businessStore';

interface DiscountStore {
  discounts: Discount[];
  addDiscount: (discount: Discount) => void;
  updateDiscount: (id: string, discount: Partial<Discount>) => void;
  deleteDiscount: (id: string) => void;
}

export const useDiscountStore = create<DiscountStore>((set) => ({
  discounts: [
    {
      id: '1',
      businessId: '1',
      title: 'Student Night Special',
      description: '20% off on all items',
      code: 'STUDENT20',
      percentage: 20,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      terms: 'Valid student ID required. Cannot be combined with other offers.',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  addDiscount: (discount) => {
    // Update the business's discounts array
    const businessStore = useBusinessStore.getState();
    const business = businessStore.businesses.find(b => b.id === discount.businessId);
    if (business) {
      businessStore.updateBusiness(business.id, {
        discounts: [...business.discounts, discount]
      });
    }

    set((state) => ({
      discounts: [...state.discounts, discount]
    }));
  },
  updateDiscount: (id, updatedDiscount) => {
    set((state) => {
      const discount = state.discounts.find(d => d.id === id);
      if (!discount) return state;

      // Update the business's discounts array
      const businessStore = useBusinessStore.getState();
      const business = businessStore.businesses.find(b => b.id === discount.businessId);
      if (business) {
        const updatedBusinessDiscounts = business.discounts.map(d =>
          d.id === id ? { ...d, ...updatedDiscount } : d
        );
        businessStore.updateBusiness(business.id, {
          discounts: updatedBusinessDiscounts
        });
      }

      return {
        discounts: state.discounts.map((discount) =>
          discount.id === id
            ? { ...discount, ...updatedDiscount, updatedAt: new Date() }
            : discount
        )
      };
    });
  },
  deleteDiscount: (id) => {
    set((state) => {
      const discount = state.discounts.find(d => d.id === id);
      if (discount) {
        // Remove the discount from the business's discounts array
        const businessStore = useBusinessStore.getState();
        const business = businessStore.businesses.find(b => b.id === discount.businessId);
        if (business) {
          businessStore.updateBusiness(business.id, {
            discounts: business.discounts.filter(d => d.id !== id)
          });
        }
      }

      return {
        discounts: state.discounts.filter((discount) => discount.id !== id)
      };
    });
  }
}));