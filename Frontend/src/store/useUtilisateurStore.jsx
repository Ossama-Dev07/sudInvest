import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const useUtilisateurStore = create((set, get) => ({
  utilisateurs: [],
  archivedUtilisateurs: [],
  loading: false,
  error: null,

  fetchUtilisateurs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        "http://localhost:8000/api/utilisateurs"
      );
      console.log("fetch users:", response);
      set({ utilisateurs: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  getUtilisateurById: async (id) => {
    set({ loading: true, error: null });
    try {
      const utilisateurs = get().utilisateurs;
      const existingUser = utilisateurs.find(
        (user) => user.id_utilisateur === parseInt(id)
      );
      if (existingUser) {
        set({ currentUtilisateur: existingUser, loading: false });
        return existingUser;
      }

      // If not found in store, fetch from API
      const response = await axios.get(
        `http://localhost:8000/api/utilisateurs/${id}`
      );

      set({ currentUtilisateur: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error("Error fetching utilisateur:", error);
      toast.error("Erreur lors du chargement de l'utilisateur.");
      return null;
    }
  },

  // Add a new utilisateur
  addUtilisateur: async (utilisateurData) => {
    set({ loading: true, error: null });
    try {
      console.log("utilisateurData", utilisateurData);
      const response = await axios.post(
        "http://localhost:8000/api/utilisateurs",
        utilisateurData
      );
      set((state) => ({
        utilisateurs: [...state.utilisateurs, response.data],
        loading: false,
      }));
      toast.success("Utilisateur ajouté avec succès !");
    } catch (error) {
      set({ error: error.message, loading: false });
      console.log(error);
      if (error.status === 422) {
        return toast.error("Email ou CIN déjà utilisé !");
      }
      toast.error("erreur d'ajoution");
    }
  },

  // Update utilisateur
  updateUtilisateur: async (id, utilisateurData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(
        `http://localhost:8000/api/utilisateurs/${id}`,
        utilisateurData
      );
      set((state) => ({
        utilisateurs: state.utilisateurs.map((user) =>
          user.id_utilisateur === id ? response.data : user
        ),
        loading: false,
      }));
      toast.success("Utilisateur mis à jour avec succès !");
    } catch (error) {
      set({ error: error.message, loading: false });
      if (error.status === 422) {
        return toast.error("Email ou CIN déjà utilisé !");
      }
      toast.error("Erreur lors de la mise à jour de l'utilisateur.");
    }
  },
  deleteUtilisateur: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`http://localhost:8000/api/utilisateurs/${id}`);
      set((state) => ({
        archivedUtilisateurs: state.archivedUtilisateurs.filter(
          (user) => user.id_utilisateur !== id
        ),
        loading: false,
      }));
      toast.success("Utilisateur supprimé définitivement !");
    } catch (error) {
      set({ error: error.message, loading: false });
      if(error.status===400){
         return toast.error("Impossible de supprimer l'utilisateur, il a des clients associés.");
      }
      toast.error("Erreur lors de la suppression de l'utilisateur.");
      console.error("Erreur suppression:", error);
    }
  },
  // Archive utilisateur (now just deactivates)
  deactivateUtilisateur: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.post(
        `http://localhost:8000/api/${id}/deactivate`
      );

      set((state) => ({
        utilisateurs: state.utilisateurs.filter((user) => user.id_utilisateur !== id),
        loading: false,
      }));
      return toast.success("Utilisateur archivé avec succès !");
    } catch (error) {
      set({ error: error.message, loading: false });
      console.log(error.message);
      toast.error("Erreur lors de l'archivage.");
    }
  },

  // Restore utilisateur
  restoreUtilisateur: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`http://localhost:8000/api/${id}/restore`);

      // Remove from archived list and fetch users again to get the restored user
      set((state) => ({
        archivedUtilisateurs: state.archivedUtilisateurs.filter(
          (user) => user.id_utilisateur !== id
        ),
        loading: false,
      }));

      // Optionally refresh active users list
      

      return toast.success("Utilisateur restauré avec succès !");
    } catch (error) {
      set({ loading: false, error: error.message });
      console.error(error);
      toast.error("Échec de la restauration de l'utilisateur.");
    }
  },

  // Permanently delete utilisateur
  

  fetchArchivedUtilisateurs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        "http://localhost:8000/api/archived"
      );

      console.log('ana s store',response.data)
      set({ archivedUtilisateurs: response.data, loading: false });
    } catch (error) {
      console.error("Fetch error:", error);
      set({ error: error.message, loading: false });
      toast.error("Erreur lors du chargement des archives.");
    }
  },
}));

export default useUtilisateurStore;
