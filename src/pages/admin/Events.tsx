import React, { useState } from 'react';
import { useEventStore } from '../../stores/eventStore';
import { useBusinessStore } from '../../stores/businessStore';
import EventInterestList from '../../components/EventInterestList';
import { format } from 'date-fns';
import { CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function AdminEvents() {
  const { events } = useEventStore();
  const { businesses } = useBusinessStore();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">Event Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events List */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium">All Events</h2>
          {events.map((event) => {
            const business = businesses.find(b => b.id === event.businessId);
            const isSelected = selectedEventId === event.id;
            
            return (
              <div
                key={event.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer
                  ${isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-200'}`}
                onClick={() => setSelectedEventId(event.id)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {event.category}
                    </span>
                  </div>
                  
                  {business && (
                    <p className="mt-1 text-sm text-gray-500">
                      {business.name}
                    </p>
                  )}
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(new Date(event.date), 'PPp')}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      {event.attendees || 0} interested
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interested Users Panel */}
        <div>
          <h2 className="text-lg font-medium mb-4">Interested Users</h2>
          {selectedEventId ? (
            <EventInterestList 
              eventId={selectedEventId}
              businessName={businesses.find(b => 
                b.id === events.find(e => e.id === selectedEventId)?.businessId
              )?.name || ''}
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
              Select an event to view interested users
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
