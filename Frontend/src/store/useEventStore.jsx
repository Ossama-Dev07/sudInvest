import { create } from 'zustand';

const API_BASE_URL = 'http://localhost:8000/api/events';

const useEventStore = create((set, get) => ({
  // State
  events: [],
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch all events
  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      
      if (data.success) {
        set({ events: data.data, loading: false });
      } else {
        set({ error: 'Failed to fetch events', loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Create new event
  createEvent: async (eventData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (data.success) {
        const { events } = get();
        set({ 
          events: [...events, data.data], 
          loading: false 
        });
        return data.data;
      } else {
        set({ error: data.message || 'Failed to create event', loading: false });
        return null;
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Update event
  updateEvent: async (eventId, eventData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (data.success) {
        const { events } = get();
        const updatedEvents = events.map(event => 
          event.id === eventId ? data.data : event
        );
        set({ events: updatedEvents, loading: false });
        return data.data;
      } else {
        set({ error: data.message || 'Failed to update event', loading: false });
        return null;
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Delete event
  deleteEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const { events } = get();
        const filteredEvents = events.filter(event => event.id !== eventId);
        set({ events: filteredEvents, loading: false });
        return true;
      } else {
        set({ error: data.message || 'Failed to delete event', loading: false });
        return false;
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  // Get single event by ID
  getEventById: (eventId) => {
    const { events } = get();
    return events.find(event => event.id === eventId) || null;
  },

  // Get events for current month
  getCurrentMonthEvents: () => {
    const { events } = get();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getFullYear() === currentYear && 
             eventDate.getMonth() === currentMonth;
    });
  },

  // Get upcoming events
  getUpcomingEvents: (limit = 10) => {
    const { events } = get();
    const now = new Date();
    
    return events
      .filter(event => new Date(event.start) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, limit);
  },

  // Add event locally (for optimistic updates)
  addEventLocally: (event) => {
    const { events } = get();
    set({ events: [...events, event] });
  },

  // Update event locally
  updateEventLocally: (eventId, updatedEvent) => {
    const { events } = get();
    const updatedEvents = events.map(event => 
      event.id === eventId ? { ...event, ...updatedEvent } : event
    );
    set({ events: updatedEvents });
  },

  // Remove event locally
  removeEventLocally: (eventId) => {
    const { events } = get();
    const filteredEvents = events.filter(event => event.id !== eventId);
    set({ events: filteredEvents });
  },

  // Clear all events
  clearEvents: () => set({ events: [] }),

  // Refresh events (alias for fetchEvents)
  refreshEvents: async () => {
    await get().fetchEvents();
  },
}));

export default useEventStore;