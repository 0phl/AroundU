import React, { useState, useEffect } from 'react';
import { PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useEventStore } from '../../stores/eventStore';
import { useBusinessStore } from '../../stores/businessStore';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import EventForm from '../../components/admin/EventForm';
import EventInterestList from '../../components/EventInterestList';
import type { Event } from '../../types';

export default function EventManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { events, loading, error, fetchEvents, addEvent, updateEvent, deleteEvent } = useEventStore();
  const { businesses, loading: businessesLoading, fetchBusinesses } = useBusinessStore();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchEvents();
    fetchBusinesses();
  }, [user, authLoading, navigate, fetchEvents, fetchBusinesses]);

  const handleSubmit = async (eventData: Partial<Event>) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        toast.success('Event updated successfully');
      } else {
        await addEvent({
          ...eventData,
          attendees: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Omit<Event, 'id'>);
        toast.success('Event created successfully');
      }
      setShowForm(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        toast.success('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const getBusinessName = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    return business?.name || 'Unknown Business';
  };

  if (loading || authLoading || businessesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (showForm) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">
            {editingEvent ? 'Edit' : 'Add'} Event
          </h2>
          <EventForm
            onSubmit={handleSubmit}
            initialData={editingEvent || undefined}
            businesses={businesses}
            onCancel={() => {
              setShowForm(false);
              setEditingEvent(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="lg:col-span-2">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage all events in the system
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowForm(true)}
                className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
              >
                <PlusIcon className="h-5 w-5 inline-block mr-2" />
                Add Event
              </button>
            </div>
          </div>

          {/* Mobile View */}
          <div className="mt-8 md:hidden">
            {events.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No events found</div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-colors
                      ${selectedEvent?.id === event.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex flex-col">
                      <h3 className="text-base font-semibold text-gray-900">{event.title}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-500">
                          {format(new Date(event.date), 'PPp')}
                        </p>
                        <p className="text-sm text-gray-500">{event.location}</p>
                        <p className="text-sm text-gray-500">
                          Category: {event.category}
                        </p>
                        <p className="text-sm text-gray-500">
                          Business: {getBusinessName(event.businessId || '')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Attendees: {event.attendees}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(event);
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(event.id);
                        }}
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
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Business</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Attendees</th>
                    <th className="relative py-3.5 pl-3 pr-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-gray-500">
                        No events found
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr 
                        key={event.id}
                        className={`cursor-pointer ${selectedEvent?.id === event.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {event.title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(event.date), 'PPp')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {event.location}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {event.category}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {getBusinessName(event.businessId || '')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {event.attendees}
                          </div>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(event);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(event.id);
                            }}
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

        {/* Interested Users Panel */}
        <div className="lg:col-span-1">
          {selectedEvent ? (
            <EventInterestList 
              eventId={selectedEvent.id}
              businessName={getBusinessName(selectedEvent.businessId || '')}
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
              <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              Select an event to view interested users
            </div>
          )}
        </div>
      </div>
    </div>
  );
}