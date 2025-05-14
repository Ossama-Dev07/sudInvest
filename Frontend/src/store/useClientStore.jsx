import { create } from "zustand";
import axios from "axios";
import useAuthStore from "./AuthStore";
import { toast } from "react-toastify";

// Define the API base URL

const useClientStore = create((set, get) => ({
  // State
  clients: [],
  archivedClients: [],
  isLoading: false,
  error: null,

  // Actions

  // Fetch all clients
  fetchClients: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:8000/api/clients`);
      console.log(response.data);
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
    const authUserId = useAuthStore.getState().user?.id_utilisateur;
    console.log("authUserId:", authUserId);

    const client = {
      id_fiscal: clientData.idFiscal,
      nom_client: clientData.nom,
      prenom_client: clientData.prenom,
      raisonSociale: clientData.raisonSociale,
      CIN_client: clientData.cin,
      rc: clientData.rc,
      telephone: clientData.telephone,
      type: clientData.type,
      email: clientData.email,
      adresse: clientData.adresse,
      datecreation: clientData.datecreation,
      date_collaboration: clientData.dateCollboration,
      ice: clientData.ice,
      taxe_profes: clientData.taxeProfessionnelle,
      activite: clientData.activite,
      statut_client: clientData.statut,
      id_utilisateur: authUserId,
    };
    try {
      const response = await axios.post(
        `http://localhost:8000/api/clients`,
        client
      );

      set((state) => ({
        clients: [...state.clients, response.data.data],
        isLoading: false,
      }));
      return toast.success("Client ajouté avec succès");

    } catch (error) {
      console.error("Error creating client:", error);
      if(error.response?.status === 422) {
        toast.error("email dejà utilisé");
      }
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
      const client = {
        id_fiscal: clientData.idFiscal,
        nom_client: clientData.nom,
        prenom_client: clientData.prenom,
        raisonSociale: clientData.raisonSociale,
        CIN_client: clientData.cin,
        rc: clientData.rc,
        telephone: clientData.telephone,
        type: clientData.type,
        email: clientData.email,
        adresse: clientData.adresse,
        datecreation: clientData.datecreation,
        date_collaboration: clientData.dateCollboration,
        ice: clientData.ice,
        taxe_profes: clientData.taxeProfessionnelle,
        activite: clientData.activite,
        statut_client: clientData.statut,
        id_utilisateur: clientData.id_utilisateur,
      };
      console.log("clientDatstore:",client);
      const response = await axios.put(
        `http://localhost:8000/api/clients/${id}`,
        client
      );
      set((state) => ({
        clients: state.clients.map((client) =>
          client.id_client === id ? response.data.data : client
        ),
        currentClient: response.data.data,
        isLoading: false,
      }));
      return toast.success("Client modifié avec succès");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update client",
        isLoading: false,
      });
      return null;
    }
  },

  // Improved getClientById action that checks local state first
getClientById: async (id) => {
  set({ isLoading: true, error: null });
  try {
 
    const clients = get().clients;
    const existingClient = clients.find(
      (client) => client.id_client === parseInt(id)
    );
    
    if (existingClient) {
      set({ currentClient: existingClient, isLoading: false });
      return existingClient;
    }

    // If not found in store, fetch from API
    const response = await axios.get(
      `http://localhost:8000/api/clients/${id}`
    );

    set({ currentClient: response.data.data, isLoading: false });
    return response.data.data;
  } catch (error) {
    set({
      error: error.response?.data?.message || "Failed to fetch client",
      isLoading: false,
    });
    toast.error("Error fetching client:", error);
    return null;
  }
},
  // Delete a client
  deleteClient: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`http://localhost:8000/api/clients/${id}`);
      set((state) => ({
        archivedClients: state.archivedClients.filter((client) => client.id_client !== id),
        isLoading: false,
      }));
      return toast.success("Client et son historique juridique supprimés avec succès");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete client",
        isLoading: false,
      });
      return false;
    }
  },
// Deactivate Client
deactivateClient: async (id) => {
  set({ isLoading: true, error: null });
  try {
    // Make a request to deactivate the client
    await axios.post(`http://localhost:8000/api/clients/${id}/deactivate`);

    // Remove the client from the active list
    set((state) => ({
      clients: state.clients.filter((client) => client.id_client !== id),
      isLoading: false,
    }));

    toast.success("Client archivé avec succès !");
  } catch (error) {
    set({ error: error.message, isLoading: false });
    console.log(error);
    toast.error("Erreur lors de l'archivage.");
  }
},

// Restore Client
restoreClient: async (id) => {
  set({ isLoading: true, error: null });
  try {
    // Make a request to restore the client
    await axios.post(`http://localhost:8000/api/clients/${id}/restore`);

    // Remove from archived list and fetch clients again to get the restored client
    set((state) => ({
      archivedClients: state.archivedClients.filter(
        (client) => client.id_client !== id
      ),
      isLoading: false,
    }));

    // Optionally refresh active clients list
    get().fetchClients();

    toast.success("Client restauré avec succès !");
  } catch (error) {
    set({ isLoading: false, error: error.message });
    console.error(error);
    toast.error("Échec de la restauration du client.");
  }
},

// Permanently Delete Client


// Fetch Archived Clients
fetchArchivedClients: async () => {
  set({ isLoading: true, error: null });
  try {
    // Fetch archived clients from the API
    const response = await axios.get("http://localhost:8000/api/clients-archived");
    console.log("Fetched archived clients:",response.data.data);
    set({ archivedClients: response.data.data, isLoading: false });
  } catch (error) {
    console.error("Fetch error:", error);
    set({ error: error.message, isLoading: false });
    toast.error("Erreur lors du chargement des archives.");
  }
},

  // Clear errors
  clearError: () => {
    set({ error: null });
  },
}));

export default useClientStore;
