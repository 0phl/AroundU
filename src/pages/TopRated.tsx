import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useBusinessStore } from '../stores/businessStore';

export default function TopRated() {
  const { businesses } = useBusinessStore();

  // Filter and sort businesses by rating
  const topRatedBusinesses = businesses
    .slice() // Create a copy to avoid mutating original array
    .sort((a, b) => {
      // Sort by rating first
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      // If ratings are equal, sort by number of reviews
      return b.reviewCount - a.reviewCount;
    })
    .slice(0, 3); // Get top 3 businesses

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold">Top Rated Places</h1>
          <p className="mt-2 text-sm text-gray-700">
            Highest rated businesses around SDCA
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link 
            to="/map" 
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All on Map →
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-20">
        {topRatedBusinesses.length > 0 ? (
          topRatedBusinesses.map((business) => (
            <Link 
              key={business.id}
              to={`/businesses/${business.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-auto"
            >
              {business.photos && business.photos.length > 0 && (
                <img
                  src={business.photos[0]}
                  alt={business.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{business.name}</h2>
                  <p className="text-sm text-gray-600">{business.category}</p>
                  <div className="flex items-center mt-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-5 w-5 ${
                            i < business.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      ({business.reviewCount} reviews)
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {business.description}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-gray-500">
            No businesses found
          </div>
        )}
      </div>
    </div>
  );
}