import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8000/api";

const useDashboardStore = create((set, get) => ({
  // State
  dashboardStats: null,
  loading: false,
  error: null,
  lastUpdated: null,

  // Individual stats for easier access
  clientsActifs: null,
  agoMois: null,
  revenus: null,
  tauxCompletion: null,

  // Actions

  /**
   * Fetch all dashboard statistics
   */
  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
      
      if (response.data.status === "success") {
        const stats = response.data.data;
        
        set({
          dashboardStats: stats,
          clientsActifs: stats.clients_actifs,
          agoMois: stats.ago_du_mois,
          revenus: stats.revenus,
          tauxCompletion: stats.taux_completion,
          lastUpdated: stats.updated_at,
          loading: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération des statistiques");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      const errorMessage = error.response?.data?.message ||
          error.message ||
          "Erreur de connexion";
      
      toast.error(`Erreur: ${errorMessage}`);
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  /**
   * Fetch individual client stats
   */
  fetchClientsActifs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/clients-actifs`);
      
      if (response.data.status === "success") {
        set({
          clientsActifs: response.data.data,
          loading: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération des clients actifs");
      }
    } catch (error) {
      console.error("Error fetching clients actifs:", error);
      const errorMessage = error.response?.data?.message || error.message;
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  /**
   * Fetch AGO statistics for the month
   */
  fetchAGOMois: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/ago-du-mois`);
      
      if (response.data.status === "success") {
        set({
          agoMois: response.data.data,
          loading: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération des AGO du mois");
      }
    } catch (error) {
      console.error("Error fetching AGO mois:", error);
      const errorMessage = error.response?.data?.message || error.message;
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  /**
   * Fetch revenue statistics
   */
  fetchRevenus: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/revenus`);
      
      if (response.data.status === "success") {
        set({
          revenus: response.data.data,
          loading: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération des revenus");
      }
    } catch (error) {
      console.error("Error fetching revenus:", error);
      const errorMessage = error.response?.data?.message || error.message;
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  /**
   * Fetch completion rate statistics
   */
  fetchTauxCompletion: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/taux-completion`);
      
      if (response.data.status === "success") {
        set({
          tauxCompletion: response.data.data,
          loading: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération du taux de complétion");
      }
    } catch (error) {
      console.error("Error fetching taux completion:", error);
      const errorMessage = error.response?.data?.message || error.message;
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  /**
   * Refresh all dashboard data
   */
  refreshDashboard: async () => {
    await get().fetchDashboardStats();
    toast.success("Tableau de bord actualisé");
  },

  /**
   * Check if data needs refresh (older than 5 minutes)
   */
  needsRefresh: () => {
    const { lastUpdated } = get();
    if (!lastUpdated) return true;
    
    const now = new Date();
    const lastUpdate = new Date(lastUpdated);
    const diffMinutes = (now - lastUpdate) / (1000 * 60);
    
    return diffMinutes > 5;
  },

  /**
   * Smart fetch - only fetch if data is stale
   */
  smartFetch: async () => {
    const { needsRefresh, fetchDashboardStats } = get();
    if (needsRefresh()) {
      await fetchDashboardStats();
    }
  },

  // Clear errors
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      dashboardStats: null,
      loading: false,
      error: null,
      lastUpdated: null,
      clientsActifs: null,
      agoMois: null,
      revenus: null,
      tauxCompletion: null,
    });
  },
}));

export default useDashboardStore;