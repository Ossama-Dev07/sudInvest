import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/pages/login/login";
import Utilisateur from "./components/pages/utilisateurUI/Utilisateur";
import Client from "./components/pages/ClientUI/Client";
import Settings from "./components/pages/settings/Settings.jsx";
import PrivateRoute from "./Routes/PrivetRoute";
import PublicRoute from "./Routes/PublicRoute";
import useAuthStore from "@/store/AuthStore";
import { LoaderCircle } from "lucide-react";
import { AppLayout } from "./components/pages/Layout"; 
import AjouterUtilisateur from "./components/pages/utilisateurUI/Actions/AjouterUtilisateur";
import ArchiveUtilisateur from "./components/pages/utilisateurUI/ArchieUilisateur/ArchiveUtilisateur";
import AjouterClient from "./components/pages/ClientUI/AjouterClient";
import ArchiveClient from "./components/pages/ClientUI/ArchiveClient";
import Dashboard from "./components/pages/Dashboard/Dashboard";
import Calendrier from "./components/pages/Calendrier/Calendrier";
import Profile from "./components/pages/Profile/Profile";
import NotFound from "./components/pages/NotFound";
import Notification from "./components/pages/Notification/Notification";
import UpdateUtilisateur from "./components/pages/utilisateurUI/Actions/UpdateUtilisateur";



export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const authChecking = useAuthStore((state) => state.authChecking);
  const userData=useAuthStore((state)=>state.user)
  console.log("app",userData)
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (authChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="animate-spin transition" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes with Layout */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          {/* utilisateur admin*/}
          {userData?.role_utilisateur === "admin" ? (
            <>
              <Route path="/utilisateurs" element={<Utilisateur />} />
              <Route
                path="/utilisateur/ajouter"
                element={<AjouterUtilisateur />}
              />
              <Route
                path="/utilisateur/archive"
                element={<ArchiveUtilisateur />}
              />
              <Route
                path="/utilisateur/notification"
                element={<Notification />}
              />
            </>
          ) : null}

          {/* Other routes visible to all logged-in users */}
          <Route path="/clients" element={<Client />} />
          <Route path="/client/ajouter" element={<AjouterClient />} />
          <Route path="/client/Archive" element={<ArchiveClient />} />
          <Route path="/parametre" element={<Settings />} />
          <Route path="/tableau-de-bord" element={<Dashboard />} />
          <Route path="/calendrier" element={<Calendrier />} />
          <Route path="/utilisateur/profile" element={<Profile />} />
          <Route path="/utilisateur/modifier/:id" element={<UpdateUtilisateur />} />
        </Route>

 
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
