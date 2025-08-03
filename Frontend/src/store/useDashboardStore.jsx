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
  declarationsTerminees: null, // ✅ Simple declarations data
  acquisitionClients: null,
  recentActivities: null,
  elementsEnRetard: null,

  // Individual loading states
  loadingClients: false,
  loadingAgo: false,
  loadingDeclarations: false,
  loadingAcquisition: false,
  loadingActivities: false,
  loadingElementsRetard: false,

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
   * ✅ SIMPLIFIED: Fetch completed declarations count for current year
   */
  fetchDeclarationsTerminees: async () => {
    set({ loadingDeclarations: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/declarations-terminees-periode`);
      
      if (response.data.status === "success") {
        set({
          declarationsTerminees: response.data.data,
          loadingDeclarations: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération des déclarations terminées");
      }
    } catch (error) {
      console.error("Error fetching declarations terminees:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur de connexion";
      set({
        error: errorMessage,
        loadingDeclarations: false,
      });
      toast.error(`Erreur déclarations terminées: ${errorMessage}`);
    }
  },

  /**
   * Fetch client acquisition data
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
   * Fetch recent activities data
   */
  fetchRecentActivities: async () => {
    set({ loadingActivities: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/activites-recentes`);
      
      if (response.data.status === "success") {
        set({
          recentActivities: response.data.data,
          loadingActivities: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération des activités récentes");
      }
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur de connexion";
      set({
        error: errorMessage,
        loadingActivities: false,
      });
      toast.error(`Erreur activités récentes: ${errorMessage}`);
    }
  },

  /**
   * Fetch elements en retard data
   */
  fetchElementsEnRetard: async () => {
    set({ loadingElementsRetard: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/elements-retard`);
      
      if (response.data.status === "success") {
        set({
          elementsEnRetard: response.data.data,
          loadingElementsRetard: false,
          error: null
        });
      } else {
        throw new Error(response.data.message || "Erreur lors de la récupération des éléments en retard");
      }
    } catch (error) {
      console.error("Error fetching elements en retard:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur de connexion";
      set({
        error: errorMessage,
        loadingElementsRetard: false,
      });
      toast.error(`Erreur éléments en retard: ${errorMessage}`);
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
   * Fetch all dashboard statistics using individual endpoints
   */
  fetchAllDashboardStats: async () => {
    const { 
      fetchClientsActifs, 
      fetchAGOMois, 
      fetchDeclarationsTerminees,
      fetchAcquisitionClients,
      fetchRecentActivities,
      fetchElementsEnRetard
    } = get();
    
    set({ loading: true, error: null });
    
    try {
      // Fetch all individual stats in parallel
      await Promise.all([
        fetchClientsActifs(),
        fetchAGOMois(),
        fetchDeclarationsTerminees(),
        fetchAcquisitionClients(),
        fetchRecentActivities(),
        fetchElementsEnRetard()
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
   * Refresh only declarations data
   */
  refreshDeclarations: async () => {
    await get().fetchDeclarationsTerminees();
    toast.success("Données des déclarations actualisées");
  },

  /**
   * Refresh only acquisition data
   */
  refreshAcquisition: async () => {
    await get().fetchAcquisitionClients();
    toast.success("Données d'acquisition actualisées");
  },

  /**
   * Refresh only recent activities data
   */
  refreshRecentActivities: async () => {
    await get().fetchRecentActivities();
    toast.success("Activités récentes actualisées");
  },

  /**
   * Refresh only elements en retard data
   */
  refreshElementsEnRetard: async () => {
    await get().fetchElementsEnRetard();
    toast.success("Éléments en retard actualisés");
  },

  /**
   * Auto-refresh recent activities (for real-time updates)
   */
  autoRefreshActivities: () => {
    const { fetchRecentActivities } = get();
    
    // Silent refresh without toast notification
    fetchRecentActivities().catch(error => {
      console.warn("Auto-refresh activities failed:", error);
    });
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
   * Smart fetch - fetch all data if data is stale
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
   * Get overall loading state
   */
  isLoading: () => {
    const { 
      loading, 
      loadingClients, 
      loadingAgo, 
      loadingDeclarations,
      loadingAcquisition, 
      loadingActivities,
      loadingElementsRetard
    } = get();
    return loading || loadingClients || loadingAgo || loadingDeclarations || loadingAcquisition || loadingActivities || loadingElementsRetard;
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

  // ✅ SIMPLIFIED UTILITY METHODS FOR DECLARATIONS

  /**
   * Get simple declarations data
   */
  getDeclarationsData: () => {
    const { declarationsTerminees } = get();
    return declarationsTerminees || null;
  },

  /**
   * Get declarations total count for current year
   */
  getDeclarationsTotal: () => {
    const { declarationsTerminees } = get();
    return declarationsTerminees?.total || 0;
  },

  /**
   * Get declarations value (same as total)
   */
  getDeclarationsValue: () => {
    const { declarationsTerminees } = get();
    return declarationsTerminees?.value || 0;
  },

  /**
   * Get declarations yearly trend
   */
  getDeclarationsYearlyTrend: () => {
    const { declarationsTerminees } = get();
    if (!declarationsTerminees) return null;
    
    return {
      change: declarationsTerminees.change,
      trend: declarationsTerminees.trend,
      formatted: declarationsTerminees.formatted_change
    };
  },

  /**
   * Get previous year declarations count
   */
  getPreviousYearDeclarations: () => {
    const { declarationsTerminees } = get();
    return declarationsTerminees?.previous_year || 0;
  },

  /**
   * Get declarations label
   */
  getDeclarationsLabel: () => {
    const { declarationsTerminees } = get();
    return declarationsTerminees?.label || 'Déclarations Terminées';
  },

  /**
   * Check if declarations data is available
   */
  hasDeclarationsData: () => {
    const { declarationsTerminees } = get();
    return Boolean(declarationsTerminees);
  },

  // UTILITY METHODS FOR ACQUISITION

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

  // UTILITY METHODS FOR RECENT ACTIVITIES

  /**
   * Get recent activities list
   */
  getRecentActivities: () => {
    const { recentActivities } = get();
    return recentActivities?.activities || [];
  },

  /**
   * Get recent activities by type
   * @param {string} type - 'client', 'ago', 'fiscal', 'juridique'
   */
  getRecentActivitiesByType: (type) => {
    const activities = get().getRecentActivities();
    return activities.filter(activity => activity.type === type);
  },

  /**
   * Get recent activities by status
   * @param {string} status - 'success', 'pending', 'warning', 'info'
   */
  getRecentActivitiesByStatus: (status) => {
    const activities = get().getRecentActivities();
    return activities.filter(activity => activity.status === status);
  },

  /**
   * Get recent activities statistics
   */
  getRecentActivitiesStats: () => {
    const { recentActivities } = get();
    return recentActivities?.statistics || null;
  },

  /**
   * Get activities count by type
   */
  getActivitiesCountByType: () => {
    const stats = get().getRecentActivitiesStats();
    return stats?.by_type || {};
  },

  /**
   * Get total recent activities count
   */
  getTotalRecentActivitiesCount: () => {
    const stats = get().getRecentActivitiesStats();
    return stats?.total_count || 0;
  },

  /**
   * Check if recent activities data is available
   */
  hasRecentActivities: () => {
    const activities = get().getRecentActivities();
    return activities.length > 0;
  },

  /**
   * Get most recent activity
   */
  getMostRecentActivity: () => {
    const activities = get().getRecentActivities();
    return activities[0] || null;
  },

  /**
   * Get activities from today
   */
  getTodayActivities: () => {
    const activities = get().getRecentActivities();
    const today = new Date().toDateString();
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.created_at).toDateString();
      return activityDate === today;
    });
  },

  /**
   * Get pending activities (status = 'pending')
   */
  getPendingActivities: () => {
    return get().getRecentActivitiesByStatus('pending');
  },

  /**
   * Get completed activities (status = 'success')
   */
  getCompletedActivities: () => {
    return get().getRecentActivitiesByStatus('success');
  },

  /**
   * Check if there are any pending activities
   */
  hasPendingActivities: () => {
    const pending = get().getPendingActivities();
    return pending.length > 0;
  },

  /**
   * Get activities summary for quick overview
   */
  getActivitiesSummary: () => {
    const activities = get().getRecentActivities();
    const stats = get().getRecentActivitiesStats();
    
    if (!activities.length) return null;
    
    const completed = get().getCompletedActivities().length;
    const pending = get().getPendingActivities().length;
    const today = get().getTodayActivities().length;
    
    return {
      total: activities.length,
      completed,
      pending,
      todayCount: today,
      byType: stats?.by_type || {},
      lastUpdated: stats?.generated_at || null
    };
  },

  // UTILITY METHODS FOR ELEMENTS EN RETARD

  /**
   * Get all elements en retard data
   */
  getElementsEnRetard: () => {
    const { elementsEnRetard } = get();
    return elementsEnRetard || null;
  },

  /**
   * Get historique juridique en retard
   */
  getHistoriqueJuridiqueRetard: () => {
    const elements = get().getElementsEnRetard();
    return elements?.historique_juridique || [];
  },

  /**
   * Get historique fiscal en retard
   */
  getHistoriqueFiscalRetard: () => {
    const elements = get().getElementsEnRetard();
    return elements?.historique_fiscal || [];
  },

  /**
   * Get AGO en retard
   */
  getAGORetard: () => {
    const elements = get().getElementsEnRetard();
    return elements?.ago || [];
  },

  /**
   * Get elements en retard statistics
   */
  getElementsRetardStats: () => {
    const elements = get().getElementsEnRetard();
    return elements?.statistics || null;
  },

  /**
   * Get total count of overdue items
   */
  getTotalElementsRetard: () => {
    const stats = get().getElementsRetardStats();
    return stats?.total_retards || 0;
  },

  /**
   * Get count by category
   */
  getElementsRetardByCategory: () => {
    const stats = get().getElementsRetardStats();
    if (!stats) return { juridique: 0, fiscal: 0, ago: 0 };
    
    return {
      juridique: stats.juridique_count || 0,
      fiscal: stats.fiscal_count || 0,
      ago: stats.ago_count || 0
    };
  },

  /**
   * Check if there are any overdue elements
   */
  hasElementsEnRetard: () => {
    const total = get().getTotalElementsRetard();
    return total > 0;
  },

  /**
   * Check if elements en retard data is available
   */
  hasElementsRetardData: () => {
    const elements = get().getElementsEnRetard();
    return Boolean(elements);
  },

  // Clear errors
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store
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
      declarationsTerminees: null,
      acquisitionClients: null,
      recentActivities: null,
      elementsEnRetard: null,
      loadingClients: false,
      loadingAgo: false,
      loadingDeclarations: false,
      loadingAcquisition: false,
      loadingActivities: false,
      loadingElementsRetard: false,
    });
  },
}));

export default useDashboardStore;