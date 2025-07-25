import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from "react-router-dom";
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
import AjouterClient from "./components/pages/ClientUI/Actions/AjouterClient";
import ArchiveClient from "./components/pages/ClientUI/archiveClient/ArchiveClient";
import Dashboard from "./components/pages/Dashboard/Dashboard";
import Calendrier from "./components/pages/Calendrier/Calendrier";
import Profile from "./components/pages/Profile/Profile";
import NotFound from "./components/pages/NotFound";
import UpdateUtilisateur from "./components/pages/utilisateurUI/Actions/UpdateUtilisateur";
import ResetPassword from "./components/pages/login/ResetPassword";
import ForgotPassword from "./components/pages/login/ForgotPassword";
import UpdateClient from "./components/pages/ClientUI/Actions/UpdateClient";
import HistoriqueJuridique from "./components/pages/HistoriqueJuridique/HistoriqueJuridique";
import ViewClient from "./components/pages/ClientUI/Actions/viewclient/ViewClient";
import AjouterHistorique from "./components/pages/HistoriqueJuridique/Actions/AjouterHistorique";
import UpdatHistorique from "./components/pages/HistoriqueJuridique/Actions/UpdatHistorique";
import AGO from "./components/pages/AGO/AGO";
import AjouterAGO from "./components/pages/AGO/Actions/AjouterAGO";
import UpdateAGO from "./components/pages/AGO/Actions/UpdateAGO";
import HistoriqueFiscal from "./components/pages/HitsoriqueFiscal/HistoriqueFiscal";
import AjouterHistoriqueFiscal from "./components/pages/HitsoriqueFiscal/Actions/AjouterFiscal/AjouterHistoriqueFiscal";
import ViewHisToriqueFiscal from "./components/pages/HitsoriqueFiscal/Actions/ViewHisToriqueFiscal";
import UpdateHistoriqueFiscal from "./components/pages/HitsoriqueFiscal/Actions/UpdateHistoriqueFiscal";

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const authChecking = useAuthStore((state) => state.authChecking);
  const userData = useAuthStore((state) => state.user);
  console.log("app", userData);
  
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

  // Create routes based on user role
  const createAppRoutes = () => {
    return createRoutesFromElements(
      <>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <PublicRoute>
              <ResetPassword />
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
          {/* Admin-only routes */}
          {userData?.role_utilisateur === "admin" && (
            <>
              <Route path="/utilisateurs" element={<Utilisateur />} />
              <Route path="/utilisateurs/ajouter" element={<AjouterUtilisateur />} />
              <Route path="/utilisateurs/archive" element={<ArchiveUtilisateur />} />
          
              <Route path="/utilisateurs/modifier/:id" element={<UpdateUtilisateur />} />
            </>
          )}

          {/* Routes for all authenticated users */}
          <Route path="/utilisateurs/profile" element={<Profile />} />

          <Route path="/clients" element={<Client />} />
          <Route path="/clients/ajouter" element={<AjouterClient />} />
          <Route path="/clients/Archive" element={<ArchiveClient />} />
          <Route path="/clients/modifier/:id" element={<UpdateClient />} />
          <Route path="/clients/voir-details/:id" element={<ViewClient />} />

          <Route path="/historique_juridique" element={<HistoriqueJuridique />} />
          <Route path="/historique_juridique/ajouter" element={<AjouterHistorique />} />
          <Route path="/historique_juridique/modifier/:id" element={<UpdatHistorique />} />
          
          <Route path="/Assemblee_Generale_ordinaire" element={<AGO />} />
          <Route path="/Assemblee_Generale_ordinaire/ajouter" element={<AjouterAGO />} />
          <Route path="/Assemblee_Generale_ordinaire/modifier/:id" element={<UpdateAGO />} />

          <Route path="/historique_fiscal" element={<HistoriqueFiscal/>}/>
          <Route path="/historique_fiscal/ajouter" element={<AjouterHistoriqueFiscal/>}/>
          <Route path="/historique_fiscal/voir-details/:id" element={<ViewHisToriqueFiscal/>}/>
          <Route path="/historique_fiscal/modifier/:id" element={<UpdateHistoriqueFiscal/>}/>

          <Route path="/parametre" element={<Settings />} />
          <Route path="/tableau-de-bord" element={<Dashboard />} />
          <Route path="/calendrier" element={<Calendrier />} />
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
      </>
    );
  };

  // Create router with future flag
  const router = createBrowserRouter(createAppRoutes(), {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  });

  return <RouterProvider router={router} />;
}