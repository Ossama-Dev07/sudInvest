import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/AuthStore";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  const authChecking = useAuthStore((state) => state.authChecking);

  if (authChecking)
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="animate-spin transition" />
      </div>
    );

  return isAuthenticated ? <Navigate to="/tableau-de-bord" /> : children;
};

export default PublicRoute;
