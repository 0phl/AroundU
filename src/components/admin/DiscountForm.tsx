import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useBusinessStore } from '../../stores/businessStore';
import type { Discount } from '../../types';

interface DiscountFormProps {
  onSubmit: (data: Partial<Discount>) => void;
  onCancel: () => void;
  initialData?: Discount;
}

export default function DiscountForm({ onSubmit, onCancel, initialData }: DiscountFormProps) {
  const { businesses } = useBusinessStore();
  const { register, handleSubmit, formState: { errors }, control } = useForm({
    defaultValues: {
      ...(initialData || {
        title: '',
        description: '',
        businessId: '',
        discountType: 'percentage',
        discountValue: '',
        expiryDate: '',
        terms: '',
        status: 'active'
      }),
      expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().slice(0, 16) : ''
    }
  });

  const handleFormSubmit = (data: any) => {
    // Combine date and time before submitting
    const formData = {
      ...data,
      expiryDate: new Date(data.expiryDate)
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="businessId" className="block text-sm font-medium text-gray-700">
          Select Business
        </label>
        <select
          {...register('businessId', { required: 'Business is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">
            Discount Type
          </label>
          <select
            {...register('discountType', { required: 'Discount type is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Expiry Date and Time
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryDate" className="block text-xs text-gray-500 mb-1">
              Date
            </label>
            <Controller
              name="expiryDate"
              control={control}
              rules={{ required: 'Expiry date is required' }}
              render={({ field }) => (
                <input
                  type="date"
                  value={field.value ? field.value.split('T')[0] : ''}
                  onChange={(e) => {
                    const time = field.value ? field.value.split('T')[1] : '00:00';
                    field.onChange(`${e.target.value}T${time}`);
                  }}
                  className="block w-full px-3 py-2 text-base border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              )}
            />
          </div>
          <div>
            <label htmlFor="expiryTime" className="block text-xs text-gray-500 mb-1">
              Time
            </label>
            <Controller
              name="expiryDate"
              control={control}
              render={({ field }) => (
                <input
                  type="time"
                  value={field.value ? field.value.split('T')[1]?.slice(0, 5) : ''}
                  onChange={(e) => {
                    const date = field.value ? field.value.split('T')[0] : new Date().toISOString().split('T')[0];
                    field.onChange(`${date}T${e.target.value}`);
                  }}
                  className="block w-full px-3 py-2 text-base border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              )}
            />
          </div>
        </div>
        {errors.expiryDate && (
          <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
          Terms and Conditions
        </label>
        <textarea
          {...register('terms', { required: 'Terms are required' })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.terms && (
          <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          {...register('status', { required: 'Status is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {initialData ? 'Update' : 'Create'} Discount
        </button>
      </div>
    </form>
  );
}