import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAlertStore } from '../../stores/alertStore';
import AlertForm from '../../components/admin/AlertForm';
import type { Alert } from '../../types';
import { format } from 'date-fns';

export default function AlertManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const { alerts, addAlert, updateAlert, deleteAlert } = useAlertStore();

  const handleSubmit = (alertData: Partial<Alert>) => {
    if (editingAlert) {
      updateAlert(editingAlert.id, alertData);
    } else {
      addAlert({
        ...alertData,
        id: Math.random().toString(36).substr(2, 9)
      } as Alert);
    }
    setShowForm(false);
    setEditingAlert(null);
  };

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      deleteAlert(id);
    }
  };

  if (showForm) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">
            {editingAlert ? 'Edit' : 'Add'} Alert
          </h2>
          <AlertForm
            onSubmit={handleSubmit}
            initialData={editingAlert || undefined}
            onCancel={() => {
              setShowForm(false);
              setEditingAlert(null);
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
          <h1 className="text-2xl font-semibold text-gray-900">Alerts</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage system alerts and notifications
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowForm(true)}
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
          >
            <PlusIcon className="h-5 w-5 inline-block mr-2" />
            Add Alert
          </button>
        </div>
      </div>

      {/* Mobile View */}
      <div className="mt-8 md:hidden">
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No alerts found</div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col">
                  <h3 className="text-base font-semibold text-gray-900">{alert.title}</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        alert.type === 'info'
                          ? 'bg-blue-100 text-blue-800'
                          : alert.type === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : alert.type === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {alert.type}
                      </span>
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        alert.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Priority: {alert.priority}</p>
                    <p className="text-sm text-gray-500">Target: {alert.targetAudience}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => handleEdit(alert)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
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
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Title</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Priority</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Target</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {alert.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          alert.type === 'info'
                            ? 'bg-blue-100 text-blue-800'
                            : alert.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : alert.type === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {alert.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {alert.priority}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          alert.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {alert.targetAudience}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button
                          onClick={() => handleEdit(alert)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(alert.id)}
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
    </div>
  );
}