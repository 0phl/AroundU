import React, { useState } from 'react';
import { useUserStore } from '../../stores/userStore';
import { format } from 'date-fns';

export default function UserManagement() {
  const { users, updateUser, deleteUser } = useUserStore();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage system users and their roles
          </p>
        </div>
      </div>

      {/* Mobile View */}
      <div className="mt-8 md:hidden">
        {users.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No users found</div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900">{user.email}</h3>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-500">Role: {user.role}</p>
                      <p className="text-sm text-gray-500">
                        Joined: {format(new Date(user.createdAt), 'PP')}
                      </p>
                      {user.studentId && (
                        <p className="text-sm text-gray-500">Student ID: {user.studentId}</p>
                      )}
                    </div>
                    <div className="mt-3 flex justify-end space-x-3">
                      <button
                        onClick={() => handleRoleUpdate(user)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Change Role
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block mt-8">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Student ID</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Joined Date</th>
                <th className="relative py-3.5 pl-3 pr-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.role}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.studentId || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {format(new Date(user.createdAt), 'PP')}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleRoleUpdate(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Change Role
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}