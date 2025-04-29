import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  authChecking: true,

  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
        withCredentials: true,
      });
      const response = await axios.post(
        "http://localhost:8000/api/login",
        credentials
      );
      const token = response.data.token;
      localStorage.setItem("token", token);
       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({
        user: response.data.user,
        isAuthenticated: true,
        loading: false,
      });

      return true;
    } catch (error) {
      
      toast.error(error.response.data.message);
      set({
        loading: false,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await axios.post("http://localhost:8000/api/logout", {
        withCredentials: true,
      });
       localStorage.removeItem("token");
       delete axios.defaults.headers.common["Authorization"];
      set({ user: null, isAuthenticated: false, authChecking: false });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  checkAuth: async () => {
    set({ authChecking: true });
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
        withCredentials: true,
      });
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        set({ isAuthenticated: false, user: null, authChecking: false });
        return;
      }

      const response = await axios.get("http://localhost:8000/api/user", {
        withCredentials: true,
      });
      set({ user: response.data, isAuthenticated: true, authChecking: false });
    } catch (error) {
      localStorage.removeItem("token");
      set({ user: null, isAuthenticated: false, authChecking: false });
    }
  },
}));
export default useAuthStore;
