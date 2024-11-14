import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-semibold text-gray-900">Profile</h1>
          <div className="mt-4 space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Name:</span> {user?.firstName} {user?.lastName}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            {user?.studentId && (
              <p className="text-gray-600">
                <span className="font-medium">Student ID:</span> {user.studentId}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}