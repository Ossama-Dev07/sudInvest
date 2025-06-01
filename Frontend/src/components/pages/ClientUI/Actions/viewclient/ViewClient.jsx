import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  LoaderCircle,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Hash,
  FileText,
  Plus,
  User,
  Building2,
  CreditCard,
  HandCoins,
  Receipt,
  Shield,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import useClientStore from "@/store/useClientStore";
import { Card } from "@/components/ui/card";
import Juridique from "./JuridiqueHistory";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import useAuthStore from "@/store/AuthStore";

const ViewClient = () => {
  const { id } = useParams();
  const { getClientById, isLoading, deactivateClient } = useClientStore();
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const role_utilisateur = useAuthStore(
    (state) => state.user?.role_utilisateur
  );
  const isAdmin = role_utilisateur === "admin";

  useEffect(() => {
    const loadUserData = async () => {
      if (id) {
        const data = await getClientById(id);
        console.log("Fetched client data:", data);
        setUserData(data);
      }
    };

    loadUserData();
  }, [id, getClientById]);

  const [activeTab, setActiveTab] = useState("general");

  const handleTabChange = (value) => {
    setActiveTab(value);
  };
  const handleDelete = async () => {
    const result = await deactivateClient(id);
    navigate("/clients");
  };

  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="animate-spin transition" />
      </div>
    );

  return (
    <div className="w-full mx-auto rounded-lg px-4">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="flex items-center text-blue-600 hover:text-blue-800 p-0"
            onClick={() => navigate("/clients")}
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            <span>Back</span>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="px-6"
              onClick={() => navigate(`/clients/modifier/${id}`)}
            >
              Edit
            </Button>
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 px-6"
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Êtes-vous absolument sûr ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action ne peut pas être annulée. L'client sera
                      déplacé dans les archives et ne sera plus actif.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleDelete}>
                      Continue
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 md:h-24 md:w-24 rounded-full bg-gray-200 overflow-hidden">
              {userData?.nom_client && userData?.prenom_client && (
                <div className="h-full w-full flex items-center justify-center bg-gray-800">
                  <span className="text-xl md:text-2xl font-bold text-white capitalize">
                    {userData.nom_client.charAt(0)}
                    {userData.prenom_client.charAt(0)}
                  </span>
                </div>
              )}
              {userData?.raisonSociale && (
                <div className="h-full w-full flex items-center justify-center bg-gray-800">
                  <span className="text-2xl font-bold text-white capitalize">
                    {userData.raisonSociale.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 md:flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 capitalize">
                {userData?.nom_client && userData?.prenom_client
                  ? `${userData.nom_client} ${userData.prenom_client}`
                  : userData?.raisonSociale}
              </h1>
              <div className="flex flex-col gap-1 text-gray-600">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{userData?.email || "No email provided"}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{userData?.telephone || "No phone provided"}</span>
                </div>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "px-4 py-1 my-4 text-sm rounded-full capitalize",
                userData?.statut_client === "actif"
                  ? "bg-green-50 text-green-600 border-green-200"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              )}
            >
              {userData?.statut_client || "active"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="general"
        className="w-full"
        onValueChange={handleTabChange}
      >
        <div className="border-b">
          <TabsList className="flex h-10 bg-transparent border-b-0">
            <TabsTrigger
              value="general"
              className={cn(
                "flex-1 h-10 border-b-2 rounded-none data-[state=active]:shadow-none",
                activeTab === "general"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              )}
            >
              Informations générales
            </TabsTrigger>
            <TabsTrigger
              value="cnss"
              className={cn(
                "flex-1 h-10 border-b-2 rounded-none data-[state=active]:shadow-none",
                activeTab === "cnss"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              )}
            >
              CNSS
            </TabsTrigger>
            <TabsTrigger
              value="fiscal"
              className={cn(
                "flex-1 h-10 border-b-2 rounded-none data-[state=active]:shadow-none",
                activeTab === "fiscal"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              )}
            >
              Historique Fiscale
            </TabsTrigger>
            <TabsTrigger
              value="juridique"
              className={cn(
                "flex-1 h-10 border-b-2 rounded-none data-[state=active]:shadow-none",
                activeTab === "juridique"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              )}
            >
              Historique Juridique
            </TabsTrigger>
            <TabsTrigger
              value="Impots"
              className={cn(
                "flex-1 h-10 border-b-2 rounded-none data-[state=active]:shadow-none",
                activeTab === "Impots"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              )}
            >
              Impots
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="p-6 bg-muted/30">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Personal/Company Information Section */}
            <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 dark:bg-black/20 rounded-lg">
                    {userData?.raisonSociale ? (
                      <Building2 className="h-5 w-5 text-white" />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {userData?.raisonSociale
                      ? "Informations Société"
                      : "Informations Client"}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoCard
                    icon={
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    }
                    label="Raison Sociale"
                    value={userData?.raisonSociale}
                    bgColor="bg-blue-50 dark:bg-blue-950/50"
                  />
                  <InfoCard
                    icon={
                      <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                    }
                    label="CIN Client"
                    value={userData?.CIN_client}
                    bgColor="bg-green-50 dark:bg-green-950/50"
                  />
                  <InfoCard
                    icon={
                      <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    }
                    label="Adresse"
                    value={userData?.adresse}
                    bgColor="bg-purple-50 dark:bg-purple-950/50"
                  />
                  <InfoCard
                    icon={
                      <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    }
                    label="Date de création"
                    value={formatDate(userData?.datecreation)}
                    bgColor="bg-orange-50 dark:bg-orange-950/50"
                  />
                  <InfoCard
                    icon={
                      <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    }
                    label="Date de collaboration"
                    value={formatDate(userData?.date_collaboration)}
                    bgColor="bg-indigo-50 dark:bg-indigo-950/50"
                  />
                </div>
              </div>
            </div>

            {/* Fiscal & Legal Information Section */}
            <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 dark:bg-black/20 rounded-lg">
                    <Receipt className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Informations Fiscales et Juridiques
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoCard
                    icon={
                      <Hash className="h-5 w-5 text-red-600 dark:text-red-400" />
                    }
                    label="ID Fiscal"
                    value={userData?.id_fiscal}
                    bgColor="bg-red-50 dark:bg-red-950/50"
                  />
                  <InfoCard
                    icon={
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    }
                    label="ICE"
                    value={userData?.ice}
                    bgColor="bg-blue-50 dark:bg-blue-950/50"
                  />
                  <InfoCard
                    icon={
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    }
                    label="RC"
                    value={userData?.rc}
                    bgColor="bg-green-50 dark:bg-green-950/50"
                  />
                  <InfoCard
                    icon={
                      <HandCoins className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    }
                    label="Taxe Professionnelle"
                    value={userData?.taxe_professionnelle}
                    bgColor="bg-yellow-50 dark:bg-yellow-950/50"
                  />
                  <InfoCard
                    icon={
                      <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    }
                    label="Activité"
                    value={userData?.activite}
                    bgColor="bg-purple-50 dark:bg-purple-950/50"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-500 dark:to-slate-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 dark:bg-black/20 rounded-lg">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Informations de Contact
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoCard
                    icon={
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    }
                    label="Email Principal"
                    value={userData?.email}
                    bgColor="bg-blue-50 dark:bg-blue-950/50"
                  />
                  <InfoCard
                    icon={
                      <Mail className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    }
                    label="Email Secondaire"
                    value={userData?.email_2}
                    bgColor="bg-cyan-50 dark:bg-cyan-950/50"
                  />
                  <InfoCard
                    icon={
                      <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                    }
                    label="Téléphone Principal"
                    value={userData?.telephone}
                    bgColor="bg-green-50 dark:bg-green-950/50"
                  />
                  <InfoCard
                    icon={
                      <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    }
                    label="Téléphone Secondaire"
                    value={userData?.telephone2}
                    bgColor="bg-emerald-50 dark:bg-emerald-950/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cnss" className="p-6">
          <h2 className="text-2xl font-bold mb-6">CNSS Info</h2>
          <p className="text-gray-500">
            CNSS information would be displayed here.
          </p>
        </TabsContent>

        <TabsContent value="fiscal" className="p-6">
          <h2 className="text-2xl font-bold mb-6">Fiscal Info</h2>
          <p className="text-gray-500">
            Fiscal information would be displayed here.
          </p>
        </TabsContent>

        <TabsContent value="juridique" className="p-6">
          <Juridique idClient={userData?.id_client} />
        </TabsContent>

        <TabsContent value="Impots" className="p-6">
          <h2 className="text-2xl font-bold mb-6">Impots</h2>
          <p className="text-gray-500">
            Client Impots would be displayed here.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Enhanced InfoCard component with modern design and dark mode support
const InfoCard = ({
  icon,
  label,
  value,
  bgColor = "bg-muted dark:bg-muted/50",
}) => {
  return (
    <div className="group hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 border rounded-lg overflow-hidden hover:scale-105">
      <div className={`${bgColor} px-4 py-3 border-b`}>
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium text-foreground/80">
            {label}
          </span>
        </div>
      </div>
      <div className="p-4 bg-card">
        <p className="text-foreground font-semibold text-base leading-relaxed break-words">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
};

// Keep the old InfoRow component for compatibility
const InfoRow = ({ icon, label, value }) => {
  return (
    <div className="flex items-start py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="font-medium">{value || "N/A"}</div>
      </div>
    </div>
  );
};

export default ViewClient;