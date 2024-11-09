import { create } from 'zustand';
import type { User } from '../types';

interface UserStore {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [
    {
      id: '1',
      email: 'admin@aroundu.com',
      displayName: 'Admin User',
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      email: 'student@aroundu.com',
      displayName: 'John Student',
      role: 'user',
      studentId: 'STU123',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user]
    })),
  updateUser: (id, updatedUser) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id
          ? { ...user, ...updatedUser, updatedAt: new Date() }
          : user
      )
    })),
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id)
    }))
}));