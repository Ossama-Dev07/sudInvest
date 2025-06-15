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
  Info,
  Users
} from "lucide-react";

export default function ViewAgo({ data }) {
  const renderAmount = (amount) => {
    if (!amount || parseFloat(amount) === 0) return "0,00 MAD";
    return new Intl.NumberFormat("fr-MA", {
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
    if (percentage === 100) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
    if (percentage >= 75) return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
    if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
    if (percentage >= 25) return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800";
    return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800";
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

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("fr-FR", {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const getDecisionTypeColor = (type) => {
    switch (type) {
      case "RAN":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "DISTRIBUTION":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  return (
    <DialogContent className="sm:max-w-5xl max-h-[90vh] p-0 bg-background border-border">
      <ScrollArea className="max-h-[90vh]">
        <div className="p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Détails de l'Assemblée Générale Ordinaire pour l'annee {data?.annee || "Non spécifiée"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Informations complètes de l'AGO et statut des étapes
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Client Information Card */}
            <Card className="border-l-4  border-l-blue-400 dark:border-l-blue-400 ">
              <CardHeader className="pb-3 bg-blue-50/50 dark:bg-blue-950/30">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Informations Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="font-medium">Nom Complet</span>
                    </div>
                    <p className="text-sm font-semibold pl-6 bg-muted p-2 rounded border border-border text-foreground">
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
                    <p className="text-sm font-semibold pl-6 bg-muted p-2 rounded border border-border text-foreground">
                      {data?.raisonSociale || "Non spécifiée"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AGO Details Card */}
            <Card className="border-l-4 border-l-purple-500 dark:border-l-purple-400  ">
              <CardHeader className="pb-3 bg-purple-50/50 dark:bg-purple-950/30">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Détails de l'AGO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Date AGO</span>
                    </div>
                    <Badge variant="outline" className="ml-6 font-semibold text-sm px-3 py-1 border-border text-foreground">
                      {formatDate(data?.ago_date)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span className="font-medium">Type de Décision</span>
                    </div>
                    <Badge className={`ml-6 font-semibold text-sm px-3 py-1 ${getDecisionTypeColor(data?.decision_type)}`}>
                      {data?.decision_type === "RAN" ? "Report à Nouveau" : 
                       data?.decision_type === "DISTRIBUTION" ? "Distribution" : 
                       data?.decision_type}
                    </Badge>
                  </div>

                  <div className="space-y-2">
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
              </CardContent>
            </Card>

            {/* Financial Details Card */}
            <Card className="border-l-4 border-l-green-500 dark:border-l-green-400 ">
              <CardHeader className="pb-3 bg-green-50/50 dark:bg-green-950/30">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Informations Financières
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Conditional display based on decision type */}
                {data?.decision_type === "RAN" ? (
                  // RAN Decision - Show only RAN amount
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">Report à Nouveau (RAN)</span>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800 text-sm font-medium text-blue-800 dark:text-blue-200">
                        {renderAmount(data?.ran_amount)}
                      </div>
                    </div>
                  </div>
                ) : data?.decision_type === "DISTRIBUTION" ? (
                  // DISTRIBUTION Decision - Show all amounts in consistent layout
                  <>
                    {/* First row: Résultat Comptable, RAN Antérieurs, Réserve Légale */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">Résultat Comptable</span>
                        </div>
                        <div className="p-3 bg-muted rounded border border-border text-sm font-medium text-foreground">
                          {renderAmount(data?.resultat_comptable)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">RAN Antérieurs</span>
                        </div>
                        <div className="p-3 bg-muted rounded border border-border text-sm font-medium text-foreground">
                          {renderAmount(data?.ran_anterieurs)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">Réserve Légale</span>
                        </div>
                        <div className="p-3 bg-muted rounded border border-border text-sm font-medium text-foreground">
                          {renderAmount(data?.reserve_legale)}
                        </div>
                      </div>
                    </div>

                    {/* Second row: Bénéfice Distribué, TPA, RAN */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">Bénéfice Distribué</span>
                        </div>
                        <div className="p-3 bg-muted rounded border border-border text-sm font-medium text-foreground">
                          {renderAmount(data?.benefice_distribue)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">Montant TPA</span>
                        </div>
                        <div className="p-3 bg-muted rounded border border-border text-sm font-medium text-foreground">
                          {renderAmount(data?.tpa_amount)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">Montant RAN</span>
                        </div>
                        <div className="p-3 bg-muted rounded border border-border text-sm font-medium text-foreground">
                          {renderAmount(data?.ran_amount)}
                        </div>
                      </div>
                    </div>

                    {/* Third row: Dividendes Nets (centered) */}
                    <div className="flex justify-center mb-4">
                      <div className="w-full md:w-1/3 space-y-2">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">Dividendes Nets</span>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800 text-sm font-medium text-center text-blue-800 dark:text-blue-200">
                          {renderAmount(data?.dividendes_nets)}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Fallback for unknown decision types
                  <div className="text-center py-4 text-muted-foreground">
                    <Info className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm">Type de décision non reconnu</p>
                  </div>
                )}

                {/* General Comment if exists */}
                {data?.commentaire && (
                  <>
                    <Separator className="bg-border" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">Commentaire Général</span>
                      </div>
                      <div className="bg-muted p-3 rounded border border-border text-sm leading-relaxed text-foreground">
                        {data.commentaire}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Legal Steps Progress Card */}
            <Card className="border-l-4 border-l-indigo-500 dark:border-l-indigo-400 ">
              <CardHeader className="pb-3 bg-indigo-50/50 dark:bg-indigo-950/30">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Étapes de l'AGO
                  <Badge variant="outline" className="ml-auto border-border text-foreground">
                    {completedSteps}/{totalSteps} terminées
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
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
                      <div key={etape.nom || index} className="border border-border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow bg-card">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-foreground">{etape.titre}</h4>
                          {getStatusBadge(etape.statut)}
                        </div>
                        
                        {etape.commentaire && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground font-medium">Commentaire:</span>
                            <p className="text-xs text-foreground bg-muted p-3 rounded border border-border leading-relaxed">
                              {etape.commentaire}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Empty state */}
                  {etapes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm">Aucune étape définie pour cette AGO</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="mt-6 pt-6 border-t border-border bg-muted/30">
            <DialogClose>
              <Button variant="outline" className="w-full sm:w-auto px-6 border-border text-foreground hover:bg-muted">
                Fermer
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}