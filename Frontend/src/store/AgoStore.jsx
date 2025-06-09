// src/stores/useAgoStore.js
import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const useAgoStore = create((set, get) => ({
  // State
  agos: [],
  currentAgo: null,
  loading: false,
  error: null,

  // Actions

  // Fetch all AGOs
  fetchAgos: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("http://localhost:8000/api/agos");
      if (response.data.status === "success") {
        set({ agos: response.data.data, loading: false });
      } else {
        throw new Error("Failed to fetch AGOs");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Fetch a single AGO by ID
  fetchAgoById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:8000/api/agos/${id}`);
      if (response.data.status === "success") {
        set({ currentAgo: response.data.data, loading: false });
      } else {
        throw new Error("Failed to fetch AGO");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Fetch AGOs by client ID
  getAgosByClientId: async (clientId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `http://localhost:8000/api/agos/client/${clientId}`
      );
      set({
        agos: response.data.data,
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

  // Create a new AGO
  createAgo: async (agoData) => {
    set({ loading: true, error: null });
    try {
      console.log("store", agoData);
      const response = await axios.post(
        "http://localhost:8000/api/agos",
        agoData
      );
      set((state) => ({
        agos: [...state.agos, response.data.data.ago],
        loading: false,
      }));
      const { agos } = get();
      toast.success("L'AGO a été ajoutée avec succès.");
      return get().agos;
    } catch (error) {
      console.log(error);
      if (error.status == 422) {
        toast.error(error.response.data.message);
      }
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Update an existing AGO
  updateAgo: async (id, agoData) => {
    set({ loading: true, error: null });
    try {
      console.log("agoData", agoData, "id", id);
      const response = await axios.put(
        `http://localhost:8000/api/agos/${id}`,
        agoData
      );

      // Update the AGO in the state
      set((state) => ({
        agos: state.agos.map((item) =>
          item.id === id ? response.data.data.ago : item
        ),
        currentAgo: response.data.data.ago,
        loading: false,
      }));
      return toast.success("L'AGO a été mise à jour avec succès.");
    } catch (error) {
      console.log(error);
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Delete an AGO
  deleteAgo: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(`http://localhost:8000/api/agos/${id}`);
      if (response.data.status === "success") {
        // Remove the AGO from the state
        set((state) => ({
          agos: state.agos.filter((item) => item.id !== id),
          loading: false,
        }));
        return toast.success("L'AGO a été supprimée avec succès.");
      } else {
        throw new Error("Failed to delete AGO");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Clear current AGO
  clearCurrentAgo: () => {
    set({ currentAgo: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useAgoStore;