import React, { useState } from 'react';
import type { Alert } from '../../types';
import { 
  BellIcon, 
  CalendarIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface AlertFormProps {
  onSubmit: (alert: Partial<Alert>) => void;
  initialData?: Partial<Alert>;
  onCancel: () => void;
}

export default function AlertForm({ onSubmit, initialData, onCancel }: AlertFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    message: initialData?.message || '',
    type: initialData?.type || 'info',
    priority: initialData?.priority || 'medium',
    status: initialData?.status || 'active',
    targetAudience: initialData?.targetAudience || 'all',
    expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt).toISOString().slice(0, 16) : ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date()
    });
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'info':
        return 'text-blue-700 bg-blue-50 border-blue-200 focus:border-blue-500 focus:ring-blue-500';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500';
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200 focus:border-green-500 focus:ring-green-500';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200 focus:border-red-500 focus:ring-red-500';
      default:
        return 'text-gray-700 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Alert Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200"
          placeholder="Enter alert title"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200 resize-none"
          rows={3}
          placeholder="Enter alert message"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as Alert['type'] })}
            className={`mt-1 block w-full rounded-md border px-3 py-2
            focus:outline-none focus:ring-2 focus:border-transparent
            transition-colors duration-200 ${getTypeStyles(formData.type)}`}
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Alert['priority'] })}
            className={`mt-1 block w-full rounded-md border px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200
            ${formData.priority === 'high' ? 'text-red-700 bg-red-50 border-red-200' :
              formData.priority === 'medium' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
              'text-blue-700 bg-blue-50 border-blue-200'}`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Alert['status'] })}
            className={`mt-1 block w-full rounded-md border px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200
            ${formData.status === 'active' ? 'text-green-700 bg-green-50 border-green-200' : 
              'text-gray-700 bg-gray-50 border-gray-200'}`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
            Target Audience
          </label>
          <select
            id="targetAudience"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as Alert['targetAudience'] })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200"
          >
            <option value="all">All Users</option>
            <option value="students">Students Only</option>
            <option value="businesses">Businesses Only</option>
          </select>
        </div>
      </div>

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
                value={formData.expiresAt ? formData.expiresAt.split('T')[0] : ''}
                onChange={(e) => {
                  const time = formData.expiresAt ? formData.expiresAt.split('T')[1] : '00:00';
                  setFormData({ ...formData, expiresAt: `${e.target.value}T${time}` });
                }}
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
                value={formData.expiresAt ? formData.expiresAt.split('T')[1]?.slice(0, 5) : ''}
                onChange={(e) => {
                  const date = formData.expiresAt ? formData.expiresAt.split('T')[0] : new Date().toISOString().split('T')[0];
                  setFormData({ ...formData, expiresAt: `${date}T${e.target.value}` });
                }}
                className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 rounded-md
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors duration-200 sm:text-sm"
              />
            </div>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Leave both fields empty for no expiration
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
          transition-colors duration-200 flex items-center justify-center"
        >
          <XMarkIcon className="h-4 w-4 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md
          hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-colors duration-200 flex items-center justify-center"
        >
          <CheckIcon className="h-4 w-4 mr-2" />
          {initialData ? 'Update' : 'Create'} Alert
        </button>
      </div>
    </form>
  );
}