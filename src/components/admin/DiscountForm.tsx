import React, { useState } from 'react';
import type { Discount } from '../../types';
import { useBusinessStore } from '../../stores/businessStore';

interface DiscountFormProps {
  onSubmit: (discount: Partial<Discount>) => void;
  initialData?: Partial<Discount>;
  onCancel: () => void;
}

export default function DiscountForm({ onSubmit, initialData, onCancel }: DiscountFormProps) {
  const { businesses } = useBusinessStore();
  const [formData, setFormData] = useState({
    businessId: initialData?.businessId || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    code: initialData?.code || '',
    percentage: initialData?.percentage || 0,
    validFrom: initialData?.validFrom ? new Date(initialData.validFrom).toISOString().slice(0, 16) : '',
    validUntil: initialData?.validUntil ? new Date(initialData.validUntil).toISOString().slice(0, 16) : '',
    terms: initialData?.terms || '',
    status: initialData?.status || 'draft'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      validFrom: new Date(formData.validFrom),
      validUntil: new Date(formData.validUntil),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="businessId" className="block text-sm font-medium text-gray-700">
          Business
        </label>
        <select
          id="businessId"
          value={formData.businessId}
          onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        >
          <option value="">Select a business</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Discount Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Discount Code
          </label>
          <input
            type="text"
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="percentage" className="block text-sm font-medium text-gray-700">
            Discount Percentage
          </label>
          <input
            type="number"
            id="percentage"
            value={formData.percentage}
            onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            min="0"
            max="100"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700">
            Valid From
          </label>
          <input
            type="datetime-local"
            id="validFrom"
            value={formData.validFrom}
            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">
            Valid Until
          </label>
          <input
            type="datetime-local"
            id="validUntil"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
          Terms and Conditions
        </label>
        <textarea
          id="terms"
          value={formData.terms}
          onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          rows={3}
          required
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as Discount['status'] })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="flex justify-end space-x-4">
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