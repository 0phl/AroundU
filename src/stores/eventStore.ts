import { create } from 'zustand';

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  attendees: number;
  category: string;
  businessId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EventStore {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [
    {
      id: '1',
      title: "Student Night at Cafe Latte",
      date: "2023-11-25T18:00:00",
      location: "Cafe Latte",
      description: "Enjoy 20% off all drinks from 6PM - 9PM. Student ID required.",
      attendees: 45,
      category: "Promotion",
      businessId: "1",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: "Book Fair at PageTurner's",
      date: "2023-11-26T10:00:00",
      location: "PageTurner's Bookstore",
      description: "Buy 2 books, get 1 free! Plus, meet local authors and enjoy live readings.",
      attendees: 120,
      category: "Event",
      businessId: "2",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event]
    })),
  updateEvent: (id, updatedEvent) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? { ...event, ...updatedEvent, updatedAt: new Date() }
          : event
      )
    })),
  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id)
    }))
}));