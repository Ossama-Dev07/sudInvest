import { create } from "zustand";
import axios from "axios";

// Define the API base URL


const useClientStore = create((set, get) => ({
  // State
  clients: [],
  isLoading: false,
  error: null,

  // Actions

  // Fetch all clients
  fetchClients: async () => {
    set({ isLoading: true, error: null });
    try {
        const response = await axios.get(`http://localhost:8000/api/clients`);
        console.log(response.data)
      set({ clients: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch clients",
        isLoading: false,
      });
    }
  },

  addclient: async (clientData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `http://localhost:8000/api/clients`,
        clientData
      );
      set((state) => ({
        clients: [...state.clients, response.data.data],
        isLoading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to create client",
        isLoading: false,
      });
      return null;
    }
  },

  // Update a client
  updateClient: async (id, clientData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `http://localhost:8000/api/clients/${id}`,
        clientData
      );
      set((state) => ({
        clients: state.clients.map((client) =>
          client.id_client === id ? response.data.data : client
        ),
        currentClient: response.data.data,
        isLoading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update client",
        isLoading: false,
      });
      return null;
    }
  },

  // Delete a client
  deleteClient: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`http://localhost:8000/api/clients/${id}`);
      set((state) => ({
        clients: state.clients.filter((client) => client.id_client !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete client",
        isLoading: false,
      });
      return false;
    }
  },

  // Clear errors
  clearError: () => {
    set({ error: null });
  },
}));

export default useClientStore;
