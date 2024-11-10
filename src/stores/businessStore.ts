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
      name: "Academix Cafe",
      description: "Serving premium coffee and delicious pastries in a comfortable atmosphere.",
      category: "Cafe",
      address: "Bacoor Cavite",
      coordinates: {
        lat: 14.459629654857343,
        lng: 120.95991312108939
      },
      phone: "09873238779",
      email: "Academixcafe@gmail.com",
      website: "https://www.facebook.com/profile.php?id=61560927264886",
      hours: {
        monday: { open: "07:00", close: "22:00" },
        tuesday: { open: "07:00", close: "22:00" },
        wednesday: { open: "07:00", close: "22:00" },
        thursday: { open: "07:00", close: "22:00" },
        friday: { open: "07:00", close: "23:00" },
        saturday: { open: "08:00", close: "23:00" },
        sunday: { open: "08:00", close: "21:00" }
      },
      photos: ["https://scontent.fmnl9-1.fna.fbcdn.net/v/t1.15752-9/466346909_947704380552012_7049264752535150298_n.png?stp=dst-png_s2048x2048&_nc_cat=108&ccb=1-7&_nc_sid=9f807c&_nc_ohc=lbgLYQMOZ54Q7kNvgGa2i2H&_nc_zt=23&_nc_ht=scontent.fmnl9-1.fna&oh=03_Q7cD1QHu3JlHGXvX7SXA4eE_6KawtO4pofSCwDV0vfqqoGTq0Q&oe=6758437B"],
      rating: 4.5,
      reviewCount: 42,
      discounts: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: "Samgyup sa Bahay",
      description: "Welcome! to the first and original samgyupsal delivery in the country. Experience the taste of korean samgyupsal at home. Hassle free and no more long queues!",
      category: "Restaurant",
      address: "Molino Boulevard, Niog III, Bacoor, Cavite (Beside Unioil & Foton Dealership)",
      coordinates: {
        lat: 14.447507018952042,
        lng: 120.9629706118365 
      },
      phone: "09213248452",
      email: "samgsabahay@gmail.com",
      website: "https://www.facebook.com/samgyupsabahaymolinoblvd",
      hours: {
        monday: { open: "09:00", close: "21:00" },
        tuesday: { open: "09:00", close: "21:00" },
        wednesday: { open: "09:00", close: "21:00" },
        thursday: { open: "09:00", close: "21:00" },
        friday: { open: "09:00", close: "22:00" },
        saturday: { open: "10:00", close: "22:00" },
        sunday: { open: "10:00", close: "20:00" }
      },
      photos: ["https://scontent.fmnl9-4.fna.fbcdn.net/v/t39.30808-6/438241358_122152138196045408_1671828186316637288_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=ucLqs9n-TxAQ7kNvgHyA_9W&_nc_zt=23&_nc_ht=scontent.fmnl9-4.fna&_nc_gid=Aru83L4PFWnqlJoEaUOLaxo&oh=00_AYBf9LeOyWzwDY3kEArcXa_r1MxmVrplPWXrxk-j8Ki-0Q&oe=6736A1B6"],
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