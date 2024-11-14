import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import type { User } from '../../types';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'user' ? 'admin' : 'user';
    
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date()
      });
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole, updatedAt: new Date() } : u
      ));
      
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

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

      {/* Desktop View */}
      <div className="hidden md:block mt-8">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Student ID</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="relative py-3.5 pl-3 pr-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {user.studentId || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleRoleUpdate(user.id, user.role)}
                      className={`${
                        user.role === 'admin' 
                          ? 'text-purple-600 hover:text-purple-900' 
                          : 'text-blue-600 hover:text-blue-900'
                      } mr-4`}
                    >
                      Make {user.role === 'admin' ? 'User' : 'Admin'}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden mt-8">
        {users.map((user) => (
          <div key={user.id} className="bg-white shadow rounded-lg mb-4 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{user.email}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Role: <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>{user.role}</span>
                </p>
                {user.studentId && (
                  <p className="text-sm text-gray-500 mt-1">
                    Student ID: {user.studentId}
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleRoleUpdate(user.id, user.role)}
                  className={`text-sm ${
                    user.role === 'admin' 
                      ? 'text-purple-600 hover:text-purple-900' 
                      : 'text-blue-600 hover:text-blue-900'
                  }`}
                >
                  Make {user.role === 'admin' ? 'User' : 'Admin'}
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-sm text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}