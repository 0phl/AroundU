import React, { useEffect } from 'react';
import { useDiscountStore } from '../stores/discountStore';
import { useBusinessStore } from '../stores/businessStore';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

export default function Discounts() {
  const { discounts, fetchDiscounts } = useDiscountStore();
  const { businesses } = useBusinessStore();
  const { user } = useAuth();

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const activeDiscounts = discounts.filter(
    discount => 
      discount.status === 'active' && 
      new Date(discount.expiryDate) > new Date()
  );

  const getBusiness = (businessId: string) => {
    return businesses.find(b => b.id === businessId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold text-gray-900">Student Discounts</h1>
          <p className="mt-2 text-sm text-gray-700">
            Exclusive discounts for St. Dominic College of Asia students
          </p>
        </div>
      </div>
      
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                      <h3 className="text-xl font-semibold text-gray-900">{discount.title}</h3>
                      <p className="text-sm text-gray-600">{business.name}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
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
                        <a href="/login" className="font-medium hover:text-blue-800">
                          Sign in to view full discount details
                        </a>
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