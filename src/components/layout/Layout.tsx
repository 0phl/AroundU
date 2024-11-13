import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useBusinessStore } from '../../stores/businessStore';
import { useDiscountStore } from '../../stores/discountStore';
import MainLayout from '../MainLayout';

export default function Layout() {
  const { fetchBusinesses } = useBusinessStore();
  const { fetchDiscounts } = useDiscountStore();

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchBusinesses(),
          fetchDiscounts()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, []); // Empty dependency array to run only once on mount

  return <MainLayout><Outlet /></MainLayout>;
}