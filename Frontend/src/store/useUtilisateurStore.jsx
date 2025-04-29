import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const useUtilisateurStore = create((set) => ({
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
      console.log(response);
      set({ utilisateurs: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
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
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  //
  addtoArchive: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`http://localhost:8000/api/utilisateurs/${id}/archive`);
      set((state) => ({
        utilisateurs: state.utilisateurs.filter(
          (user) => user.id_utilisateur !== id
        ),
        loading: false,
      }));
      
      toast.success("Utilisateur archivé avec succès !");
    } catch (error) {
      set({ error: error.message, loading: false });
      console.log(error.message);
      toast.error("Erreur lors de l'archivage.");
    }
  },

  // Delete utilisateur
  deleteUtilisateur: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`http://localhost:8000/api/utilisateurs/${id}`);

      set((state) => ({
        utilisateurs: state.utilisateurs.filter(
          (user) => user.id_utilisateur !== id
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  fetchArchivedUtilisateurs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        "http://localhost:8000/api/archived-utilisateurs"
      );
      set({ archivedUtilisateurs: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error("Erreur lors du chargement des archives.");
    }
  },
}));

export default useUtilisateurStore;
