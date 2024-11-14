import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDiscountStore } from '../stores/discountStore';
import { useBusinessStore } from '../stores/businessStore';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

export default function Discounts() {
  const { discounts, loading, fetchDiscounts } = useDiscountStore();
  const { businesses, fetchBusinesses } = useBusinessStore();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting to fetch data for Discounts page');
        await Promise.all([
          fetchDiscounts(),
          fetchBusinesses()
        ]);
        console.log('Raw discounts:', discounts);
        console.log('Raw businesses:', businesses);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [fetchDiscounts, fetchBusinesses]);

  // Modify the filter to properly check dates and add logging
  const activeDiscounts = discounts.filter(discount => {
    const expiryDate = new Date(discount.expiryDate);
    const now = new Date();
    
    // Add detailed logging for each discount
    console.log('Processing discount:', {
      id: discount.id,
      title: discount.title,
      businessId: discount.businessId,
      status: discount.status,
      expiryDate: expiryDate.toISOString(),
      currentDate: now.toISOString(),
      isActive: discount.status === 'active',
      notExpired: expiryDate > now
    });

    const isValid = discount.status === 'active' && expiryDate > now;
    console.log('Discount valid?', isValid);
    return isValid;
  });

  console.log('Filtered active discounts:', activeDiscounts);

  const getBusiness = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    console.log('Looking up business:', businessId, 'Found:', business?.name);
    return business;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold text-gray-900">Student Discounts</h1>
          <p className="mt-2 text-sm text-gray-700">
            Exclusive discounts for St. Dominic College of Asia students
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-20">
        {activeDiscounts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No active discounts available at the moment.
          </div>
        ) : (
          activeDiscounts.map((discount) => {
            const business = getBusiness(discount.businessId);
            if (!business) return null;

            return (
              <div
                key={discount.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {business.photos?.[0] && (
                  <img
                    src={business.photos[0]}
                    alt={business.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {discount.title}
                      </h3>
                      <p className="text-sm text-gray-600">{business.name}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {discount.discountValue}% OFF
                    </span>
                  </div>
                  
                  <p className="mt-3 text-gray-600">{discount.description}</p>
                  
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-500">
                      Valid until: {format(new Date(discount.expiryDate), 'PPP')}
                    </p>
                    {user ? (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm font-medium text-blue-900">Terms & Conditions:</p>
                        <p className="text-sm text-blue-700 mt-1">{discount.terms}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-blue-600">
                        <Link to="/login" className="font-medium hover:text-blue-800">
                          Sign in to view full discount details
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}