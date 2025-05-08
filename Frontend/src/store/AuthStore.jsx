import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

// Set axios defaults for credentials and CSRF
axios.defaults.withCredentials = true;

// Create a secure storage mechanism using cookies
const secureStorage = {
  setToken: (token) => {
    // Set token in a more secure cookie with JS access (not ideal but better than localStorage)
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
    // Also set it for the Authorization header
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },
  
  getToken: () => {
    const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
    return match ? match[2] : null;
  },
  
  removeToken: () => {
    document.cookie = "auth_token=; path=/; max-age=0";
    delete axios.defaults.headers.common["Authorization"];
  }
};

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  authChecking: true,

  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      
      // Get CSRF cookie
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");
      
      // Send login request
      const response = await axios.post(
        "http://localhost:8000/api/login",
        credentials
      );
      
      // Store token securely
      const token = response.data.token;
      secureStorage.setToken(token);

      // Update state with user info
      set({
        user: response.data.user,
        isAuthenticated: true,
        loading: false,
      });

      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      toast.error(errorMessage);
      set({
        loading: false,
        error: errorMessage
      });
      return false;
    }
  },

  logout: async () => {
    try {
      const token = secureStorage.getToken();
      if (token) {
        // Ensure the token is in the header for the logout request
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      
      // Call logout endpoint
      await axios.post("http://localhost:8000/api/logout");
      
      // Clear the token
      secureStorage.removeToken();
      
      // Clear frontend state
      set({ user: null, isAuthenticated: false, authChecking: false });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout API fails, clear local state
      secureStorage.removeToken();
      set({ user: null, isAuthenticated: false, authChecking: false });
    }
  },

  checkAuth: async () => {
    set({ authChecking: true });
    try {
      // Get CSRF cookie
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");
      
      // Get token from cookie
      const token = secureStorage.getToken();
      
      if (!token) {
        set({ user: null, isAuthenticated: false, authChecking: false });
        return;
      }
      
      // Set authorization header with token
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Check if user is authenticated
      const response = await axios.get("http://localhost:8000/api/user");
      
      // Update state with user info
      set({ 
        user: response.data, 
        isAuthenticated: true, 
        authChecking: false 
      });
    } catch (error) {
      // If request fails, user is not authenticated
      secureStorage.removeToken();
      set({ 
        user: null, 
        isAuthenticated: false, 
        authChecking: false 
      });
    }
  },
}));

export default useAuthStore;