import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  Building2, 
  Calendar, 
  DollarSign, 
  FileText, 
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Info
} from "lucide-react";

export default function ViewHistoriuqe({ data }) {
  const renderAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MAD",
    }).format(amount);
  };

  // Calculate progress
  const etapes = data?.etapes || [];
  const totalSteps = etapes.length;
  const completedSteps = etapes.filter(etape => etape.statut === "oui").length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const getProgressColor = (percentage) => {
    if (percentage === 100) return "text-green-500 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
    if (percentage >= 75) return "text-blue-500 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
    if (percentage >= 50) return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
    if (percentage >= 25) return "text-orange-500 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800";
    return "text-gray-500 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800";
  };

  const getProgressIcon = (percentage) => {
    if (percentage === 100) return <CheckCircle2 className="w-5 h-5" />;
    if (percentage > 0) return <TrendingUp className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getStatusBadge = (statut) => {
    if (statut === "oui") {
      return (
        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Terminé
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900">
        <XCircle className="w-3 h-3 mr-1" />
        Non terminé
      </Badge>
    );
  };

  return (
    <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 bg-background border-border">
      <ScrollArea className="max-h-[90vh]">
        <div className="p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Détails de l'Historique Juridique
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Informations complètes et statut des étapes juridiques
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Client Information Card */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Informations Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="font-medium">Nom Complet</span>
                    </div>
                    <p className="text-sm font-semibold pl-6 text-foreground">
                      {data?.client_nom || data?.client_prenom
                        ? `${data?.client_nom || ""} ${data?.client_prenom || ""}`.trim()
                        : "Non spécifié"}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">Raison Sociale</span>
                    </div>
                    <p className="text-sm font-semibold pl-6 text-foreground">
                      {data?.raisonSociale || "Non spécifiée"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Details Card */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Détails du Projet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span className="font-medium">Objet</span>
                    </div>
                    <Badge variant="outline" className="ml-6 font-semibold border-border text-foreground">
                      {data?.objet}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Date de Modification</span>
                    </div>
                    <p className="text-sm font-semibold pl-6 text-foreground">
                      {data?.date_modification}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">Montant</span>
                    </div>
                    <Badge className="ml-6 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900 font-bold">
                      {renderAmount(data?.montant)}
                    </Badge>
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-medium">Progression</span>
                    </div>
                    <div className={`ml-6 flex items-center gap-2 px-3 py-2 rounded-lg border ${getProgressColor(progressPercentage)}`}>
                      {getProgressIcon(progressPercentage)}
                      <span className="font-bold">{progressPercentage}%</span>
                      <span className="text-xs">({completedSteps}/{totalSteps} étapes)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="w-4 h-4" />
                    <span className="font-medium">Description</span>
                  </div>
                  <div className="ml-6 p-3 bg-muted rounded-lg border border-border">
                    <p className="text-sm text-foreground leading-relaxed">
                      {data?.description || "Aucune description fournie"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Steps Progress Card */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Étapes Juridiques
                  <Badge variant="outline" className="ml-auto border-border text-foreground">
                    {completedSteps}/{totalSteps} terminées
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${
                        progressPercentage === 100 ? "bg-green-500" :
                        progressPercentage >= 75 ? "bg-blue-500" :
                        progressPercentage >= 50 ? "bg-yellow-500" :
                        progressPercentage >= 25 ? "bg-orange-500" :
                        "bg-gray-300 dark:bg-gray-600"
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* Steps List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {etapes.map((etape, index) => (
                      <div key={etape.nom} className="border border-border rounded-lg p-4 space-y-3 bg-card">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-foreground">{etape.titre}</h4>
                          {getStatusBadge(etape.statut)}
                        </div>
                        
                        {etape.commentaire && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground font-medium">Commentaire:</span>
                            <p className="text-xs text-foreground bg-muted p-2 rounded border border-border leading-relaxed">
                              {etape.commentaire}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="mt-6 pt-4 border-t border-border">
            <DialogClose>
            <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-muted">
              Fermer
            </Button>
          </DialogClose>
          </DialogFooter>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}