import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/AuthStore";
import { LoaderCircle } from "lucide-react";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
const authChecking = useAuthStore((state) => state.authChecking);
  if (authChecking)
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="animate-spin transition" />
      </div>
    );

  return isAuthenticated ? children : <Navigate to="/login" />;
};
export default PrivateRoute;