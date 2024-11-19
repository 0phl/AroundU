import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useBusinessStore } from '../../stores/businessStore';
import BusinessForm from '../../components/admin/BusinessForm';
import type { Business } from '../../types';
import { generateSearchTerms } from '../../utils/searchUtils';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/admin/ConfirmationModal';

export default function BusinessManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const { businesses, loading, fetchBusinesses, addBusiness, updateBusiness, deleteBusiness } = useBusinessStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleSubmit = async (businessData: Partial<Business>) => {
    try {
      const searchTerms = generateSearchTerms({
        name: businessData.name!,
        category: businessData.category!,
        description: businessData.description
      });

      const businessWithSearchTerms = {
        ...businessData,
        searchTerms,
        updatedAt: new Date()
      };

      if (editingBusiness) {
        await updateBusiness(editingBusiness.id, businessWithSearchTerms);
      } else {
        await addBusiness({
          ...businessWithSearchTerms,
          createdAt: new Date()
        } as Omit<Business, 'id'>);
      }
      setShowForm(false);
      setEditingBusiness(null);
    } catch (error) {
      console.error('Error saving business:', error);
      toast.error('Error saving business. Please try again.');
    }
  };

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setBusinessToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (businessToDelete) {
      try {
        await deleteBusiness(businessToDelete);
        toast.success('Business deleted successfully');
      } catch (error) {
        console.error('Error deleting business:', error);
        toast.error('Failed to delete business');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">
            {editingBusiness ? 'Edit' : 'Add'} Business
          </h2>
          <BusinessForm
            onSubmit={handleSubmit}
            initialData={editingBusiness || undefined}
            onCancel={() => {
              setShowForm(false);
              setEditingBusiness(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Businesses</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage all registered businesses in the system
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
            >
              <PlusIcon className="h-5 w-5 inline-block mr-2" />
              Add Business
            </button>
          </div>
        </div>

        <div className="mt-8 md:hidden">
          {businesses.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No businesses found</div>
          ) : (
            <div className="space-y-4">
              {businesses.map((business) => (
                <div key={business.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={business.photos[0]}
                      alt={business.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {business.name}
                      </p>
                      <p className="text-sm text-gray-500">{business.category}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500">Rating: {business.rating}</span>
                        <span className="mx-2">•</span>
                        <span className="text-sm text-gray-500">{business.reviewCount} reviews</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => handleEdit(business)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(business.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden md:block mt-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Image</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rating</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reviews</th>
                  <th className="relative py-3.5 pl-3 pr-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {businesses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      No businesses found
                    </td>
                  </tr>
                ) : (
                  businesses.map((business) => (
                    <tr key={business.id}>
                      <td className="py-4 pl-4 pr-3">
                        <img
                          src={business.photos[0]}
                          alt={business.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {business.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {business.category}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {business.rating}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {business.reviewCount}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(business)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(business.id)}
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

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setBusinessToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Business"
        message="Are you sure you want to delete this business? This action cannot be undone."
      />
    </>
  );
}