import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  FileText,
  Users,
  Plus,
  X,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import useClientStore from "@/store/useClientStore";
import useHistoriqueJuridiqueStore from "@/store/HistoriqueJuridiqueStore";
import { useNavigate } from "react-router-dom";

// Move SectionCard outside to prevent recreation
const SectionCard = ({ etape, etapeIndex, onSectionChange }) => (
  <Card className="mb-4">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-lg">
        <FileText className="w-5 h-5" />
        {etape.titre}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label>Statut</Label>
        <Select
          value={etape.statut}
          onValueChange={(value) => onSectionChange(etapeIndex, 'statut', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="non">Non terminé</SelectItem>
            <SelectItem value="oui">Terminé</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-600">État actuel:</span>
          <span
            className={`text-sm font-medium px-2 py-1 rounded ${
              etape.statut === "oui"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {etape.statut === "oui" ? "✓ Terminé" : "✗ Non terminé"}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Commentaire</Label>
        <Textarea
          value={etape.commentaire}
          onChange={(e) => onSectionChange(etapeIndex, 'commentaire', e.target.value)}
          rows={3}
          placeholder={`Commentaire pour ${etape.titre}...`}
        />
      </div>
    </CardContent>
  </Card>
);

export default function AjouterHistorique() {
  const [currentStep, setCurrentStep] = useState(0);
  const { clients, fetchClients } = useClientStore();
  const [isCustomObjet, setIsCustomObjet] = useState(false);
  const { createHistorique } = useHistoriqueJuridiqueStore();
  const [customObjet, setCustomObjet] = useState("");
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // Informations de base
    date_modification: "",
    objet: "",
    montant: "",
    id_client: "",
    description: "",
    // 4 sections organized as an array
    etapes: [
      {
        nom: "enregistrement",
        titre: "Enregistrement",
        statut: "non",
        commentaire: ""
      },
      {
        nom: "taxe_professionnelle", 
        titre: "Taxe Professionnelle",
        statut: "non",
        commentaire: ""
      },
      {
        nom: "tribunal_commerce",
        titre: "Tribunal de Commerce", 
        statut: "non",
        commentaire: ""
      },
      {
        nom: "annonces_legales",
        titre: "Annonces Légales",
        statut: "non", 
        commentaire: ""
      }
    ]
  });

  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (clients.length === 0) {
      fetchClients();
    }
  }, [clients.length, fetchClients]);

  const steps = [
    { id: "basic", title: "Informations de Base", icon: FileText },
    { id: "details", title: "Etapes Juridique", icon: Users },
    { id: "review", title: "Révision", icon: Check },
  ];

  // Available objects with their descriptions
  const objetOptions = [
    { value: "Création", label: "Création" },
    { value: "Transfert de siège", label: "Transfert de siège" },
    { value: "Augmentation du capital", label: "Augmentation du capital" },
    { value: "Cession des parts sociales", label: "Cession des parts sociales" },
    { value: "Modification de l'objet", label: "Modification de l'objet" },
    { value: "Dissolution-liquidation ", label: "Dissolution-liquidation " },
  ];

  // Get selected client details
  const getSelectedClient = () => {
    return clients.find(client => client.id_client === formData.id_client);
  };

  // Format client display name
  const formatClientName = (client) => {
    const fullName = `${client.nom_client || ''} ${client.prenom_client || ''}`.trim();
    if (fullName && client.raisonSociale) {
      return `${fullName} - ${client.raisonSociale}`;
    } else if (fullName) {
      return fullName;
    } else if (client.raisonSociale) {
      return client.raisonSociale;
    }
    return `Client ${client.id_client}`;
  };

  const validateStep = (stepIndex) => {
    const newErrors = {};

    if (stepIndex === 0) {
      if (!formData.id_client) newErrors.id_client = "Client requis";
      if (!formData.objet) newErrors.objet = "Objet requis";
      if (!formData.date_modification)
        newErrors.date_modification = "Date de modification requise";
      if (!formData.montant) newErrors.montant = "Montant requis";
      if (!formData.description) newErrors.description = "Description requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSectionChange = (etapeIndex, field, value) => {
    setFormData((prev) => {
      const newEtapes = [...prev.etapes];
      newEtapes[etapeIndex] = { ...newEtapes[etapeIndex], [field]: value };
      return {
        ...prev,
        etapes: newEtapes
      };
    });
  };

  const onSubmit = async(e) => {
    e.preventDefault();
    console.log("Données du formulaire:", formData);
    await createHistorique(formData);
    navigate("/historique_juridique");
  };

  // Mobile horizontal step indicator
  const MobileStepIndicator = () => (
    <div className="flex justify-center items-center space-x-2 md:hidden mb-6 overflow-x-auto">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center min-w-0 flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted
                    ? "bg-blue-500 border-blue-500 text-white"
                    : isCurrent
                    ? "border-blue-500 text-blue-500 bg-blue-50"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
              </div>
              <div className="mt-1 text-center">
                <div
                  className={`text-xs font-medium ${
                    index <= currentStep ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </div>
              </div>
            </div>

            {/* Line BETWEEN steps */}
            {index < steps.length - 1 && (
              <div
                className={`w-6 h-0.5 mt-3 flex-shrink-0 ${
                  isCompleted ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // Desktop vertical step indicator
  const DesktopStepIndicator = () => (
    <div className="hidden md:flex flex-col space-y-6">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex flex-col items-center">
            <div className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                  index < currentStep
                    ? "bg-blue-500 border-blue-500 text-white"
                    : index === currentStep
                    ? "border-blue-500 text-blue-500 bg-blue-50"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
            </div>
            <div className="mt-3 text-center">
              <div
                className={`text-sm font-medium ${
                  index <= currentStep
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-0.5 h-16 mt-4 ${
                  index < currentStep ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full mx-auto h-full min-h-screen ">
      <div className="flex flex-col md:flex-row h-full">
        {/* Mobile Header */}
        <div className="md:hidden  p-4 ">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 ">
              Créer un Nouvel Historique Juridique
            </h1>
            <p className="text-gray-600 mb-4">
              Suivez les étapes ci-dessous pour créer un historique juridique
              complet
            </p>
          </div>
          <MobileStepIndicator />
          <Separator className="my-4" />
        </div>

        {/* Desktop Left Sidebar */}
        <div className="hidden md:block w-1/3  p-8 border-r-2 border-gray-200">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 ">
              Créer un Nouvel Historique Juridique
            </h1>
            <p className="text-gray-600 mb-4">
              Suivez les étapes ci-dessous pour créer un historique juridique
              complet
            </p>
          </div>

          <DesktopStepIndicator />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8">
          <div className="space-y-6">
            {/* Étape 1: Informations de Base */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2">
                    Informations de Base
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Renseignez les informations principales de l'historique juridique
                  </p>
                </div>

                {/* Client Selection */}
                <div className="space-y-2">
                  <Label htmlFor="id_client">
                    Client <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.id_client}
                    onValueChange={(value) => handleInputChange("id_client", value)}
                  >
                    <SelectTrigger
                      className={errors.id_client ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Sélectionnez un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id_client} value={client.id_client}>
                          {formatClientName(client)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Selected client display */}
                  {formData.id_client && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-medium text-blue-800">
                            Client sélectionné:
                          </span>
                          <p className="text-sm text-blue-700 mt-1">
                            {formatClientName(getSelectedClient())}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            ID: {formData.id_client}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInputChange("id_client", "")}
                          className="text-blue-600 hover:text-blue-800 text-xs underline"
                        >
                          Effacer
                        </button>
                      </div>
                    </div>
                  )}

                  {errors.id_client && (
                    <span className="text-red-500 text-sm">
                      {errors.id_client}
                    </span>
                  )}
                </div>

                {/* Objet Selection */}
                <div className="grid grid-cols-1 items-center gap-4">
                  <Label htmlFor="objet" >
                    Objet <span className="text-red-500">*</span>
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    {!isCustomObjet ? (
                      <Select
                        value={formData.objet}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            setIsCustomObjet(true);
                            handleInputChange("objet", "");
                          } else {
                            handleInputChange("objet", value);
                          }
                        }}
                      >
                        <SelectTrigger
                          className={errors.objet ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Sélectionnez un objet" />
                        </SelectTrigger>
                        <SelectContent>
                          {objetOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                          <SelectItem
                            value="custom"
                            className="text-blue-600 font-semibold"
                          >
                            <div className="flex items-center">
                              <Plus className="mr-2 h-4 w-4" /> Ajouter un
                              nouvel objet
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center space-x-2 w-full">
                        <Input
                          type="text"
                          value={customObjet}
                          onChange={(e) => {
                            setCustomObjet(e.target.value);
                            handleInputChange("objet", e.target.value);
                          }}
                          className={errors.objet ? "border-red-500" : ""}
                          placeholder="Nouvel objet..."
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setIsCustomObjet(false);
                            setCustomObjet("");
                            handleInputChange("objet", "");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.objet && (
                    <span className="text-red-500 text-sm">{errors.objet}</span>
                  )}
                </div>

                {/* Basic Information Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date_modification">
                      Date de Modification{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date_modification"
                      type="date"
                      value={formData.date_modification}
                      onChange={(e) =>
                        handleInputChange("date_modification", e.target.value)
                      }
                      className={
                        errors.date_modification ? "border-red-500" : ""
                      }
                    />
                    {errors.date_modification && (
                      <span className="text-red-500 text-sm">
                        {errors.date_modification}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="montant">
                      Montant <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="montant"
                      type="number"
                      step="0.01"
                      value={formData.montant}
                      onChange={(e) =>
                        handleInputChange("montant", e.target.value)
                      }
                      className={errors.montant ? "border-red-500" : ""}
                      placeholder="0.00"
                    />
                    {errors.montant && (
                      <span className="text-red-500 text-sm">
                        {errors.montant}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description / Commentaire Général{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className={errors.description ? "border-red-500" : ""}
                    placeholder="Décrivez les détails généraux de cet historique juridique..."
                  />
                  {errors.description && (
                    <span className="text-red-500 text-sm">
                      {errors.description}
                    </span>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    Suivant <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 2: Etapes Juridique */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2">
                    Etapes Juridique
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Définissez le statut et les commentaires pour chaque section
                  </p>
                </div>

                {formData.etapes.map((etape, index) => (
                  <SectionCard 
                    key={index}
                    etape={etape}
                    etapeIndex={index}
                    onSectionChange={handleSectionChange}
                  />
                ))}

                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                  <Button
                    onClick={prevStep}
                    variant="secondary"
                    className="flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Précédent
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="flex items-center justify-center gap-2"
                  >
                    Suivant <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 3: Révision */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2 ">
                    Révision de vos informations
                  </h3>
                  <p className="text-gray-600">
                    Veuillez vérifier vos détails avant de créer l'historique
                    juridique.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Informations de base */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Informations de Base</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-600">Client:</span>
                          <span className="font-medium text-gray-900">
                            {getSelectedClient() ? formatClientName(getSelectedClient()) : formData.id_client}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-600">Objet:</span>
                          <span className="font-medium text-gray-900">
                            {formData.objet}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-600">
                            Date de modification:
                          </span>
                          <span className="font-medium text-gray-900">
                            {formData.date_modification}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-600">
                            Montant:
                          </span>
                          <span className="font-medium text-gray-900">
                            {formData.montant} MAD
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-gray-600 text-sm">
                          Description/Commentaire Général:
                        </span>
                        <p className="font-medium text-sm mt-1 text-gray-900">
                          {formData.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Détails par section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Statut des Sections</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.etapes.map((etape) => (
                        <div key={etape.nom} className="border-l-4 border-gray-200 pl-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900">{etape.titre}</span>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                etape.statut === "oui"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {etape.statut === "oui" ? "✓ Terminé" : "✗ Non terminé"}
                            </span>
                          </div>
                          {etape.commentaire && (
                            <p className="text-sm text-gray-600">
                              {etape.commentaire}
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                  <Button
                    onClick={prevStep}
                    variant="secondary"
                    className="flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Retour
                  </Button>
                  <Button
                    onClick={onSubmit}
                    className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 text-white"
                  >
                    <Check className="w-4 h-4" /> Créer l'Historique
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}