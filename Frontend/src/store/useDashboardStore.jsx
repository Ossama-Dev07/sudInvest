import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8000/api";

const useDashboardStore = create((set, get) => ({
  // State
  dashboardStats: null,
  taskDistribution: null,
  loading: false,
  error: null,
  lastUpdated: null,

  // Individual stats for easier access
  clientsActifs: null,
  agoMois: null,
  revenus: null,
  tauxCompletion: null,
  acquisitionClients: null, // ✅ NOUVEAU

  // Individual loading states
  loadingClients: false,
  loadingAgo: false,
  loadingRevenus: false,
  loadingTaux: false,
  loadingAcquisition: false, // ✅ NOUVEAU

  // Actions

  /**
   * Fetch individual client stats
   */
  fetchClientsActifs: async () => {
    set({ loadingClients: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/clients-actifs`);
      
      if (response.data.status === "success") {
        set({
          clientsActifs: response.data.data,
          loadingClients: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération des clients actifs");
      }
    } catch (error) {
      console.error("Error fetching clients actifs:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur de connexion";
      set({
        error: errorMessage,
        loadingClients: false,
      });
      toast.error(`Erreur clients actifs: ${errorMessage}`);
    }
  },

  /**
   * Fetch AGO statistics for the year
   */
  fetchAGOMois: async () => {
    set({ loadingAgo: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/ago-du-mois`);
      
      if (response.data.status === "success") {
        set({
          agoMois: response.data.data,
          loadingAgo: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération des AGO");
      }
    } catch (error) {
      console.error("Error fetching AGO mois:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur de connexion";
      set({
        error: errorMessage,
        loadingAgo: false,
      });
      toast.error(`Erreur AGO: ${errorMessage}`);
    }
  },

  /**
   * Fetch revenue statistics
   */
  fetchRevenus: async () => {
    set({ loadingRevenus: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/revenus`);
      
      if (response.data.status === "success") {
        set({
          revenus: response.data.data,
          loadingRevenus: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération des revenus");
      }
    } catch (error) {
      console.error("Error fetching revenus:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur de connexion";
      set({
        error: errorMessage,
        loadingRevenus: false,
      });
      toast.error(`Erreur revenus: ${errorMessage}`);
    }
  },

  /**
   * Fetch completion rate statistics
   */
  fetchTauxCompletion: async () => {
    set({ loadingTaux: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/taux-completion`);
      
      if (response.data.status === "success") {
        set({
          tauxCompletion: response.data.data,
          loadingTaux: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération du taux de complétion");
      }
    } catch (error) {
      console.error("Error fetching taux completion:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur de connexion";
      set({
        error: errorMessage,
        loadingTaux: false,
      });
      toast.error(`Erreur taux completion: ${errorMessage}`);
    }
  },

  /**
   * ✅ NOUVEAU - Fetch client acquisition data
   */
  fetchAcquisitionClients: async () => {
    set({ loadingAcquisition: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/acquisition-clients`);
      
      if (response.data.status === "success") {
        set({
          acquisitionClients: response.data.data,
          loadingAcquisition: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération des données d'acquisition");
      }
    } catch (error) {
      console.error("Error fetching acquisition clients:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur de connexion";
      set({
        error: errorMessage,
        loadingAcquisition: false,
      });
      toast.error(`Erreur acquisition clients: ${errorMessage}`);
    }
  },

  /**
   * Fetch task distribution data for pie chart
   */
  fetchTaskDistribution: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/task-distribution`);
      
      if (response.data.status === "success") {
        set({
          taskDistribution: response.data.data,
          loading: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération de la répartition des tâches");
      }
    } catch (error) {
      console.error("Error fetching task distribution:", error);
      const errorMessage = error.response?.data?.message ||
          error.message ||
          "Erreur de connexion";
      
      toast.error(`Erreur répartition des tâches: ${errorMessage}`);
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  /**
   * ✅ MODIFIÉ - Fetch all dashboard statistics using individual endpoints (avec acquisition)
   */
  fetchAllDashboardStats: async () => {
    const { fetchClientsActifs, fetchAGOMois, fetchRevenus, fetchTauxCompletion, fetchAcquisitionClients } = get();
    
    set({ loading: true, error: null });
    
    try {
      // Fetch all individual stats in parallel
      await Promise.all([
        fetchClientsActifs(),
        fetchAGOMois(),
        fetchRevenus(),
        fetchTauxCompletion(),
        fetchAcquisitionClients() // ✅ AJOUTÉ
      ]);
      
      set({ 
        loading: false, 
        lastUpdated: new Date().toISOString(),
        error: null 
      });
      
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      set({ loading: false });
    }
  },

  /**
   * Refresh all dashboard data including task distribution
   */
  refreshDashboard: async () => {
    const { fetchAllDashboardStats, fetchTaskDistribution } = get();
    
    await Promise.all([
      fetchAllDashboardStats(),
      fetchTaskDistribution()
    ]);
    
    toast.success("Tableau de bord actualisé");
  },

  /**
   * Refresh only task distribution data
   */
  refreshTaskDistribution: async () => {
    await get().fetchTaskDistribution();
    toast.success("Répartition des tâches actualisée");
  },

  /**
   * ✅ NOUVEAU - Refresh only acquisition data
   */
  refreshAcquisition: async () => {
    await get().fetchAcquisitionClients();
    toast.success("Données d'acquisition actualisées");
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
   * Smart fetch - fetch both stats and task distribution if data is stale
   */
  smartFetch: async () => {
    const { needsRefresh, fetchAllDashboardStats, fetchTaskDistribution } = get();
    if (needsRefresh()) {
      await Promise.all([
        fetchAllDashboardStats(),
        fetchTaskDistribution()
      ]);
    }
  },

  /**
   * ✅ MODIFIÉ - Get overall loading state (avec loadingAcquisition)
   */
  isLoading: () => {
    const { loading, loadingClients, loadingAgo, loadingRevenus, loadingTaux, loadingAcquisition } = get();
    return loading || loadingClients || loadingAgo || loadingRevenus || loadingTaux || loadingAcquisition;
  },

  /**
   * Get task distribution data for specific module
   * @param {string} module - 'combined', 'historique_fiscal', or 'ago'
   */
  getTaskDistributionByModule: (module = 'combined') => {
    const { taskDistribution } = get();
    if (!taskDistribution) return null;
    
    return taskDistribution[module] || null;
  },

  /**
   * Get overdue items count
   */
  getOverdueCount: () => {
    const { taskDistribution } = get();
    if (!taskDistribution) return 0;
    
    const historiqueFiscalOverdue = taskDistribution.historique_fiscal?.data?.find(item => item.name === 'En retard')?.value || 0;
    const agoOverdue = taskDistribution.ago?.data?.find(item => item.name === 'En retard')?.value || 0;
    
    return historiqueFiscalOverdue + agoOverdue;
  },

  /**
   * Get completion statistics
   */
  getCompletionStats: () => {
    const { taskDistribution } = get();
    if (!taskDistribution || !taskDistribution.combined) return null;
    
    const combinedData = taskDistribution.combined.data;
    const completed = combinedData.find(item => item.name === 'Terminées')?.value || 0;
    const inProgress = combinedData.find(item => item.name === 'En cours')?.value || 0;
    const overdue = combinedData.find(item => item.name === 'En retard')?.value || 0;
    const total = taskDistribution.combined.total || 0;
    
    return {
      completed,
      inProgress,
      overdue,
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  },

  // ✅ NOUVELLES MÉTHODES UTILITAIRES POUR L'ACQUISITION

  /**
   * Get acquisition data for current month
   */
  getCurrentMonthAcquisition: () => {
    const { acquisitionClients } = get();
    if (!acquisitionClients?.statistics) return null;
    
    return acquisitionClients.statistics.current_month;
  },

  /**
   * Get peak acquisition month
   */
  getPeakAcquisitionMonth: () => {
    const { acquisitionClients } = get();
    if (!acquisitionClients?.statistics) return null;
    
    return acquisitionClients.statistics.peak_month;
  },

  /**
   * Get yearly acquisition trend
   */
  getAcquisitionTrend: () => {
    const { acquisitionClients } = get();
    if (!acquisitionClients?.statistics) return null;
    
    return {
      change: acquisitionClients.statistics.yearly_change,
      trend: acquisitionClients.statistics.yearly_trend,
      formatted: acquisitionClients.statistics.formatted_yearly_change
    };
  },

  /**
   * Get acquisition chart data formatted for recharts
   */
  getAcquisitionChartData: () => {
    const { acquisitionClients } = get();
    if (!acquisitionClients?.monthly_data) return [];
    
    return acquisitionClients.monthly_data;
  },

  /**
   * Get acquisition statistics summary
   */
  getAcquisitionSummary: () => {
    const { acquisitionClients } = get();
    if (!acquisitionClients?.statistics) return null;
    
    return {
      totalThisYear: acquisitionClients.statistics.total_this_year,
      totalPreviousYear: acquisitionClients.statistics.total_previous_year,
      averagePerMonth: acquisitionClients.statistics.average_per_month,
      yearlyChange: acquisitionClients.statistics.yearly_change,
      trend: acquisitionClients.statistics.yearly_trend,
      peakMonth: acquisitionClients.statistics.peak_month,
      currentMonth: acquisitionClients.statistics.current_month
    };
  },

  /**
   * Check if acquisition data is available
   */
  hasAcquisitionData: () => {
    const { acquisitionClients } = get();
    return Boolean(acquisitionClients?.monthly_data?.length > 0);
  },

  // Clear errors
  clearError: () => {
    set({ error: null });
  },

  /**
   * ✅ MODIFIÉ - Reset store (avec les nouveaux états)
   */
  reset: () => {
    set({
      dashboardStats: null,
      taskDistribution: null,
      loading: false,
      error: null,
      lastUpdated: null,
      clientsActifs: null,
      agoMois: null,
      revenus: null,
      tauxCompletion: null,
      acquisitionClients: null, // ✅ AJOUTÉ
      loadingClients: false,
      loadingAgo: false,
      loadingRevenus: false,
      loadingTaux: false,
      loadingAcquisition: false, // ✅ AJOUTÉ
    });
  },
}));

export default useDashboardStore;