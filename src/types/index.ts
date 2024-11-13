export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  studentId?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive';
}

export interface Business {
  id: string;
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
  website?: string;
  hours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  photos: string[];
  rating: number;
  reviewCount: number;
  discounts: Discount[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: Date;
}

export interface Discount {
  id: string;
  title: string;
  description: string;
  businessId: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: Date;
  terms: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive';
  targetAudience: 'all' | 'students' | 'businesses';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface Analytics {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  businesses: {
    total: number;
    active: number;
    averageRating: number;
  };
  discounts: {
    active: number;
    expired: number;
    redemptions: number;
  };
  events: {
    upcoming: number;
    past: number;
    totalAttendees: number;
  };
}