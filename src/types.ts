export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  studentId?: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  photos: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  hours: {
    monday: { open: string; close: string; isClosed?: boolean };
    tuesday: { open: string; close: string; isClosed?: boolean };
    wednesday: { open: string; close: string; isClosed?: boolean };
    thursday: { open: string; close: string; isClosed?: boolean };
    friday: { open: string; close: string; isClosed?: boolean };
    saturday: { open: string; close: string; isClosed?: boolean };
    sunday: { open: string; close: string; isClosed?: boolean };
  };
  searchTerms: string[];
  // Add other business fields as needed
}

export interface Discount {
  id: string;
  title: string;
  description: string;
  businessId: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  status: 'active' | 'inactive' | 'expired';
  expiryDate: Date | string;
  terms?: string;
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
  expiresAt?: Date | null;
  readBy: string[]; // Array of user IDs who have read this alert
}