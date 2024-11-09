import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useDiscountStore } from '../../stores/discountStore';
import DiscountForm from '../../components/admin/DiscountForm';
import type { Discount } from '../../types';
import { format } from 'date-fns';

export default function DiscountManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const { discounts, addDiscount, updateDiscount, deleteDiscount } = useDiscountStore();

  const handleSubmit = (discountData: Partial<Discount>) => {
    if (editingDiscount) {
      updateDiscount(editingDiscount.id, discountData);
    } else {
      addDiscount({
        ...discountData,
        id: Math.random().toString(36).substr(2, 9)
      } as Discount);
    }
    setShowForm(false);
    setEditingDiscount(null);
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      deleteDiscount(id);
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
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Discounts</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all discounts and promotions
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
          >
            <PlusIcon className="h-5 w-5 inline-block mr-2" />
            Add Discount
          </button>
        </div>
      </div>
      
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Code</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Discount</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Valid Until</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {discounts.map((discount) => (
                  <tr key={discount.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      {discount.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {discount.code}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {discount.percentage}%
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {format(new Date(discount.validUntil), 'PP')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        discount.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : discount.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {discount.status}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}