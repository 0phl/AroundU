import { create } from 'zustand';
import type { Business } from '../types';
import { useDiscountStore } from './discountStore';

interface BusinessStore {
  businesses: Business[];
  addBusiness: (business: Business) => void;
  updateBusiness: (id: string, business: Partial<Business>) => void;
  deleteBusiness: (id: string) => void;
}

export const useBusinessStore = create<BusinessStore>((set) => ({
  businesses: [
    {
      id: '1',
      name: "Cafe Latte",
      description: "Serving premium coffee and delicious pastries in a comfortable atmosphere.",
      category: "Cafe",
      address: "123 College Ave",
      coordinates: {
        lat: 14.3280,
        lng: 120.9390
      },
      phone: "+1234567890",
      email: "info@cafelatte.com",
      website: "https://cafelatte.com",
      hours: {
        monday: { open: "07:00", close: "22:00" },
        tuesday: { open: "07:00", close: "22:00" },
        wednesday: { open: "07:00", close: "22:00" },
        thursday: { open: "07:00", close: "22:00" },
        friday: { open: "07:00", close: "23:00" },
        saturday: { open: "08:00", close: "23:00" },
        sunday: { open: "08:00", close: "21:00" }
      },
      photos: ["https://placehold.co/400x300"],
      rating: 4.5,
      reviewCount: 42,
      discounts: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: "PageTurner's",
      description: "Your favorite local bookstore with a great selection of books and cozy reading spaces.",
      category: "Bookstore",
      address: "456 University St",
      coordinates: {
        lat: 14.3300,
        lng: 120.9370
      },
      phone: "+1234567891",
      email: "info@pageturners.com",
      website: "https://pageturners.com",
      hours: {
        monday: { open: "09:00", close: "21:00" },
        tuesday: { open: "09:00", close: "21:00" },
        wednesday: { open: "09:00", close: "21:00" },
        thursday: { open: "09:00", close: "21:00" },
        friday: { open: "09:00", close: "22:00" },
        saturday: { open: "10:00", close: "22:00" },
        sunday: { open: "10:00", close: "20:00" }
      },
      photos: ["https://placehold.co/400x300"],
      rating: 5,
      reviewCount: 28,
      discounts: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  addBusiness: (business) =>
    set((state) => ({
      businesses: [...state.businesses, business]
    })),
  updateBusiness: (id, updatedBusiness) =>
    set((state) => ({
      businesses: state.businesses.map((business) =>
        business.id === id
          ? { ...business, ...updatedBusiness, updatedAt: new Date() }
          : business
      )
    })),
  deleteBusiness: (id) => {
    // Also delete associated discounts
    const discountStore = useDiscountStore.getState();
    const discountsToDelete = discountStore.discounts.filter(d => d.businessId === id);
    discountsToDelete.forEach(d => discountStore.deleteDiscount(d.id));

    set((state) => ({
      businesses: state.businesses.filter((business) => business.id !== id)
    }));
  }
}));