import { create } from 'zustand';
import type { Analytics } from '../types';

interface AnalyticsStore {
  data: Analytics;
  updateData: (newData: Partial<Analytics>) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  data: {
    users: {
      total: 150,
      active: 120,
      newThisMonth: 25
    },
    businesses: {
      total: 45,
      active: 40,
      averageRating: 4.2
    },
    discounts: {
      active: 15,
      expired: 30,
      redemptions: 250
    },
    events: {
      upcoming: 8,
      past: 24,
      totalAttendees: 850
    }
  },
  updateData: (newData) =>
    set((state) => ({
      data: { ...state.data, ...newData }
    }))
}));