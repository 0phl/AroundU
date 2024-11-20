import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBusinessStore } from '../stores/businessStore';
import { StarIcon } from '@heroicons/react/24/solid';
import { useState, useMemo } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { Business } from '../types';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useDiscountStore } from '../stores/discountStore';
import { format } from 'date-fns';
import { MapPinIcon } from '@heroicons/react/24/outline';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

export default function Home() {
  const { businesses, loading: businessLoading, fetchBusinesses } = useBusinessStore();
  const { discounts, loading: discountLoading, fetchDiscounts } = useDiscountStore();
  const [searchQuery, setSearchQuery] = useState('');
  const center = { lat: 14.458942866502959, lng: 120.96075553643246 }; // SDCA coordinates
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        await Promise.all([
          fetchDiscounts(),
          fetchBusinesses()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again later.');
      }
    };
    loadData();
  }, [fetchDiscounts, fetchBusinesses]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  // Separate the search results and nearby businesses
  const { searchResults, nearbyBusinesses } = useMemo(() => {
    const businessesWithDistance = businesses.map(business => ({
      ...business,
      distance: calculateDistance(
        center.lat,
        center.lng,
        business.coordinates.lat,
        business.coordinates.lng
      )
    }));

    // Filter for search results (all businesses that match the query)
    const searchResults = searchQuery
      ? businessesWithDistance
          .filter(business => {
            const query = searchQuery.toLowerCase();
            return (
              business.name.toLowerCase().includes(query) ||
              business.category.toLowerCase().includes(query) ||
              business.description?.toLowerCase().includes(query) ||
              (business.searchTerms && business.searchTerms.some(term => 
                term.toLowerCase().includes(query)
              ))
            );
          })
          .sort((a, b) => a.distance - b.distance)
      : [];

    // Filter for nearby businesses (within 2km)
    const nearbyBusinesses = businessesWithDistance
      .filter(business => business.distance <= 2)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);

    return { searchResults, nearbyBusinesses };
  }, [businesses, searchQuery, center]);

  // Get featured promotions (active discounts with highest discount values)
  const featuredPromotions = discounts
    .filter(discount => 
      discount.status === 'active' && 
      new Date(discount.expiryDate) > new Date()
    )
    .sort((a, b) => b.discountValue - a.discountValue)
    .slice(0, 2); // Get top 2 promotions

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Add loading check
  if (businessLoading || discountLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Search Bar */}
      <div className="px-4 py-3 bg-blue-600">
        <div className="relative max-w-2xl mx-auto">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search for cafes, shops, services..."
              className="w-full pl-10 pr-4 py-2 rounded-full border-none focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="px-4 py-6">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {searchResults.length > 0 ? (
              searchResults.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No businesses found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Featured Promotions */}
      {!searchQuery && featuredPromotions.length > 0 && (
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold mb-3">Featured Promotions</h2>
          <div className="space-y-2">
            {featuredPromotions.map(promotion => {
              const business = businesses.find(b => b.id === promotion.businessId);
              if (!business) return null;

              return (
                <div
                  key={promotion.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <img 
                          src={business.photos?.[0]} 
                          alt={business.name}
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {promotion.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {business.name}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                        {promotion.discountValue}% OFF
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-gray-500">
                        Valid until {format(new Date(promotion.expiryDate), 'PP')}
                      </p>
                      <Link
                        to={`/businesses/${promotion.businessId}`}
                        className="inline-flex items-center justify-center px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors duration-200"
                      >
                        Get Discount
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nearby Businesses */}
      {!searchQuery && (
        <div className="px-4 py-6">
          <div className="relative mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Nearby Places</h2>
              <p className="mt-1 text-sm text-gray-600">Discover local businesses around you</p>
            </div>
            <Link 
              to="/map" 
              className="absolute -top-1 right-0 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              view all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
            {nearbyBusinesses.length > 0 ? (
              nearbyBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No nearby businesses found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Separate BusinessCard component for reusability
function BusinessCard({ business }: { business: Business & { distance: number } }) {
  return (
    <Link
      to={`/businesses/${business.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      {business.photos && business.photos.length > 0 && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={business.photos[0]}
            alt={business.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="font-semibold text-white text-lg">{business.name}</h3>
            <p className="text-white/90 text-sm">{business.category}</p>
          </div>
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center mt-1">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < business.rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            ({business.reviewCount})
          </span>
        </div>
        {business.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {business.description}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-600">
            {business.distance.toFixed(1)} km away
          </span>
          <span className="text-sm text-blue-600 group-hover:translate-x-1 transition-transform duration-200">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}