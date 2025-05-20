import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Shield,
  User,
  Settings,
  Clock,
} from "lucide-react";
import useInitials from "@/hooks/useInitials";

export default function Vue({ utilisateur }) {
  // Mock user data - in a real application, this would come from props or context

  const formatLastActive = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const time = timeFormatter.format(date);

    if (isToday) {
      return `Aujourd'hui à ${time}`;
    }

    const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    return `${dateFormatter.format(date)} à ${time}`;
  };

  return (
    <div className="w-full max-w-md mx-auto py-3">
      <SheetHeader className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <SheetTitle className="text-xl font-bold">
              Profil d'utilisateur
            </SheetTitle>
            <SheetDescription>
              Affichage des informations détaillées sur l'utilisateur
            </SheetDescription>
          </div>
          <Badge className="bg-green-500">
            {utilisateur.statut_utilisateur === "actif" ? "Actif" : null}
          </Badge>
        </div>
      </SheetHeader>

      {/* User Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-blue-500 text-white text-lg">
            {useInitials(
              utilisateur.nom_utilisateur,
              utilisateur.prenom_utilisateur
            )}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-lg capitalize text-gray-800 dark:text-gray-300">
            {utilisateur.nom_utilisateur} {utilisateur.prenom_utilisateur}
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <User className="mr-1 h-3 w-3" /> @{utilisateur.nom_utilisateur}
          </div>
          <div className="flex items-center mt-1">
            {utilisateur.role_utilisateur === "admin" ? (
              <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-100 capitalize">
                {utilisateur.role_utilisateur}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-800 border-purple-200 capitalize h"
              >
                {utilisateur.role_utilisateur}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for organized data */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="info">Infos</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium mr-2">Email:</span>
                  <span className="text-sm text-gray-600">
                    {utilisateur.email_utilisateur}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium mr-2">Téléphone:</span>
                  <span className="text-sm text-gray-600">
                    {utilisateur.Ntele_utilisateur}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium mr-2 ">Adresse:</span>
                  <span className="text-sm text-gray-600">
                    {utilisateur.adresse_utilisateur}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium mr-2">Inscrit le:</span>
                  <span className="text-sm text-gray-600">
                    {utilisateur.dateIntri_utilisateur}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium mr-2">Dernière activité:</span>
                <span className="text-sm text-gray-600">
                  {formatLastActive(utilisateur.last_active)}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <Shield className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium mr-2">ID du compte:</span>
                <span className="text-sm text-gray-600">{utilisateur.id_utilisateur}</span>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Authentification à deux facteurs</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Activé
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Email de récupération</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Vérifié
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    <span className="text-sm">Force du mot de passe</span>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    Moyenne
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <SheetFooter className="mt-6 flex space-x-2">
        <SheetClose asChild>
          <Button variant="outline">Fermer</Button>
        </SheetClose>
      </SheetFooter>
    </div>
  );
}