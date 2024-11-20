import { create } from 'zustand';
import type { Event } from '../types';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  Timestamp,
  getFirestore,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

type EventStore = {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  markInterested: (eventId: string, userId: string) => Promise<void>;
  unmarkInterested: (eventId: string, userId: string) => Promise<void>;
  userInterestedEvents: Set<string>;
  resetUserInterests: () => void;
};

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  userInterestedEvents: new Set(),

  fetchEvents: async () => {
    set({ loading: true });
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Event[];

      set({ events, loading: false });
    } catch (error) {
      console.error('Error fetching events:', error);
      set({ error: 'Failed to fetch events', loading: false });
    }
  },

  addEvent: async (eventData) => {
    try {
      const eventsRef = collection(db, 'events');
      const newEvent = {
        ...eventData,
        attendees: 0,
        category: eventData.category || 'Event',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        date: Timestamp.fromDate(eventData.date || new Date())
      };

      const docRef = await addDoc(eventsRef, newEvent);
      const event = {
        ...newEvent,
        id: docRef.id,
        date: eventData.date || new Date(),
        createdAt: newEvent.createdAt.toDate(),
        updatedAt: newEvent.updatedAt.toDate()
      } as Event;

      set(state => ({
        events: [event, ...state.events]
      }));
    } catch (error) {
      console.error('Error adding event:', error);
      set({ error: 'Failed to add event' });
      throw error;
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      const eventRef = doc(db, 'events', id);
      const updateData = {
        ...eventData,
        category: eventData.category || undefined,
        updatedAt: Timestamp.now(),
        date: eventData.date ? Timestamp.fromDate(eventData.date) : undefined
      };

      await updateDoc(eventRef, updateData);

      set(state => ({
        events: state.events.map(event =>
          event.id === id
            ? {
                ...event,
                ...eventData,
                date: eventData.date ? new Date(eventData.date) : event.date,
                updatedAt: new Date()
              }
            : event
        )
      }));
    } catch (error) {
      console.error('Error updating event:', error);
      set({ error: 'Failed to update event' });
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      const eventRef = doc(db, 'events', id);
      await deleteDoc(eventRef);

      set(state => ({
        events: state.events.filter(event => event.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting event:', error);
      set({ error: 'Failed to delete event' });
      throw error;
    }
  },

  markInterested: async (eventId: string, userId: string) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const userEventRef = doc(db, 'users', userId, 'interestedEvents', eventId);
      const event = get().events.find(e => e.id === eventId);
      if (!event) return;

      const eventDoc = await getDoc(eventRef);
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const batch = writeBatch(db);

      // Update event attendees count
      batch.update(eventRef, {
        attendees: (eventDoc.data().attendees || 0) + 1,
        updatedAt: Timestamp.now()
      });

      // Add to user's interested events
      batch.set(userEventRef, {
        eventId,
        interestedAt: Timestamp.now()
      });

      await batch.commit();

      set(state => ({
        events: state.events.map(event =>
          event.id === eventId
            ? { ...event, attendees: (event.attendees || 0) + 1, updatedAt: new Date() }
            : event
        ),
        userInterestedEvents: new Set([...state.userInterestedEvents, eventId])
      }));
    } catch (error) {
      console.error('Error marking interest:', error);
      throw error;
    }
  },

  unmarkInterested: async (eventId: string, userId: string) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const userEventRef = doc(db, 'users', userId, 'interestedEvents', eventId);
      const event = get().events.find(e => e.id === eventId);
      if (!event) return;

      const eventDoc = await getDoc(eventRef);
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const batch = writeBatch(db);

      // Update event attendees count
      batch.update(eventRef, {
        attendees: Math.max((eventDoc.data().attendees || 0) - 1, 0),
        updatedAt: Timestamp.now()
      });

      // Remove from user's interested events
      batch.delete(userEventRef);

      await batch.commit();

      set(state => {
        const newInterestedEvents = new Set(state.userInterestedEvents);
        newInterestedEvents.delete(eventId);
        
        return {
          events: state.events.map(event =>
            event.id === eventId
              ? { ...event, attendees: Math.max((event.attendees || 0) - 1, 0), updatedAt: new Date() }
              : event
          ),
          userInterestedEvents: newInterestedEvents
        };
      });
    } catch (error) {
      console.error('Error unmarking interest:', error);
      throw error;
    }
  },

  resetUserInterests: () => {
    set({ userInterestedEvents: new Set() });
  }
}));