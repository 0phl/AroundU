import React, { useEffect, useState } from 'react';
import { CalendarIcon, MapPinIcon, UserGroupIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { useEventStore } from '../stores/eventStore';
import { useBusinessStore } from '../stores/businessStore';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Events() {
  const { events, loading, error, markInterested, unmarkInterested, userInterestedEvents, fetchEvents, resetUserInterests } = useEventStore();
  const { businesses, fetchBusinesses } = useBusinessStore();
  const { user } = useAuth();
  const [processingEvents, setProcessingEvents] = useState<Set<string>>(new Set());

  // Fetch events and businesses
  useEffect(() => {
    fetchEvents();
    fetchBusinesses();
  }, [fetchEvents, fetchBusinesses]);

  // Reset interests when user changes
  useEffect(() => {
    resetUserInterests();
    if (user?.id) {  
      // Fetch user's interested events
      const fetchUserInterests = async () => {
        try {
          const userEventsRef = collection(db, 'users', user.id, 'interestedEvents');
          const userEventsSnapshot = await getDocs(userEventsRef);
          const interestedEventIds = userEventsSnapshot.docs.map(doc => doc.id);
          useEventStore.setState(state => ({
            userInterestedEvents: new Set(interestedEventIds)
          }));
        } catch (error) {
          console.error('Error fetching user interests:', error);
        }
      };
      fetchUserInterests();
    }
  }, [user]);

  const handleToggleInterest = async (eventId: string) => {
    if (!user?.id) {  
      toast.error('Please sign in to mark interest in events');
      return;
    }

    setProcessingEvents(prev => new Set([...prev, eventId]));
    try {
      if (userInterestedEvents.has(eventId)) {
        await unmarkInterested(eventId, user.id);  
        toast.success('You are no longer interested in this event');
      } else {
        await markInterested(eventId, user.id);  
        toast.success('You are now interested in this event!');
      }
    } catch (error) {
      console.error('Error toggling interest:', error);
      toast.error(userInterestedEvents.has(eventId) 
        ? 'Failed to unmark interest in event'
        : 'Failed to mark interest in event'
      );
    } finally {
      setProcessingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">Upcoming Events</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const business = businesses.find(b => b.id === event.businessId);
          const isProcessing = processingEvents.has(event.id);

          return (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Event Image or Placeholder */}
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 relative">
                {business?.photos?.[0] ? (
                  <img 
                    src={business.photos[0]} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CalendarIcon className="h-16 w-16 text-white opacity-50" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {event.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                
                {/* Business Info */}
                {business && (
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
                    <span>{business.name}</span>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(new Date(event.date), 'PPp')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    {event.attendees} interested
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {event.description}
                </p>

                <button
                  onClick={() => handleToggleInterest(event.id)}
                  disabled={isProcessing || !user}
                  className={`w-full px-4 py-2 rounded-full text-sm transition-colors flex items-center justify-center ${
                    !user 
                      ? 'bg-gray-300 cursor-not-allowed'
                      : isProcessing 
                        ? 'opacity-75 cursor-not-allowed' 
                        : userInterestedEvents.has(event.id)
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : userInterestedEvents.has(event.id) ? (
                    'Interested ✓'
                  ) : (
                    'Interested'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}