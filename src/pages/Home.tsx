import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Search Bar */}
      <div className="px-4 py-3 bg-blue-600">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search for cafes, shops, services..."
            className="w-full px-4 py-2 rounded-full border-none focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>
      </div>

      {/* Featured Promotions */}
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

      {/* Nearby Businesses */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Nearby Businesses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <h3 className="font-semibold">Cafe Latte</h3>
              <div className="flex items-center mt-1">
                <div className="flex text-yellow-400">
                  {'★★★★☆'}
                </div>
                <span className="text-sm text-gray-600 ml-2">(42)</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">0.3 miles away</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <h3 className="font-semibold">PageTurner's</h3>
              <div className="flex items-center mt-1">
                <div className="flex text-yellow-400">
                  {'★★★★★'}
                </div>
                <span className="text-sm text-gray-600 ml-2">(28)</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">0.5 miles away</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}