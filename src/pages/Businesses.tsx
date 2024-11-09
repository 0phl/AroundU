import React from 'react';
import { Link } from 'react-router-dom';
import { useBusinessStore } from '../stores/businessStore';
import { StarIcon } from '@heroicons/react/24/solid';

export default function Businesses() {
  const { businesses } = useBusinessStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold text-gray-900">Local Businesses</h1>
          <p className="mt-2 text-sm text-gray-700">
            Discover businesses around St. Dominic College of Asia
          </p>
        </div>
      </div>
      
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => (
          <Link
            key={business.id}
            to={`/businesses/${business.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {business.photos && business.photos.length > 0 && (
              <img
                src={business.photos[0]}
                alt={business.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
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
          </Link>
        ))}
      </div>
    </div>
  );
}