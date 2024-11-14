export interface User {
  id: string;
  email: string;
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