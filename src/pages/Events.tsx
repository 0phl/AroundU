import React, { useEffect, useState } from 'react';
import { CalendarIcon, MapPinIcon, UserGroupIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { useEventStore } from '../stores/eventStore';
import { useBusinessStore } from '../stores/businessStore';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function Events() {
  const { events, loading, error, markInterested, unmarkInterested, userInterestedEvents, fetchEvents, resetUserInterests } = useEventStore();
  const { businesses, fetchBusinesses } = useBusinessStore();
  const { user } = useAuth();
  const [processingEvents, setProcessingEvents] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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

    // If user is already interested, show confirmation dialog
    if (userInterestedEvents.has(eventId)) {
      setSelectedEventId(eventId);
      setShowConfirmDialog(true);
      return;
    }

    // Otherwise, proceed with marking interest
    await processInterestToggle(eventId);
  };

  const processInterestToggle = async (eventId: string) => {
    if (!user?.id) return;
    
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
      setShowConfirmDialog(false);
      setSelectedEventId(null);
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
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-semibold mb-6">Upcoming Events</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-20">
          {events.map((event) => {
            const business = businesses.find(b => b.id === event.businessId);
            const isProcessing = processingEvents.has(event.id);

            return (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-auto"
              >
                {/* Event Image */}
                <div className="w-full h-36 bg-gradient-to-r from-blue-500 to-purple-500 relative">
                  {business?.photos?.[0] ? (
                    <img 
                      src={business.photos[0]} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CalendarIcon className="h-12 w-12 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{event.title}</h2>
                    
                    {/* Business Info */}
                    {business && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <BuildingStorefrontIcon className="h-4 w-4 mr-1" />
                        <span>{business.name}</span>
                      </div>
                    )}

                    {/* Event Info */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {format(new Date(event.date), 'PPp')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {event.attendees} interested
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  {/* Button Container */}
                  <div className="mt-4 pt-2">
                    <button
                      onClick={() => handleToggleInterest(event.id)}
                      disabled={isProcessing || !user}
                      className={`w-full px-4 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center justify-center ${
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
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : userInterestedEvents.has(event.id) ? (
                        'Interested ✓'
                      ) : (
                        'Interested'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Transition appear show={showConfirmDialog} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-10" 
          onClose={() => setShowConfirmDialog(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Cancel Interest
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to cancel your interest in this event? You can always mark your interest again later.
                    </p>
                  </div>

                  <div className="mt-4 flex space-x-3 justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                      onClick={() => setShowConfirmDialog(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                      onClick={() => selectedEventId && processInterestToggle(selectedEventId)}
                    >
                      Confirm
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}