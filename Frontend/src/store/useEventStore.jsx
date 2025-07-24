import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const useEventStore = create((set, get) => ({
  // State
  events: [],
  currentEvent: null,
  loading: false,
  error: null,

  // Actions

  // Fetch all events
  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("http://localhost:8000/api/events");
      if (response.data.success) {
        set({ events: response.data.data, loading: false });
      } else {
        throw new Error("Failed to fetch events");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Fetch a single event by ID
  fetchEventById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:8000/api/events/${id}`);
      if (response.data.success) {
        set({ currentEvent: response.data.data, loading: false });
      } else {
        throw new Error("Failed to fetch event");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Get events for current month
  fetchCurrentMonthEvents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("http://localhost:8000/api/events/current-month");
      if (response.data.success) {
        set({ events: response.data.data, loading: false });
        return response.data.data;
      } else {
        throw new Error("Failed to fetch current month events");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      return [];
    }
  },

  // Get events by date range
  getEventsByDateRange: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `http://localhost:8000/api/events?start=${startDate}&end=${endDate}&fullcalendar_format=true`
      );
      
      set({
        events: response.data.data,
        loading: false,
      });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      return [];
    }
  },

  // Create a new event
  createEvent: async (eventData) => {
    set({ loading: true, error: null });
    try {
      console.log("store", eventData);
      const response = await axios.post(
        "http://localhost:8000/api/events",
        eventData
      );
      set((state) => ({
        events: [...state.events, response.data.data],
        loading: false,
      }));
      const { events } = get();
      toast.success("L'événement a été ajouté avec succès.");
      return response.data.data;
    } catch (error) {
      console.log(error);
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      return null;
    }
  },

  // Update an existing event
  updateEvent: async (id, eventData) => {
    set({ loading: true, error: null });
    try {
      console.log("eventData", eventData, "id", id);
      const response = await axios.put(
        `http://localhost:8000/api/events/${id}`,
        eventData
      );

      // Update the event in the state
      set((state) => ({
        events: state.events.map((item) =>
          item.id === id ? response.data.data : item
        ),
        currentEvent: response.data.data,
        loading: false,
      }));
      toast.success("L'événement a été mis à jour avec succès.");
      return response.data.data;
    } catch (error) {
      console.log(error);
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      return null;
    }
  },

  // Delete an event
  deleteEvent: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(`http://localhost:8000/api/events/${id}`);
      if (response.data.success) {
        // Remove the event from the state
        set((state) => ({
          events: state.events.filter((item) => item.id !== id),
          loading: false,
        }));
        toast.success("L'événement a été supprimé avec succès.");
        return true;
      } else {
        throw new Error("Failed to delete event");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      return false;
    }
  },

  // Update event dates (for drag & drop)
  updateEventDates: async (id, dateData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/events/${id}/dates`,
        dateData
      );

      // Update the event in the state
      set((state) => ({
        events: state.events.map((item) =>
          item.id === id ? response.data.data : item
        ),
        loading: false,
      }));
      toast.success("Les dates de l'événement ont été mises à jour.");
      return response.data.data;
    } catch (error) {
      console.log(error);
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      return null;
    }
  },

  // Bulk delete events
  bulkDeleteEvents: async (eventIds) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete("http://localhost:8000/api/events", {
        data: { event_ids: eventIds }
      });
      
      if (response.data.success) {
        // Remove the events from the state
        set((state) => ({
          events: state.events.filter((item) => !eventIds.includes(item.id)),
          loading: false,
        }));
        toast.success(`${eventIds.length} événement(s) supprimé(s) avec succès.`);
        return true;
      } else {
        throw new Error("Failed to delete events");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      return false;
    }
  },

  // Local helper methods
  getEventById: (eventId) => {
    const { events } = get();
    return events.find(event => event.id === eventId) || null;
  },

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

  getUpcomingEvents: (limit = 10) => {
    const { events } = get();
    const now = new Date();
    
    return events
      .filter(event => new Date(event.start) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, limit);
  },

  getTodayEvents: () => {
    const { events } = get();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return events.filter(event => {
      const eventDate = new Date(event.start);
      const eventDateStr = eventDate.toISOString().split('T')[0];
      return eventDateStr === todayStr;
    });
  },

  getEventsByMonth: (year, month) => {
    const { events } = get();
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  },

  // Search events
  searchEvents: (query) => {
    const { events } = get();
    if (!query) return events;
    
    return events.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      (event.extendedProps?.description && 
       event.extendedProps.description.toLowerCase().includes(query.toLowerCase())) ||
      (event.extendedProps?.location && 
       event.extendedProps.location.toLowerCase().includes(query.toLowerCase()))
    );
  },

  // Filter events by type
  filterEventsByType: (isAllDay) => {
    const { events } = get();
    return events.filter(event => event.allDay === isAllDay);
  },

  // Optimistic update methods (for better UX)
  addEventLocally: (event) => {
    const { events } = get();
    set({ events: [...events, event] });
  },

  updateEventLocally: (eventId, updatedEvent) => {
    const { events } = get();
    const updatedEvents = events.map(event => 
      event.id === eventId ? { ...event, ...updatedEvent } : event
    );
    set({ events: updatedEvents });
  },

  removeEventLocally: (eventId) => {
    const { events } = get();
    const filteredEvents = events.filter(event => event.id !== eventId);
    set({ events: filteredEvents });
  },

  // Clear current event
  clearCurrentEvent: () => {
    set({ currentEvent: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Clear all events
  clearEvents: () => {
    set({ events: [] });
  },

  // Refresh events (alias for fetchEvents)
  refreshEvents: async () => {
    await get().fetchEvents();
  },

  // Set loading state
  setLoading: (loading) => {
    set({ loading });
  },

  // Set error state
  setError: (error) => {
    set({ error });
  },
}));

export default useEventStore;