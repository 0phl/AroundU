import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import { useBusinessStore } from '../stores/businessStore';
import { useDiscountStore } from '../stores/discountStore';
import { useReviewStore } from '../stores/reviewStore';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import type { Business } from '../types';

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
  const { fetchBusiness } = useBusinessStore();
  const { discounts, loading: discountLoading, fetchDiscounts } = useDiscountStore();
  const { loading: reviewLoading, error: reviewError, fetchReviews, clearError } = useReviewStore();
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('Business ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Loading business details for ID:', id);
        setLoading(true);
        setError(null);
        clearError(); // Clear any previous review errors

        const businessData = await fetchBusiness(id);
        if (!businessData) {
          setError('Business not found');
          return;
        }

        setBusiness(businessData);
        
        // Fetch discounts and reviews in parallel
        await Promise.all([
          fetchDiscounts(),
          fetchReviews(id)
        ]);
      } catch (error) {
        console.error('Error loading business details:', error);
        setError('Failed to load business details');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, fetchBusiness, fetchDiscounts, fetchReviews, clearError]);

  const activeDiscounts = discounts.filter(
    discount => 
      discount.businessId === id && 
      discount.status === 'active' && 
      new Date(discount.expiryDate) > new Date()
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading business details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Business not found</h2>
          <p className="mt-2 text-gray-600">The business you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 pb-20">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
        {business.photos && business.photos.length > 0 && (
          <div className="relative w-full h-48 sm:h-64 lg:h-72">
            <img
              src={business.photos[0]}
              alt={business.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-sm sm:text-base text-gray-600">{business.description}</p>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
              <div className="flex items-center">
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  {business.rating.toFixed(1)}
                </span>
                <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 ml-1" />
              </div>
              <p className="text-xs sm:text-sm text-gray-500">{business.reviewCount} reviews</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex items-start space-x-2">
                  <span className="font-medium min-w-[4.5rem]">Address:</span>
                  <span className="text-gray-600 flex-1">{business.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium min-w-[4.5rem]">Phone:</span>
                  <a href={`tel:${business.phone}`} className="text-blue-600 hover:text-blue-800 flex-1">
                    {business.phone}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium min-w-[4.5rem]">Email:</span>
                  <a href={`mailto:${business.email}`} className="text-blue-600 hover:text-blue-800 flex-1 break-all">
                    {business.email}
                  </a>
                </div>
                {business.website && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium min-w-[4.5rem]">Website:</span>
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex-1 break-all"
                    >
                      {business.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Business Hours</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 text-sm sm:text-base">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="capitalize font-medium">{day}</span>
                    <span className="text-gray-600">
                      {formatTime(business.hours[day].open)} - {formatTime(business.hours[day].close)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {activeDiscounts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Discounts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeDiscounts.map((discount) => (
                  <div
                    key={discount.id}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100"
                  >
                    <div className="text-lg font-semibold text-blue-900">{discount.title}</div>
                    <p className="text-sm text-gray-600 mt-1">{discount.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Expires: {format(new Date(discount.expiryDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Reviews</h2>
            {user && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Write a Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="mb-6">
              <ReviewForm
                businessId={id!}
                onSuccess={() => {
                  setShowReviewForm(false);
                  fetchReviews(id!);
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          <ReviewList businessId={id!} />
        </div>
      </div>
    </div>
  );
}