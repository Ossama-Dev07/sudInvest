// src/stores/useHistoriqueJuridiqueStore.js
import { create } from 'zustand';
import axios from 'axios';

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
      const response = await axios.get('http://localhost:8000/api/historique-juridique');
      if (response.data.status === 'success') {
        set({ historiques: response.data.data, loading: false });
      } else {
        throw new Error('Failed to fetch historiques juridiques');
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
    }
  },
  
  // Fetch a single historique juridique by ID
  fetchHistoriqueById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:8000/api/historique-juridique/${id}`);
      if (response.data.status === 'success') {
        set({ currentHistorique: response.data.data, loading: false });
      } else {
        throw new Error('Failed to fetch historique juridique');
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
    }
  },
  
  // Create a new historique juridique
  createHistorique: async (historiqueData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('http://localhost:8000/api/historique-juridique', historiqueData);
      if (response.data.status === 'success') {
        // Add the new historique to the state
        set(state => ({ 
          historiques: [...state.historiques, response.data.data.historique],
          loading: false 
        }));
        return response.data;
      } else {
        throw new Error('Failed to create historique juridique');
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      throw error;
    }
  },
  
  // Update an existing historique juridique
  updateHistorique: async (id, historiqueData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`http://localhost:8000/api/historique-juridique/${id}`, historiqueData);
      if (response.data.status === 'success') {
        // Update the historique in the state
        set(state => ({
          historiques: state.historiques.map(item => 
            item.id === id ? response.data.data.historique : item
          ),
          currentHistorique: response.data.data.historique,
          loading: false
        }));
        return response.data;
      } else {
        throw new Error('Failed to update historique juridique');
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      throw error;
    }
  },
  
  // Delete a historique juridique
  deleteHistorique: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(`http://localhost:8000/api/historique-juridique/${id}`);
      if (response.data.status === 'success') {
        // Remove the historique from the state
        set(state => ({
          historiques: state.historiques.filter(item => item.id !== id),
          loading: false
        }));
        return response.data;
      } else {
        throw new Error('Failed to delete historique juridique');
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      throw error;
    }
  },
  
  // Clear current historique
  clearCurrentHistorique: () => {
    set({ currentHistorique: null });
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

export default useHistoriqueJuridiqueStore;