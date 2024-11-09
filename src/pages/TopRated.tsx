import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const topRatedBusinesses = [
  {
    id: 1,
    name: "PageTurner's",
    rating: 5,
    reviews: 28,
    category: "Bookstore",
    image: "https://placehold.co/400x300",
    description: "Your favorite local bookstore with a great selection of books and cozy reading spaces."
  },
  {
    id: 2,
    name: "Cafe Latte",
    rating: 4.5,
    reviews: 42,
    category: "Cafe",
    image: "https://placehold.co/400x300",
    description: "Serving premium coffee and delicious pastries in a comfortable atmosphere."
  },
  // Add more businesses as needed
];

export default function TopRated() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">Top Rated Places</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topRatedBusinesses.map((business) => (
          <Link 
            key={business.id}
            to={`/businesses/${business.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={business.image}
              alt={business.name}
              className="w-full h-48 object-cover"
            />
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
                  ({business.reviews} reviews)
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