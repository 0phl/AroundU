import React, { useState, useRef } from 'react';
import CoordinatePicker from '../CoordinatePicker';
import type { Business } from '../../types';

interface BusinessFormProps {
  onSubmit: (data: Partial<Business>) => void;
  onCancel: () => void;
  initialData?: Business;
  children?: React.ReactNode;
}

type BusinessHours = {
  open: string;
  close: string;
  isClosed?: boolean;
};

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday', 
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

export default function BusinessForm({ onSubmit, onCancel, initialData }: BusinessFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.photos?.[0] || '');
  const [formData, setFormData] = useState<Partial<Business>>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    address: initialData?.address || '',
    coordinates: initialData?.coordinates || { lat: 14.458942866502959, lng: 120.96075553643246 },
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    website: initialData?.website || '',
    photos: initialData?.photos || [],
    hours: initialData?.hours || {
      monday: { open: "09:00", close: "17:00", isClosed: false },
      tuesday: { open: "09:00", close: "17:00", isClosed: false },
      wednesday: { open: "09:00", close: "17:00", isClosed: false },
      thursday: { open: "09:00", close: "17:00", isClosed: false },
      friday: { open: "09:00", close: "17:00", isClosed: false },
      saturday: { open: "09:00", close: "17:00", isClosed: false },
      sunday: { open: "09:00", close: "17:00", isClosed: false }
    }
  });

  const [hours, setHours] = useState<Record<DayOfWeek, BusinessHours>>(
    initialData?.hours || {
      monday: { open: "09:00", close: "17:00", isClosed: false },
      tuesday: { open: "09:00", close: "17:00", isClosed: false },
      wednesday: { open: "09:00", close: "17:00", isClosed: false },
      thursday: { open: "09:00", close: "17:00", isClosed: false },
      friday: { open: "09:00", close: "17:00", isClosed: false },
      saturday: { open: "09:00", close: "17:00", isClosed: false },
      sunday: { open: "09:00", close: "17:00", isClosed: false }
    }
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      if (!file.type.match('image/jpeg|image/png')) {
        alert('Only JPEG or PNG files are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({
          ...prev,
          photos: [base64String]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHoursChange = (day: DayOfWeek, type: 'open' | 'close' | 'isClosed', value: string | boolean) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours?.[day],
          [type]: value
        }
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Business Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Image</label>
          <div className="mt-1 flex items-center space-x-4">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Business preview"
                className="h-32 w-32 object-cover rounded"
              />
            ) : (
              <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Change Image
              </button>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setFormData(prev => ({ ...prev, photos: [] }));
                  }}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                >
                  Remove Image
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500">JPEG or PNG only. Max size 5MB.</p>
            </div>
          </div>
        </div>

        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <CoordinatePicker
            value={formData.coordinates || { lat: 14.458942866502959, lng: 120.96075553643246 }}
            onChange={(coords) => setFormData({ ...formData, coordinates: coords })}
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Website URL</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Business Hours Section */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h3>
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="flex flex-col sm:grid sm:grid-cols-4 gap-4">
              <div className="flex items-center justify-between sm:block">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {day}
                </label>
                <div className="flex items-center sm:mt-2">
                  <input
                    type="checkbox"
                    checked={hours[day].isClosed}
                    onChange={(e) => handleHoursChange(day, 'isClosed', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm text-gray-500">Closed</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:col-span-3">
                <div className="relative">
                  <label className="block text-xs text-gray-500 mb-1">Opening Time</label>
                  <input
                    type="time"
                    value={hours[day].open}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    className={`block w-full px-3 py-2 text-base border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      hours[day].isClosed ? 'opacity-50 bg-gray-50' : ''
                    } sm:text-sm`}
                    disabled={hours[day].isClosed}
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs text-gray-500 mb-1">Closing Time</label>
                  <input
                    type="time"
                    value={hours[day].close}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    className={`block w-full px-3 py-2 text-base border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      hours[day].isClosed ? 'opacity-50 bg-gray-50' : ''
                    } sm:text-sm`}
                    disabled={hours[day].isClosed}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}