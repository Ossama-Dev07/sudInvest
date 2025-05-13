// src/stores/useHistoriqueJuridiqueStore.js
import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const useHistoriqueJuridiqueStore = create((set, get) => ({
  // State
  historiques: [],
  currentHistorique: null,
  loading: false,
  error: null,

  // Actions

  // Fetch all historiques juridiques
  fetchHistoriques: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        "http://localhost:8000/api/historique-juridique"
      );
      if (response.data.status === "success") {
        set({ historiques: response.data.data, loading: false });
      } else {
        throw new Error("Failed to fetch historiques juridiques");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Fetch a single historique juridique by ID
  fetchHistoriqueById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `http://localhost:8000/api/historique-juridique/${id}`
      );
      if (response.data.status === "success") {
        set({ currentHistorique: response.data.data, loading: false });
      } else {
        throw new Error("Failed to fetch historique juridique");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Create a new historique juridique
  createHistorique: async (historiqueData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        "http://localhost:8000/api/historique-juridique",
        historiqueData
      );
      if (response.data.status === "success") {
        // Add the new historique to the state
        set((state) => ({
          historiques: [...state.historiques, response.data.data.historique],
          loading: false,
        }));
        toast.success("L'historique juridique a été ajouté avec succès.");
        console.log("Historique juridique créé avec succès:", historiques);
      } else {
        throw new Error("Failed to create historique juridique");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Update an existing historique juridique
  updateHistorique: async (id, historiqueData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(
        `http://localhost:8000/api/historique-juridique/${id}`,
        historiqueData
      );

      // Update the historique in the state
      set((state) => ({
        historiques: state.historiques.map((item) =>
          item.id === id ? response.data.data.historique : item
        ),
        currentHistorique: response.data.data.historique,
        loading: false,
      }));
      return toast.success(
        "L'historique juridique a été mis à jour avec succès."
      );
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });

    }
  },

  // Delete a historique juridique
  deleteHistorique: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/historique-juridique/${id}`
      );
      if (response.data.status === "success") {
        // Remove the historique from the state
        set((state) => ({
          historiques: state.historiques.filter((item) => item.id !== id),
          loading: false,
        }));
        return toast.success(
          "L'historique juridique a été supprimé avec succès."
        );
      } else {
        throw new Error("Failed to delete historique juridique");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  // Clear current historique
  clearCurrentHistorique: () => {
    set({ currentHistorique: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useHistoriqueJuridiqueStore;
