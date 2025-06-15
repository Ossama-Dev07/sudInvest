import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  ArrowLeft,
  Save,
  User,
  Building2,
  Target,
  Calendar,
  Info,
  LoaderCircle,
} from "lucide-react";
import useHistoriqueJuridiqueStore from "@/store/HistoriqueJuridiqueStore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateHistorique() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    updateHistorique,
    fetchHistoriques,
    fetchHistoriqueById,
    currentHistorique,
  } = useHistoriqueJuridiqueStore();
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormState, setInitialFormState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state - only for débours
  const [debours, setDebours] = useState("");

  // Etapes state
  const [etapes, setEtapes] = useState([]);
  const [initialEtapes, setInitialEtapes] = useState([]);

  // Error state
  const [errors, setErrors] = useState({
    debours: "",
    etapes: {},
  });

  // Fetch the historique data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        await fetchHistoriqueById(id);
        setLoading(false);
      }
    };
    loadData();
  }, [id, fetchHistoriqueById]);

  // Load data into form when currentHistorique changes
  useEffect(() => {
    if (currentHistorique) {
      // Set débours
      setDebours(currentHistorique.debours?.toString() || "");

      // Set etapes
      const currentEtapes = currentHistorique.etapes || [];
      setEtapes(currentEtapes);
      setInitialEtapes(JSON.parse(JSON.stringify(currentEtapes)));

      // Set initial state for change detection
      setInitialFormState({
        debours: currentHistorique.debours?.toString() || "",
        etapes: JSON.parse(JSON.stringify(currentEtapes)),
      });

      setHasChanges(false);
    }
  }, [currentHistorique]);

  // Check for changes to enable/disable the save button
  useEffect(() => {
    if (initialFormState) {
      const currentState = {
        debours: debours,
        etapes: etapes,
      };

      const hasFormChanges =
        JSON.stringify(currentState) !== JSON.stringify(initialFormState);
      setHasChanges(hasFormChanges);
    }
  }, [debours, etapes, initialFormState]);

  // Handle etape change
  const handleEtapeChange = (etapeIndex, field, value) => {
    setEtapes((prev) => {
      const newEtapes = [...prev];
      newEtapes[etapeIndex] = { ...newEtapes[etapeIndex], [field]: value };
      return newEtapes;
    });

    // Clear error for this etape
    setErrors((prev) => ({
      ...prev,
      etapes: {
        ...prev.etapes,
        [etapeIndex]: { ...prev.etapes[etapeIndex], [field]: "" },
      },
    }));
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = { debours: "", etapes: {} };

    // Validate débours if provided
    if (debours && isNaN(parseFloat(debours))) {
      newErrors.debours = "Le débours doit être un nombre";
      isValid = false;
    }

    // Validate etapes (optional - can be empty)
    etapes.forEach((etape, index) => {
      if (!etape.statut) {
        newErrors.etapes[index] = {
          ...newErrors.etapes[index],
          statut: "Le statut est requis",
        };
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle submit
  const handleSubmitHistory = async () => {
    if (validateForm()) {
      const formattedData = {
        debours: debours ? parseFloat(debours) : null,
        etapes: etapes.map((etape) => ({
          id: etape.id,
          nom: etape.nom,
          titre: etape.titre,
          statut: etape.statut,
          commentaire: etape.commentaire || "",
        })),
      };

      console.log("Données à mettre à jour:", formattedData);

      try {
        await updateHistorique(currentHistorique?.id, formattedData);
        await fetchHistoriques();
        navigate("/historique_juridique");
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
      }
    } else {
      console.log("Le formulaire contient des erreurs");
    }
  };

  // Format client name/company for display
  const clientDisplay = currentHistorique?.raisonSociale
    ? currentHistorique.raisonSociale
    : `${currentHistorique?.client_prenom || ""} ${
        currentHistorique?.client_nom || ""
      }`.trim();

  // Calculate progress
  const totalSteps = etapes.length;
  const completedSteps = etapes.filter(
    (etape) => etape.statut === "oui"
  ).length;
  const progressPercentage =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

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
      <Badge
        variant="secondary"
        className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900"
      >
        <XCircle className="w-3 h-3 mr-1" />
        Non terminé
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <LoaderCircle className="animate-spin text-primary" />
      </div>
    );
  }
  if (!currentHistorique) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Historique non trouvé
          </h2>
          <p className="text-muted-foreground mb-4">
            L'historique juridique demandé n'existe pas.
          </p>
          <Button
            onClick={() => navigate("/historique_juridique")}
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Read-only Information Card */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <FileText className="w-5 h-5 text-muted-foreground" />
                Informations du Dossier (Lecture seule)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <Label>Client</Label>
                </div>
                <div className="p-3 bg-muted rounded border border-border text-sm font-medium text-foreground">
                  {clientDisplay}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <Label>Objet</Label>
                </div>
                <div className="p-3 bg-muted rounded border border-border text-sm text-foreground">
                  {currentHistorique?.objet}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <Label>Montant</Label>
                </div>
                <div className="p-3 bg-muted rounded border border-border text-sm text-foreground">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MAD",
                  }).format(currentHistorique?.montant || 0)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <Label>Date de modification</Label>
                </div>
                <div className="p-3 bg-muted rounded border border-border text-sm text-foreground">
                  {currentHistorique?.date_modification}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="w-4 h-4" />
                  <Label>Description</Label>
                </div>
                <div className="p-3 bg-muted rounded border border-border text-sm text-foreground">
                  {currentHistorique?.description}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Débours Section */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                Débours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-2">
                <Label htmlFor="debours" className="text-foreground">Montant des débours</Label>
                <Input
                  id="debours"
                  type="number"
                  step="0.01"
                  value={debours}
                  onChange={(e) => {
                    setDebours(e.target.value);
                    setErrors((prev) => ({ ...prev, debours: "" }));
                  }}
                  className={`bg-background text-foreground border-border ${errors.debours ? "border-red-500" : ""}`}
                  placeholder="0.00"
                />
                {errors.debours && (
                  <p className="text-red-500 text-sm">{errors.debours}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Etapes Section */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Étapes Juridiques
                </CardTitle>
                <Badge variant="outline" className="text-sm border-border text-foreground">
                  {completedSteps}/{totalSteps} terminées ({progressPercentage}
                  %)
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${
                      progressPercentage === 100
                        ? "bg-green-500"
                        : progressPercentage >= 75
                        ? "bg-blue-500"
                        : progressPercentage >= 50
                        ? "bg-yellow-500"
                        : progressPercentage >= 25
                        ? "bg-orange-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Etapes Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {etapes.map((etape, index) => (
                    <Card key={etape.id || index} className="border-2 border-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base text-foreground">
                            {etape.titre}
                          </CardTitle>
                          {getStatusBadge(etape.statut)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Status Selection */}
                        <div className="space-y-2">
                          <Label className="text-foreground">
                            Statut <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={etape.statut}
                            onValueChange={(value) =>
                              handleEtapeChange(index, "statut", value)
                            }
                          >
                            <SelectTrigger
                              className={`bg-background text-foreground border-border ${
                                errors.etapes[index]?.statut
                                  ? "border-red-500"
                                  : ""
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-border">
                              <SelectItem value="non" className="text-foreground hover:bg-muted">Non terminé</SelectItem>
                              <SelectItem value="oui" className="text-foreground hover:bg-muted">Terminé</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.etapes[index]?.statut && (
                            <p className="text-red-500 text-sm">
                              {errors.etapes[index].statut}
                            </p>
                          )}
                        </div>

                        {/* Commentaire */}
                        <div className="space-y-2">
                          <Label className="text-foreground">Commentaire</Label>
                          <Textarea
                            value={etape.commentaire || ""}
                            onChange={(e) =>
                              handleEtapeChange(
                                index,
                                "commentaire",
                                e.target.value
                              )
                            }
                            rows={3}
                            className="bg-background text-foreground border-border"
                            placeholder={`Commentaire pour ${etape.titre}...`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 bg-background border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {hasChanges ? (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ Modifications non sauvegardées
                  </span>
                ) : (
                  <span className="text-green-600 dark:text-green-400">✅ Aucune modification</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/historique_juridique")}
                className="border-border text-foreground hover:bg-muted"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmitHistory}
                disabled={!hasChanges}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}