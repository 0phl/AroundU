import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useDiscountStore } from '../../stores/discountStore';
import { useBusinessStore } from '../../stores/businessStore';
import DiscountForm from '../../components/admin/DiscountForm';
import type { Discount } from '../../types';
import { format } from 'date-fns';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { toast } from 'react-hot-toast';

export default function DiscountManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { discounts, loading, fetchDiscounts, addDiscount, updateDiscount, deleteDiscount } = useDiscountStore();
  const { businesses, fetchBusinesses } = useBusinessStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<string | null>(null);

  useEffect(() => {
    console.log('DiscountManagement mounted');
    let mounted = true;

    const loadData = async () => {
      try {
        console.log('Starting data load');
        setError(null);
        
        // Load businesses first
        console.log('Fetching businesses...');
        await fetchBusinesses();
        
        if (!mounted) return;
        
        // Then load discounts
        console.log('Fetching discounts...');
        await fetchDiscounts();
        
        if (!mounted) return;
        
        console.log('Data load complete');
      } catch (error) {
        console.error('Error in loadData:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to load data');
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [fetchDiscounts, fetchBusinesses]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading discounts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering with discounts:', discounts);
  console.log('Loading state:', loading);

  const getBusinessName = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    return business?.name || 'Unknown Business';
  };

  const handleSubmit = async (formData: Omit<Discount, 'id'>) => {
    try {
      // Add logging to check the discount data
      console.log('Submitting discount:', formData);
      
      // Ensure the status is set to 'active' by default if not specified
      const discountData = {
        ...formData,
        status: formData.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingDiscount) {
        await updateDiscount(editingDiscount.id, discountData);
        toast.success('Discount updated successfully');
      } else {
        await addDiscount(discountData);
        toast.success('Discount added successfully');
      }
      
      setShowForm(false);
      setEditingDiscount(null);
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.error('Failed to save discount');
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDiscountToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (discountToDelete) {
      try {
        await deleteDiscount(discountToDelete);
        toast.success('Discount deleted successfully');
      } catch (error) {
        console.error('Error deleting discount:', error);
        toast.error('Failed to delete discount');
      }
    }
  };

  if (showForm) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">
            {editingDiscount ? 'Edit' : 'Add'} Discount
          </h2>
          <DiscountForm
            onSubmit={handleSubmit}
            initialData={editingDiscount || undefined}
            onCancel={() => {
              setShowForm(false);
              setEditingDiscount(null);
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
            <h1 className="text-2xl font-semibold text-gray-900">Discounts</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage all discounts and promotions
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowForm(true)}
              className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
            >
              <PlusIcon className="h-5 w-5 inline-block mr-2" />
              Add Discount
            </button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="mt-8 md:hidden">
          {discounts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No discounts found</div>
          ) : (
            <div className="space-y-4">
              {discounts.map((discount) => (
                <div key={discount.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex flex-col">
                    <h3 className="text-base font-semibold text-gray-900">{discount.title}</h3>
                    <p className="text-sm text-gray-600">{getBusinessName(discount.businessId)}</p>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-500">{discount.description}</p>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500">
                          {discount.discountType}
                        </span>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {discount.discountValue}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Valid until: {format(new Date(discount.expiryDate), 'PP')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => handleEdit(discount)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(discount.id)}
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

        {/* Desktop View */}
        <div className="hidden md:block mt-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Business</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Value</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expiry</th>
                  <th className="relative py-3.5 pl-3 pr-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {discounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      No discounts found
                    </td>
                  </tr>
                ) : (
                  discounts.map((discount) => (
                    <tr key={discount.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {discount.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getBusinessName(discount.businessId)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {discount.discountType}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {discount.discountValue}%
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {discount.status}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {format(new Date(discount.expiryDate), 'PP')}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
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
          setDiscountToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Discount"
        message="Are you sure you want to delete this discount? This action cannot be undone."
      />
    </>
  );
}