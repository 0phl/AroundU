import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import { useBusinessStore } from '../stores/businessStore';
import { useDiscountStore } from '../stores/discountStore';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

// Add this constant
const DAYS_OF_WEEK = [
  'monday',
  'tuesday', 
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const;

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export default function BusinessDetails() {
  const { id } = useParams();
  const { businesses, loading: businessLoading, fetchBusinesses } = useBusinessStore();
  const { discounts, loading: discountLoading, fetchDiscounts } = useDiscountStore();
  const { user } = useAuth();
  
  // Add loading state tracking
  const loading = businessLoading || discountLoading;

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading business details for ID:', id);
        await Promise.all([
          fetchBusinesses(),
          fetchDiscounts()
        ]);
      } catch (error) {
        console.error('Error loading business details:', error);
      }
    };
    loadData();
  }, [id, fetchBusinesses, fetchDiscounts]);

  const business = businesses.find(b => b.id === id);
  console.log('Found business:', business);

  const activeDiscounts = discounts.filter(
    discount => 
      discount.businessId === id && 
      discount.status === 'active' && 
      new Date(discount.expiryDate) > new Date()
  );

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading business details...</span>
        </div>
      </div>
    );
  }

  // Show error state if business not found
  if (!business) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Business not found</h2>
          <p className="mt-2 text-gray-600">The business you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
        {business?.photos && business.photos.length > 0 && (
          <img
            src={business.photos[0]}
            alt={business.name}
            className="w-full h-48 object-cover"
          />
        )}
        
        <div className="px-4 py-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{business?.name}</h1>
              <p className="mt-1 text-sm text-gray-600">{business?.category}</p>
            </div>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-6 w-6 ${
                      i < business.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600">({business.reviewCount} reviews)</span>
            </div>
          </div>

          {/* Contact and Hours sections */}
          <div className="mt-4 space-y-3">
            <div>
              <h3 className="text-base font-medium text-gray-900">Contact Information</h3>
              <div className="mt-1 space-y-1">
                {business?.phone && (
                  <p className="text-sm text-gray-600">Phone: {business.phone}</p>
                )}
                {business?.email && (
                  <p className="text-sm text-gray-600">Email: {business.email}</p>
                )}
                {business?.website && (
                  <p className="text-sm text-gray-600">
                    Website: <a href={business.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{business.website}</a>
                  </p>
                )}
                {business?.address && (
                  <p className="text-sm text-gray-600">Address: {business.address}</p>
                )}
              </div>
            </div>

            {/* Business Hours */}
            {business?.hours && (
              <div>
                <h3 className="text-base font-medium text-gray-900">Business Hours</h3>
                <div className="mt-1 space-y-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const hours = business.hours[day];
                    return (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="capitalize text-gray-600 w-24">{day}</span>
                        <span className="text-gray-900">
                          {hours.isClosed ? (
                            'Closed'
                          ) : (
                            `${formatTime(hours.open)} - ${formatTime(hours.close)}`
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Discounts Section - Updated Layout */}
      {activeDiscounts.length > 0 && (
        <div className="mt-6 mb-20">
          <h2 className="text-lg font-semibold mb-4">Current Discounts</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeDiscounts.map(discount => (
              <div 
                key={discount.id} 
                className="bg-blue-50 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900">{discount.title}</h3>
                    <p className="text-sm text-blue-700 mt-1">{discount.description}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 ml-2">
                    {discount.discountValue}% OFF
                  </span>
                </div>
                {user ? (
                  <div className="mt-3">
                    <p className="text-xs text-blue-700">
                      Valid until {format(new Date(discount.expiryDate), 'PP')}
                    </p>
                    {discount.terms && (
                      <p className="text-xs text-blue-700 mt-2">
                        Terms: {discount.terms}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-blue-700">
                    <Link to="/login" className="font-medium hover:text-blue-900">
                      Sign in
                    </Link> to view full discount details
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}