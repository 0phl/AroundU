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