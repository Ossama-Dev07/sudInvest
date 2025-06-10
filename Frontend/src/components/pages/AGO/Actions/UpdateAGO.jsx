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
  TrendingUp,
} from "lucide-react";
import useAgoStore from "@/store/AgoStore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateAGO() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    updateAgo,
    fetchAgos,
    fetchAgoById,
    currentAgo,
  } = useAgoStore();
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormState, setInitialFormState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state - only for annee
  const [annee, setAnnee] = useState("");

  // Etapes state
  const [etapes, setEtapes] = useState([]);
  const [initialEtapes, setInitialEtapes] = useState([]);

  // Error state
  const [errors, setErrors] = useState({
    annee: "",
    etapes: {},
  });

  // Fetch the AGO data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        await fetchAgoById(id);
        setLoading(false);
      }
    };
    loadData();
  }, [id, fetchAgoById]);

  // Load data into form when currentAgo changes
  useEffect(() => {
    if (currentAgo) {
      // Set annee
      setAnnee(currentAgo.annee?.toString() || "");

      // Set etapes
      const currentEtapes = currentAgo.etapes || [];
      setEtapes(currentEtapes);
      setInitialEtapes(JSON.parse(JSON.stringify(currentEtapes)));

      // Set initial state for change detection
      setInitialFormState({
        annee: currentAgo.annee?.toString() || "",
        etapes: JSON.parse(JSON.stringify(currentEtapes)),
      });

      setHasChanges(false);
    }
  }, [currentAgo]);

  // Check for changes to enable/disable the save button
  useEffect(() => {
    if (initialFormState) {
      const currentState = {
        annee: annee,
        etapes: etapes,
      };

      const hasFormChanges =
        JSON.stringify(currentState) !== JSON.stringify(initialFormState);
      setHasChanges(hasFormChanges);
    }
  }, [annee, etapes, initialFormState]);

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
    const newErrors = { annee: "", etapes: {} };

    // Validate annee if provided
    if (annee && (isNaN(parseInt(annee)) || parseInt(annee) < 1900 || parseInt(annee) > 2100)) {
      newErrors.annee = "L'année doit être un nombre valide entre 1900 et 2100";
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
  const handleSubmitAGO = async () => {
    if (validateForm()) {
      const formattedData = {
        annee: annee ? parseInt(annee) : null,
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
        await updateAgo(currentAgo?.id, formattedData);
        await fetchAgos();
        navigate("/Assemblee_Generale_ordinaire");
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
      }
    } else {
      console.log("Le formulaire contient des erreurs");
    }
  };

  // Format client name/company for display
  const clientDisplay = currentAgo?.raisonSociale
    ? currentAgo.raisonSociale
    : `${currentAgo?.client_prenom || ""} ${
        currentAgo?.client_nom || ""
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
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Terminé
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="bg-red-100 text-red-800 hover:bg-red-100"
      >
        <XCircle className="w-3 h-3 mr-1" />
        Non terminé
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="animate-spin transition" />
      </div>
    );
  }

  if (!currentAgo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            AGO non trouvée
          </h2>
          <p className="text-gray-600 mb-4">
            L'Assemblée Générale Ordinaire demandée n'existe pas.
          </p>
          <Button
            onClick={() => navigate("/Assemblee_Generale_ordinaire")}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Read-only Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Informations de l'AGO (Lecture seule)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <Label>Client</Label>
                </div>
                <div className="p-3 bg-gray-50 rounded border text-sm font-medium">
                  {clientDisplay}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  <Label>Type de décision</Label>
                </div>
                <div className="p-3 bg-gray-50 rounded border text-sm">
                  {currentAgo?.decision_type}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <Label>Date AGO</Label>
                </div>
                <div className="p-3 bg-gray-50 rounded border text-sm">
                  {currentAgo?.ago_date}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <Label>Montant RAN</Label>
                </div>
                <div className="p-3 bg-gray-50 rounded border text-sm">
                  {currentAgo?.ran_amount ? 
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "MAD",
                    }).format(currentAgo?.ran_amount || 0) 
                    : "-"
                  }
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <Label>Montant TPA</Label>
                </div>
                <div className="p-3 bg-gray-50 rounded border text-sm">
                  {currentAgo?.tpa_amount ? 
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "MAD",
                    }).format(currentAgo?.tpa_amount || 0) 
                    : "-"
                  }
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <Label>Dividendes nets</Label>
                </div>
                <div className="p-3 bg-gray-50 rounded border text-sm">
                  {currentAgo?.dividendes_nets ? 
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "MAD",
                    }).format(currentAgo?.dividendes_nets || 0) 
                    : "-"
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Année Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Année
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-2">
                <Label htmlFor="annee">Année de l'AGO</Label>
                <Input
                  id="annee"
                  type="number"
                  min="1900"
                  max="2100"
                  value={annee}
                  onChange={(e) => {
                    setAnnee(e.target.value);
                    setErrors((prev) => ({ ...prev, annee: "" }));
                  }}
                  className={errors.annee ? "border-red-500" : ""}
                  placeholder="2024"
                />
                {errors.annee && (
                  <p className="text-red-500 text-sm">{errors.annee}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Etapes Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Étapes AGO
                </CardTitle>
                <Badge variant="outline" className="text-sm">
                  {completedSteps}/{totalSteps} terminées ({progressPercentage}
                  %)
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
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
                        : "bg-gray-300"
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Etapes Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {etapes.map((etape, index) => (
                    <Card key={etape.id || index} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {etape.titre}
                          </CardTitle>
                          {getStatusBadge(etape.statut)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Status Selection */}
                        <div className="space-y-2">
                          <Label>
                            Statut <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={etape.statut}
                            onValueChange={(value) =>
                              handleEtapeChange(index, "statut", value)
                            }
                          >
                            <SelectTrigger
                              className={
                                errors.etapes[index]?.statut
                                  ? "border-red-500"
                                  : ""
                              }
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="non">Non terminé</SelectItem>
                              <SelectItem value="oui">Terminé</SelectItem>
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
                          <Label>Commentaire</Label>
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
      <div className="sticky bottom-0 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {hasChanges ? (
                  <span className="text-amber-600 font-medium">
                    ⚠️ Modifications non sauvegardées
                  </span>
                ) : (
                  <span className="text-green-600">✅ Aucune modification</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/Assemblee_Generale_ordinaire")}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmitAGO}
                disabled={!hasChanges}
                className="bg-blue-600 hover:bg-blue-700"
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