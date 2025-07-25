// File: src/store/HistoriqueFiscalStore.js

import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8000/api";

const useHistoriqueFiscalStore = create((set, get) => ({
  // State
  historiques: [],
  currentHistorique: null,
  clients: [],
  loading: false,
  error: null,

  // Filters and pagination
  filters: {
    annee: "",
    client_type: "",
    statut_global: "",
    search: "",
  },

  // Statistics
  stats: {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  },

  // Actions

  /**
   * Fetch all historiques fiscals with client information
   */
  fetchHistoriques: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/historique-fiscal`);

      if (response.data.status === "success") {
        const historiques = response.data.data;

        // Calculate statistics
        const stats = {
          total: historiques.length,
          completed: historiques.filter((h) => h.statut_global === "COMPLETE")
            .length,
          pending: historiques.filter((h) => h.statut_global === "EN_COURS")
            .length,
          overdue: historiques.filter((h) => h.statut_global === "EN_RETARD")
            .length,
        };

        set({
          historiques,
          stats,
          loading: false,
        });
      } else {
        throw new Error(
          response.data.message || "Erreur lors de la récupération"
        );
      }
    } catch (error) {
      console.error("Error fetching historiques:", error);
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
   * Fetch single historique with details
   */
  fetchHistoriqueById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `${API_BASE_URL}/historique-fiscal/${id}`
      );

      if (response.data.status === "success") {
        set({
          currentHistorique: response.data.data,
          loading: false,
        });
      } else {
        throw new Error(response.data.message || "Historique non trouvé");
      }
    } catch (error) {
      console.error("Error fetching historique:", error);
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
   * Create new historique fiscal
   */
  createHistorique: async (data) => {
    set({ loading: true, error: null });
    try {
      // Transform data to match controller expectations
      const transformedData = {
        id_client: data.id_client || data.client_id, // Handle both formats
        annee_fiscal: data.annee_fiscal,
        description: data.description,
        statut_global: data.statut_global || "EN_COURS",
        commentaire_general: data.commentaire_general,
        paiements: (data.paiements || []).map((paiement) => ({
          ...paiement,
          date_start: paiement.date_start || null,
          date_end: paiement.date_end || null,
        })),
        declarations: data.declarations || [],
      };

      const response = await axios.post(
        `${API_BASE_URL}/historique-fiscal`,
        transformedData
      );

      if (response.data.status === "success") {
        // Refresh the list
        await get().fetchHistoriques();

        toast.success("Historique fiscal créé avec succès!");
        set({ loading: false });
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Error creating historique:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Erreur de connexion";
      const validationErrors = error.response?.data?.errors || null;

      toast.error(`Erreur de création: ${errorMessage}`);
      set({
        error: errorMessage,
        loading: false,
      });

      // Return validation errors for form handling
      if (validationErrors) {
        throw { message: errorMessage, errors: validationErrors };
      }
      throw new Error(errorMessage);
    }
  },

  /**
   * Update existing historique fiscal (includes paiements and declarations)
   */
  updateHistorique: async (id, data) => {
    set({ loading: true, error: null });
    try {
      // Transform data to match controller expectations
      const transformedData = {
        annee_fiscal: data.annee_fiscal,
        description: data.description,
        statut_global: data.statut_global,
        commentaire_general: data.commentaire_general,
        paiements: (data.paiements || []).map((paiement) => ({
          ...paiement,
          date_start: paiement.date_start || null,
          date_end: paiement.date_end || null,
        })),
        declarations: data.declarations || [],
      };

      const response = await axios.put(
        `${API_BASE_URL}/historique-fiscal/${id}`,
        transformedData
      );

      if (response.data.status === "success") {
        // Update current historique if it's the one being edited
        const currentHistorique = get().currentHistorique;
        if (currentHistorique && currentHistorique.id === parseInt(id)) {
          set({ currentHistorique: response.data.data });
        }

        // Refresh the list
        await get().fetchHistoriques();

        toast.success("Historique fiscal mis à jour avec succès!");
        set({ loading: false });
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Erreur lors de la mise à jour"
        );
      }
    } catch (error) {
      console.error("Error updating historique:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Erreur de connexion";
      const validationErrors = error.response?.data?.errors || null;

      toast.error(`Erreur de mise à jour: ${errorMessage}`);
      set({
        error: errorMessage,
        loading: false,
      });
      
      if (validationErrors) {
        throw { message: errorMessage, errors: validationErrors };
      }
      throw new Error(errorMessage);
    }
  },

  /**
   * Update only the status of an historique fiscal
   */
  updateHistoriqueStatus: async (id, statut_global) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/historique-fiscal/${id}/status`,
        { statut_global }
      );

      if (response.data.status === "success") {
        // Update the historique in the local state
        const historiques = get().historiques.map((h) =>
          h.id === parseInt(id) ? { ...h, statut_global } : h
        );

        // Update current historique if it's the one being updated
        const currentHistorique = get().currentHistorique;
        if (currentHistorique && currentHistorique.id === parseInt(id)) {
          set({ 
            currentHistorique: { ...currentHistorique, statut_global }
          });
        }

        // Recalculate stats
        const stats = {
          total: historiques.length,
          completed: historiques.filter((h) => h.statut_global === "COMPLETE")
            .length,
          pending: historiques.filter((h) => h.statut_global === "EN_COURS")
            .length,
          overdue: historiques.filter((h) => h.statut_global === "EN_RETARD")
            .length,
        };

        set({
          historiques,
          stats,
          loading: false,
        });

        toast.success("Statut mis à jour avec succès!");
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Erreur lors de la mise à jour du statut"
        );
      }
    } catch (error) {
      console.error("Error updating historique status:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Erreur de connexion";

      toast.error(`Erreur de mise à jour du statut: ${errorMessage}`);
      set({
        error: errorMessage,
        loading: false,
      });
      throw new Error(errorMessage);
    }
  },

  /**
   * Delete historique fiscal
   */
  deleteHistorique: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/historique-fiscal/${id}`
      );

      if (response.data.status === "success") {
        // Remove from local state
        const historiques = get().historiques.filter(
          (h) => h.id !== parseInt(id)
        );

        // Recalculate stats
        const stats = {
          total: historiques.length,
          completed: historiques.filter((h) => h.statut_global === "COMPLETE")
            .length,
          pending: historiques.filter((h) => h.statut_global === "EN_COURS")
            .length,
          overdue: historiques.filter((h) => h.statut_global === "EN_RETARD")
            .length,
        };

        set({
          historiques,
          stats,
          loading: false,
        });

        // Clear current if it was deleted
        const currentHistorique = get().currentHistorique;
        if (currentHistorique && currentHistorique.id === parseInt(id)) {
          set({ currentHistorique: null });
        }

        toast.success("Historique fiscal supprimé avec succès!");
        return true;
      } else {
        throw new Error(
          response.data.message || "Erreur lors de la suppression"
        );
      }
    } catch (error) {
      console.error("Error deleting historique:", error);
      const errorMessage = error.response?.data?.message ||
          error.message ||
          "Erreur de connexion";
      
      toast.error(`Erreur de suppression: ${errorMessage}`);
      set({
        error: errorMessage,
        loading: false,
      });
      throw error;
    }
  },

  /**
   * Fetch clients for dropdown
   */
  fetchClients: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/historique-fiscal/clients`
      );

      if (response.data.status === "success") {
        set({ clients: response.data.data });
      } else {
        throw new Error(
          response.data.message || "Erreur lors de la récupération des clients"
        );
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      const errorMessage = error.response?.data?.message ||
          error.message ||
          "Erreur de connexion";
      
      toast.error(`Erreur de chargement des clients: ${errorMessage}`);
      set({
        error: errorMessage,
      });
    }
  },

  /**
   * Fetch historiques by client ID
   */
  fetchHistoriquesByClient: async (clientId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `${API_BASE_URL}/historique-fiscal/client/${clientId}`
      );

      if (response.data.status === "success") {
        set({
          historiques: response.data.data,
          loading: false,
        });
      } else {
        throw new Error(
          response.data.message || "Aucun historique trouvé pour ce client"
        );
      }
    } catch (error) {
      console.error("Error fetching client historiques:", error);
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
   * Delete a specific paiement
   */
  deletePaiement: async (paiementId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/historique-fiscal/paiements/${paiementId}`
      );

      if (response.status === 200) {
        toast.success("Paiement supprimé avec succès!");
        return response.data;
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du paiement:", error);
      const errorMessage = error.response?.data?.message ||
          error.message ||
          "Erreur lors de la suppression du paiement";
      
      toast.error(`Erreur: ${errorMessage}`);
      throw error;
    }
  },

  /**
   * Delete a specific declaration
   */
  deleteDeclaration: async (declarationId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/historique-fiscal/declarations/${declarationId}`
      );

      if (response.status === 200) {
        toast.success("Déclaration supprimée avec succès!");
        return response.data;
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la déclaration:", error);
      const errorMessage = error.response?.data?.message ||
          error.message ||
          "Erreur lors de la suppression de la déclaration";
      
      toast.error(`Erreur: ${errorMessage}`);
      throw error;
    }
  },

  /**
   * Set filters
   */
  setFilters: (newFilters) => {
    set({
      filters: { ...get().filters, ...newFilters },
    });
  },

  /**
   * Get filtered historiques
   */
  getFilteredHistoriques: () => {
    const { historiques, filters } = get();

    return historiques.filter((historique) => {
      // Filter by year
      if (filters.annee && historique.annee_fiscal !== filters.annee) {
        return false;
      }

      // Filter by client type
      if (
        filters.client_type &&
        historique.client_type !== filters.client_type
      ) {
        return false;
      }

      // Filter by status
      if (
        filters.statut_global &&
        historique.statut_global !== filters.statut_global
      ) {
        return false;
      }

      // Filter by search (client name)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const clientDisplay = historique.client_display?.toLowerCase() || "";
        const clientNom = historique.client_nom?.toLowerCase() || "";
        const clientPrenom = historique.client_prenom?.toLowerCase() || "";
        const clientRaison =
          historique.client_raisonSociale?.toLowerCase() || "";

        return (
          clientDisplay.includes(searchLower) ||
          clientNom.includes(searchLower) ||
          clientPrenom.includes(searchLower) ||
          clientRaison.includes(searchLower)
        );
      }

      return true;
    });
  },

  /**
   * Clear current historique
   */
  clearCurrentHistorique: () => {
    set({ currentHistorique: null });
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store
   */
  reset: () => {
    set({
      historiques: [],
      currentHistorique: null,
      clients: [],
      loading: false,
      error: null,
      filters: {
        annee: "",
        client_type: "",
        statut_global: "",
        search: "",
      },
      stats: {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
      },
    });
  },

  /**
   * Get statistics by year
   */
  getStatsByYear: (year) => {
    const { historiques } = get();
    const yearHistoriques = historiques.filter((h) => h.annee_fiscal === year);

    return {
      total: yearHistoriques.length,
      completed: yearHistoriques.filter((h) => h.statut_global === "COMPLETE")
        .length,
      pending: yearHistoriques.filter((h) => h.statut_global === "EN_COURS")
        .length,
      overdue: yearHistoriques.filter((h) => h.statut_global === "EN_RETARD")
        .length,
      avgProgress:
        yearHistoriques.length > 0
          ? Math.round(
              yearHistoriques.reduce(
                (sum, h) => sum + (h.progress_percentage || 0),
                0
              ) / yearHistoriques.length
            )
          : 0,
    };
  },

  /**
   * Get client historiques
   */
  getClientHistoriques: (clientId) => {
    const { historiques } = get();
    // Handle both id_client and client_id formats
    return historiques.filter(
      (h) => h.id_client === clientId || h.client_id === clientId
    );
  },
}));

export default useHistoriqueFiscalStore;