import React, { useState } from 'react';
import type { Event, Business } from '../../types';

interface EventFormProps {
  onSubmit: (event: Partial<Event>) => void;
  initialData?: Partial<Event>;
  onCancel: () => void;
  businesses: Business[];
}

export default function EventForm({ onSubmit, initialData, onCancel, businesses }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : '',
    location: initialData?.location || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    businessId: initialData?.businessId || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      date: new Date(formData.date),
      attendees: initialData?.attendees || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Event Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Date and Time
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-xs text-gray-500 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={formData.date.split('T')[0]}
              onChange={(e) => {
                const time = formData.date.split('T')[1] || '00:00';
                setFormData({ ...formData, date: `${e.target.value}T${time}` });
              }}
              className="block w-full px-3 py-2 text-base border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-xs text-gray-500 mb-1">
              Time
            </label>
            <input
              type="time"
              id="time"
              value={formData.date.split('T')[1]?.slice(0, 5) || ''}
              onChange={(e) => {
                const date = formData.date.split('T')[0] || new Date().toISOString().split('T')[0];
                setFormData({ ...formData, date: `${date}T${e.target.value}` });
              }}
              className="block w-full px-3 py-2 text-base border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="businessId" className="block text-sm font-medium text-gray-700">
          Business
        </label>
        <select
          id="businessId"
          value={formData.businessId}
          onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select a category</option>
          <option value="Event">Event</option>
          <option value="Promotion">Promotion</option>
          <option value="Workshop">Workshop</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          rows={3}
          required
        />
      </div>

      <div className="flex justify-end space-x-4">
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
          {initialData ? 'Update' : 'Create'} Event
        </button>
      </div>
    </form>
  );
}