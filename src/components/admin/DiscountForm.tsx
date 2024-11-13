import React from 'react';
import { useForm } from 'react-hook-form';
import { useBusinessStore } from '../../stores/businessStore';
import type { Discount } from '../../types';

interface DiscountFormProps {
  onSubmit: (data: Partial<Discount>) => void;
  onCancel: () => void;
  initialData?: Discount;
}

export default function DiscountForm({ onSubmit, onCancel, initialData }: DiscountFormProps) {
  const { businesses } = useBusinessStore();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      businessId: '',
      discountType: 'percentage',
      discountValue: '',
      expiryDate: '',
      terms: '',
      status: 'active'
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="businessId" className="block text-sm font-medium text-gray-700">
          Select Business
        </label>
        <select
          {...register('businessId', { required: 'Business is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a business</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
        {errors.businessId && (
          <p className="mt-1 text-sm text-red-600">{errors.businessId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          {...register('title', { required: 'Title is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">
            Discount Type
          </label>
          <select
            {...register('discountType', { required: 'Discount type is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>

        <div>
          <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">
            Discount Value
          </label>
          <input
            type="number"
            {...register('discountValue', { 
              required: 'Discount value is required',
              min: { value: 0, message: 'Value must be positive' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
          Expiry Date
        </label>
        <input
          type="datetime-local"
          {...register('expiryDate', { required: 'Expiry date is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
          Terms and Conditions
        </label>
        <textarea
          {...register('terms', { required: 'Terms are required' })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          {...register('status', { required: 'Status is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {initialData ? 'Update' : 'Create'} Discount
        </button>
      </div>
    </form>
  );
}