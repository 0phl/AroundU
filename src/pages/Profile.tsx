import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-semibold text-gray-900">Profile</h1>
          <div className="mt-4">
            <p className="text-gray-600">Email: {user?.email}</p>
            <p className="text-gray-600">Name: {user?.displayName}</p>
            {user?.studentId && (
              <p className="text-gray-600">Student ID: {user.studentId}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}