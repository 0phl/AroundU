import React from 'react';
import { useForm } from 'react-hook-form';
import { useBusinessStore } from '../../stores/businessStore';
import type { Discount } from '../../types';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface DiscountFormProps {
  onSubmit: (data: Partial<Discount>) => void;
  onCancel: () => void;
  initialData?: Discount;
}

export default function DiscountForm({ onSubmit, onCancel, initialData }: DiscountFormProps) {
  const { businesses } = useBusinessStore();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      ...(initialData || {
        title: '',
        description: '',
        businessId: '',
        discountType: 'percentage',
        discountValue: '',
        expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
        expiryTime: initialData?.expiryDate ? new Date(initialData.expiryDate).toTimeString().slice(0, 5) : '',
        terms: '',
        status: 'active'
      })
    }
  });

  const handleFormSubmit = (data: any) => {
    const formData = {
      ...data,
      expiryDate: new Date(`${data.expiryDate}T${data.expiryTime || '00:00'}`)
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      {/* Business Selection */}
      <div className="space-y-1">
        <label htmlFor="businessId" className="block text-sm font-medium text-gray-700">
          Select Business
        </label>
        <select
          {...register('businessId', { required: 'Business is required' })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200"
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

      {/* Discount Title */}
      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Discount Title
        </label>
        <input
          type="text"
          {...register('title', { required: 'Title is required' })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200 resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Discount Type and Value */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">
            Discount Type
          </label>
          <select
            {...register('discountType')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">
            Discount Value
          </label>
          <input
            type="number"
            {...register('discountValue', { 
              required: 'Discount value is required',
              min: { value: 0, message: 'Value must be positive' },
              max: { value: 100, message: 'Maximum value is 100' }
            })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200"
          />
          {errors.discountValue && (
            <p className="mt-1 text-sm text-red-600">{errors.discountValue.message}</p>
          )}
        </div>
      </div>

      {/* Expiry Date & Time */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Expiration Date & Time
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryDate" className="block text-xs text-gray-500 mb-1">
              Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                {...register('expiryDate', { required: 'Expiry date is required' })}
                className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors duration-200 sm:text-sm"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div>
            <label htmlFor="expiryTime" className="block text-xs text-gray-500 mb-1">
              Time
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ClockIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="time"
                {...register('expiryTime')}
                className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 rounded-md
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors duration-200 sm:text-sm"
              />
            </div>
          </div>
        </div>
        {errors.expiryDate && (
          <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-1">
        <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
          Terms and Conditions
        </label>
        <textarea
          {...register('terms')}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200 resize-none"
        />
      </div>

      {/* Status */}
      <div className="space-y-1">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          {...register('status')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
          transition-colors duration-200 flex items-center justify-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md
          hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-colors duration-200 flex items-center justify-center"
        >
          {initialData ? 'Update' : 'Create'} Discount
        </button>
      </div>
    </form>
  );
}