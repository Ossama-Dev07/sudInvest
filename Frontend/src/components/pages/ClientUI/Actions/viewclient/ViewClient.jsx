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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import useClientStore from "@/store/useClientStore";
import { Card } from "@/components/ui/card";

const ViewClient = () => {
  const { id } = useParams();
  const { getClientById, isLoading } = useClientStore();
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();

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
            <Button variant="outline" className="px-6">
              Edit
            </Button>
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden">
              {userData?.nom_client && userData?.prenom_client && (
                <div className="h-full w-full flex items-center justify-center bg-gray-800">
                  <span className="text-2xl font-bold text-white capitalize">
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

          <div className="flex-1">
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
              "px-4 py-1 text-sm rounded-full capitalize",
              userData?.statut_client === "actif"
                ? "bg-green-50 text-green-600 border-green-200"
                : "bg-gray-50 text-gray-600 border-gray-200"
            )}
          >
            {userData?.statut_client || "active"}
          </Badge>
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

        <TabsContent value="general" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 ">
              <h3 className="text-xl font-bold mb-4 border-b pb-2 text-blue-700">
                Client Information
              </h3>
              <div className="space-y-3">
                <InfoRow
                  label="Raison Sociale"
                  value={userData?.raisonSociale}
                />
                <InfoRow label="CIN Client" value={userData?.CIN_client} />
                <InfoRow label="Adresse" value={userData?.adresse} />
                <InfoRow
                  label="Date de création"
                  value={formatDate(userData?.datecreation)}
                />
                <InfoRow
                  label="Date de collaboration"
                  value={formatDate(userData?.date_collaboration)}
                />
              </div>
            </Card>

            <Card className="p-6 ">
              <h3 className="text-xl font-bold mb-4 border-b pb-2 text-blue-700">
                Informations Fiscales et Juridiques
              </h3>
              <div className="space-y-3">
                <InfoRow label="ID Fiscal" value={userData?.id_fiscal} />
                <InfoRow label="ICE" value={userData?.ice} />
                <InfoRow label="RC" value={userData?.rc} />
                <InfoRow label="Taxe Professionnelle" />
                <InfoRow icon={<Briefcase size={18} />} label="Activité" />
              </div>
            </Card>
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
          <h2 className="text-2xl font-bold mb-6">Juridique Info</h2>
          <p className="text-gray-500">
            Juridique information would be displayed here.
          </p>
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

// Helper component for info rows with icons
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
