import React from 'react';
import { useParams } from 'react-router-dom';
import { useBusinessStore } from '../stores/businessStore';
import { useDiscountStore } from '../stores/discountStore';
import { StarIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

export default function BusinessDetails() {
  const { id } = useParams();
  const { businesses } = useBusinessStore();
  const { discounts } = useDiscountStore();
  const { user } = useAuth();
  const business = businesses.find(b => b.id === id);

  const activeDiscounts = discounts.filter(
    discount => 
      discount.businessId === id && 
      discount.status === 'active' && 
      new Date(discount.expiryDate) > new Date()
  );

  if (!business) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Business not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {business.photos && business.photos.length > 0 && (
          <img
            src={business.photos[0]}
            alt={business.name}
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{business.name}</h1>
              <p className="text-gray-600 mt-1">{business.category}</p>
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

          <p className="mt-4 text-gray-700">{business.description}</p>

          {activeDiscounts.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Current Discounts</h2>
              <div className="space-y-4">
                {activeDiscounts.map(discount => (
                  <div key={discount.id} className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-blue-900">{discount.title}</h3>
                        <p className="text-blue-700">{discount.description}</p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {discount.percentage}% OFF
                      </span>
                    </div>
                    {user ? (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-blue-900">Use code: <span className="font-mono">{discount.code}</span></p>
                        <p className="text-sm text-blue-700 mt-1">Valid until {format(new Date(discount.validUntil), 'PP')}</p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-blue-700">
                        <a href="/login" className="font-medium hover:text-blue-900">Sign in</a> to view discount code
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="flex items-center text-gray-600">
              <MapPinIcon className="h-5 w-5 mr-2" />
              {business.address}
            </div>
            <div className="flex items-center text-gray-600">
              <PhoneIcon className="h-5 w-5 mr-2" />
              {business.phone}
            </div>
            <div className="flex items-center text-gray-600">
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              {business.email}
            </div>
            {business.website && (
              <div className="flex items-center text-gray-600">
                <GlobeAltIcon className="h-5 w-5 mr-2" />
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {business.website}
                </a>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Business Hours</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(business.hours).map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <span className="capitalize">{day}</span>
                  <span>{hours.open} - {hours.close}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}