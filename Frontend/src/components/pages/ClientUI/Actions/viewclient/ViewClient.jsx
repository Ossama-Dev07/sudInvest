import React, { useEffect, useState } from "react";
import { ChevronLeft, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import useClientStore from "@/store/useClientStore";
import { Card } from "@/components/ui/card";

const ViewClient = () => {
  const { id } = useParams();
  const {getClientById}=useClientStore()
  useEffect(() => {
    const loadUserData = async () => {
      if (id) {
        const userData = await getClientById(id);
        console.log("User data:", userData);
      }
    };

    loadUserData();
  }, [id, getClientById]);
  const [activeTab, setActiveTab] = useState("general");
  const client = {
    name: "Client Name",
    email: "contact@client.com",
    phone: "+212 6 00 00 00 00",
    status: "Active",
    company: "XYZ Consulting",
    activity: "Accounting",
    address: "123, Business Street, Casablanca",
    ice: "12345678",
    if: "456789",
    rc: "987654",
  };
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  return (
    <div className="w-full  mx-auto  rounded-lg  px-4">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="flex items-center text-blue-600 hover:text-blue-800 p-0"
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
              {client.avatar ? (
                <img
                  src={client.avatar}
                  alt={client.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-800">
                  <span className="text-2xl font-bold text-white">
                    {client.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{client.name}</h1>
            <div className="flex flex-col gap-1 text-gray-600">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>{client.phone}</span>
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "px-4 py-1 text-sm rounded-full",
              client.status === "Active"
                ? "bg-green-50 text-green-600 border-green-200"
                : "bg-gray-50 text-gray-600 border-gray-200"
            )}
          >
            {client.status}
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
              CNSS Info
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
              Fiscal Info
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
              Juridique Info
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className={cn(
                "flex-1 h-10 border-b-2 rounded-none data-[state=active]:shadow-none",
                activeTab === "documents"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              )}
            >
              Documents
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="p-6">
          <h2 className="text-2xl font-bold mb-6">General Info</h2>
          <div className="space-y-4">
            <InfoRow label="Company" value={client.company} />
            <InfoRow label="Activity" value={client.activity} />
            <InfoRow label="Address" value={client.address} />
            <InfoRow label="ICE" value={client.ice} />
            <InfoRow label="IF" value={client.if} />
            <InfoRow label="RC" value={client.rc} />
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

        <TabsContent value="documents" className="p-6">
          <h2 className="text-2xl font-bold mb-6">Documents</h2>
          <p className="text-gray-500">
            Client documents would be displayed here.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for info rows
const InfoRow = ({ label, value }) => {
  return (
    <div className="grid grid-cols-3 gap-4 py-2">
      <div className="text-gray-600">{label}</div>
      <div className="col-span-2 font-medium">{value}</div>
    </div>
  );
};

export default ViewClient;
