import React from 'react';
import { Link } from 'react-router-dom';
import { useBusinessStore } from '../stores/businessStore';
import { StarIcon } from '@heroicons/react/24/solid';
import { useState, useMemo } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { Business } from '../types';

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
  const { businesses } = useBusinessStore();
  const [searchQuery, setSearchQuery] = useState('');
  const center = { lat: 14.458942866502959, lng: 120.96075553643246 }; // SDCA coordinates

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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
      {!searchQuery && (
        <div className="px-4 py-6">
          <h2 className="text-xl font-semibold mb-4">Featured Promotions</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold">Student Night at Cafe Latte</h3>
              <p className="text-sm text-gray-600 mt-1">20% off all drinks from 6PM - 9PM</p>
              <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-full text-sm">
                Get Discount
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold">Book Fair at PageTurner's</h3>
              <p className="text-sm text-gray-600 mt-1">Buy 2 books, get 1 free this weekend!</p>
              <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-full text-sm">
                Learn More
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nearby Businesses */}
      {!searchQuery && (
        <div className="px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Nearby Businesses</h2>
            <Link 
              to="/map" 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All on Map
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nearbyBusinesses.length > 0 ? (
              nearbyBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
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
      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-duration-300"
    >
      {business.photos && business.photos.length > 0 && (
        <div className="h-48 bg-gray-200">
          <img
            src={business.photos[0]}
            alt={business.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold">{business.name}</h3>
        <p className="text-sm text-gray-600">{business.category}</p>
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
        <p className="text-sm text-gray-600 mt-1">
          {business.distance.toFixed(1)} km away
        </p>
      </div>
    </Link>
  );
}