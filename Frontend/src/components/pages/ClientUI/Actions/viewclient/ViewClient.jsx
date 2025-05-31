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

        <TabsContent value="general" className="p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Personal/Company Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
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
                    icon={<Building2 className="h-5 w-5 text-blue-600" />}
                    label="Raison Sociale"
                    value={userData?.raisonSociale}
                    bgColor="bg-blue-50"
                  />
                  <InfoCard
                    icon={<CreditCard className="h-5 w-5 text-green-600" />}
                    label="CIN Client"
                    value={userData?.CIN_client}
                    bgColor="bg-green-50"
                  />
                  <InfoCard
                    icon={<MapPin className="h-5 w-5 text-purple-600" />}
                    label="Adresse"
                    value={userData?.adresse}
                    bgColor="bg-purple-50"
                  />
                  <InfoCard
                    icon={<Calendar className="h-5 w-5 text-orange-600" />}
                    label="Date de création"
                    value={formatDate(userData?.datecreation)}
                    bgColor="bg-orange-50"
                  />
                  <InfoCard
                    icon={<Users className="h-5 w-5 text-indigo-600" />}
                    label="Date de collaboration"
                    value={formatDate(userData?.date_collaboration)}
                    bgColor="bg-indigo-50"
                  />
                  <InfoCard
                    icon={<Clock className="h-5 w-5 text-gray-600" />}
                    label="Statut"
                    value={userData?.statut_client}
                    bgColor="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Fiscal & Legal Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
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
                    icon={<Hash className="h-5 w-5 text-red-600" />}
                    label="ID Fiscal"
                    value={userData?.id_fiscal}
                    bgColor="bg-red-50"
                  />
                  <InfoCard
                    icon={<Shield className="h-5 w-5 text-blue-600" />}
                    label="ICE"
                    value={userData?.ice}
                    bgColor="bg-blue-50"
                  />
                  <InfoCard
                    icon={<FileText className="h-5 w-5 text-green-600" />}
                    label="RC"
                    value={userData?.rc}
                    bgColor="bg-green-50"
                  />
                  <InfoCard
                    icon={<HandCoins className="h-5 w-5 text-yellow-600" />}
                    label="Taxe Professionnelle"
                    value={userData?.taxe_professionnelle}
                    bgColor="bg-yellow-50"
                  />
                  <InfoCard
                    icon={<Briefcase className="h-5 w-5 text-purple-600" />}
                    label="Activité"
                    value={userData?.activite}
                    bgColor="bg-purple-50"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
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
                    icon={<Mail className="h-5 w-5 text-blue-600" />}
                    label="Email"
                    value={userData?.email}
                    bgColor="bg-blue-50"
                  />
                  <InfoCard
                    icon={<Phone className="h-5 w-5 text-green-600" />}
                    label="Téléphone"
                    value={userData?.telephone}
                    bgColor="bg-green-50"
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

// Enhanced InfoCard component with modern design
const InfoCard = ({ icon, label, value, bgColor = "bg-gray-50" }) => {
  return (
    <div className="group hover:shadow-md transition-all duration-200 border border-gray-200 rounded-lg overflow-hidden">
      <div className={`${bgColor} px-4 py-3 border-b border-gray-200`}>
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
      </div>
      <div className="p-4 bg-white">
        <p className="text-gray-900 font-semibold text-base leading-relaxed break-words">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default ViewClient;
