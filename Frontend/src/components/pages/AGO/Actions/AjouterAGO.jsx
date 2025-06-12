import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  FileText,
  Users,
  Plus,
  X,
  Calendar,
  DollarSign,
  Building2,
  PenTool,
  FileSignature,
  Scale,
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
import useAgoStore from "@/store/AgoStore";
import { useNavigate } from "react-router-dom";

// Move SectionCard outside to prevent recreation
const SectionCard = ({ etape, etapeIndex, onSectionChange }) => {
  // Get appropriate icon for each step
  const getStepIcon = (stepName) => {
    switch (stepName) {
      case "redaction":
        return PenTool;
      case "signature":
        return FileSignature;
      case "depot":
        return Scale;
      default:
        return FileText;
    }
  };

  const StepIcon = getStepIcon(etape.nom);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <StepIcon className="w-5 h-5" />
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
};

export default function AjouterAGO() {
  const [currentStep, setCurrentStep] = useState(0);
  const { clients, fetchClients } = useClientStore();
  const { createAgo } = useAgoStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // Informations de base AGO
    ago_date: "",
    annee: new Date().getFullYear(),
    decision_type: "",
    resultat_comptable: "",
    ran_anterieurs: "",
    reserve_legale: "",
    benefice_distribue: "",
    tpa_amount: "",
    ran_amount: "",
    dividendes_nets: "",
    commentaire: "",
    id_client: "",
    // 3 étapes AGO mises à jour
    etapes: [
      {
        nom: "redaction",
        titre: "Rédaction",
        statut: "non",
        commentaire: ""
      },
      {
        nom: "signature", 
        titre: "Signature",
        statut: "non",
        commentaire: ""
      },
      {
        nom: "depot",
        titre: "Dépôt au Tribunal",
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
    { id: "basic", title: "Informations AGO", icon: Building2 },
    { id: "details", title: "Étapes AGO", icon: Users },
    { id: "review", title: "Révision", icon: Check },
  ];

  // Decision type options
  const decisionTypeOptions = [
    { value: "RAN", label: "Report à Nouveau (RAN)" },
    { value: "DISTRIBUTION", label: "Distribution" },
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
      if (!formData.ago_date) newErrors.ago_date = "Date AGO requise";
      if (!formData.annee) newErrors.annee = "Année requise";
      if (!formData.decision_type) newErrors.decision_type = "Type de décision requis";
      
      // Validation conditionnelle selon le type de décision
      if (formData.decision_type === "RAN" && !formData.ran_amount) {
        newErrors.ran_amount = "Montant RAN requis pour le type RAN";
      }
      if (formData.decision_type === "DISTRIBUTION") {
        if (!formData.dividendes_nets) {
          newErrors.dividendes_nets = "Dividendes nets requis pour la distribution";
        }
      }
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
    console.log("Données AGO:", formData);
    await createAgo(formData);
    navigate("/Assemblee_Generale_ordinaire");
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
              Créer une nouvelle AGO
            </h1>
            <p className="text-gray-600 mb-4">
              Suivez les étapes ci-dessous pour créer une AGO complète
            </p>
          </div>
          <MobileStepIndicator />
          <Separator className="my-4" />
        </div>

        {/* Desktop Left Sidebar */}
        <div className="hidden md:block w-1/3  p-8 border-r-2 border-gray-200">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 ">
              Créer une nouvelle AGO
            </h1>
            <p className="text-gray-600 mb-4">
              Suivez les étapes ci-dessous pour créer une AGO complète
            </p>
          </div>

          <DesktopStepIndicator />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8">
          <div className="space-y-6">
            {/* Étape 1: Informations AGO */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2">
                    Informations AGO
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Renseignez les informations principales de l'Assemblée Générale Ordinaire
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

                {/* Date and Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ago_date">
                      Date AGO <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ago_date"
                      type="date"
                      value={formData.ago_date}
                      onChange={(e) =>
                        handleInputChange("ago_date", e.target.value)
                      }
                      className={
                        errors.ago_date ? "border-red-500" : ""
                      }
                    />
                    {errors.ago_date && (
                      <span className="text-red-500 text-sm">
                        {errors.ago_date}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annee">
                      Année <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="annee"
                      type="number"
                      min="2000"
                      max="2100"
                      value={formData.annee}
                      onChange={(e) =>
                        handleInputChange("annee", parseInt(e.target.value))
                      }
                      className={errors.annee ? "border-red-500" : ""}
                    />
                    {errors.annee && (
                      <span className="text-red-500 text-sm">
                        {errors.annee}
                      </span>
                    )}
                  </div>
                </div>

                {/* Decision Type */}
                <div className="space-y-2">
                  <Label htmlFor="decision_type">
                    Type de Décision <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.decision_type}
                    onValueChange={(value) => handleInputChange("decision_type", value)}
                  >
                    <SelectTrigger
                      className={errors.decision_type ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Sélectionnez le type de décision" />
                    </SelectTrigger>
                    <SelectContent>
                      {decisionTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.decision_type && (
                    <span className="text-red-500 text-sm">
                      {errors.decision_type}
                    </span>
                  )}
                </div>

                {/* Montants selon le type de décision */}
                {formData.decision_type && (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Montants</h4>
                    
                    {formData.decision_type === "RAN" && (
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="ran_amount">
                            Montant RAN <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="ran_amount"
                            type="number"
                            step="0.01"
                            value={formData.ran_amount}
                            onChange={(e) =>
                              handleInputChange("ran_amount", e.target.value)
                            }
                            className={errors.ran_amount ? "border-red-500" : ""}
                            placeholder="0.00"
                          />
                          {errors.ran_amount && (
                            <span className="text-red-500 text-sm">
                              {errors.ran_amount}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {formData.decision_type === "DISTRIBUTION" && (
                      <div className="space-y-6">
                        {/* First row: resultat_comptable, ran_anterieurs, reserve_legale */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="resultat_comptable">
                              Résultat Comptable
                            </Label>
                            <Input
                              id="resultat_comptable"
                              type="number"
                              step="0.01"
                              value={formData.resultat_comptable}
                              onChange={(e) =>
                                handleInputChange("resultat_comptable", e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ran_anterieurs">
                              RAN Antérieurs
                            </Label>
                            <Input
                              id="ran_anterieurs"
                              type="number"
                              step="0.01"
                              value={formData.ran_anterieurs}
                              onChange={(e) =>
                                handleInputChange("ran_anterieurs", e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="reserve_legale">
                              Réserve Légale
                            </Label>
                            <Input
                              id="reserve_legale"
                              type="number"
                              step="0.01"
                              value={formData.reserve_legale}
                              onChange={(e) =>
                                handleInputChange("reserve_legale", e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        {/* Second row: benefice_distribue, tpa_amount, ran_amount */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="benefice_distribue">
                              Bénéfice Distribué
                            </Label>
                            <Input
                              id="benefice_distribue"
                              type="number"
                              step="0.01"
                              value={formData.benefice_distribue}
                              onChange={(e) =>
                                handleInputChange("benefice_distribue", e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tpa_amount">
                              Montant TPA
                            </Label>
                            <Input
                              id="tpa_amount"
                              type="number"
                              step="0.01"
                              value={formData.tpa_amount}
                              onChange={(e) =>
                                handleInputChange("tpa_amount", e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ran_amount">
                              Montant RAN
                            </Label>
                            <Input
                              id="ran_amount"
                              type="number"
                              step="0.01"
                              value={formData.ran_amount}
                              onChange={(e) =>
                                handleInputChange("ran_amount", e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        {/* Third row: dividendes_nets (centered and required) */}
                        <div className="flex justify-center">
                          <div className="w-full md:w-1/3 space-y-2">
                            <Label htmlFor="dividendes_nets">
                              Dividendes Nets <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="dividendes_nets"
                              type="number"
                              step="0.01"
                              value={formData.dividendes_nets}
                              onChange={(e) =>
                                handleInputChange("dividendes_nets", e.target.value)
                              }
                              className={errors.dividendes_nets ? "border-red-500" : ""}
                              placeholder="0.00"
                            />
                            {errors.dividendes_nets && (
                              <span className="text-red-500 text-sm">
                                {errors.dividendes_nets}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Commentaire général */}
                <div className="space-y-2">
                  <Label htmlFor="commentaire">
                    Commentaire Général
                  </Label>
                  <Textarea
                    id="commentaire"
                    value={formData.commentaire}
                    onChange={(e) =>
                      handleInputChange("commentaire", e.target.value)
                    }
                    rows={4}
                    placeholder="Commentaire général sur cette AGO..."
                  />
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

            {/* Étape 2: Étapes AGO */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2">
                    Étapes AGO
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Définissez le statut et les commentaires pour chaque étape de l'AGO
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
                    Révision de l'AGO
                  </h3>
                  <p className="text-gray-600">
                    Veuillez vérifier vos détails avant de créer l'AGO.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Informations AGO */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Informations AGO</CardTitle>
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
                          <span className="text-gray-600">Date AGO:</span>
                          <span className="font-medium text-gray-900">
                            {formData.ago_date}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-600">Année:</span>
                          <span className="font-medium text-gray-900">
                            {formData.annee}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-600">Type de décision:</span>
                          <span className="font-medium text-gray-900">
                            {formData.decision_type}
                          </span>
                        </div>
                        
                        {/* Display amounts for DISTRIBUTION type */}
                        {formData.decision_type === "DISTRIBUTION" && (
                          <>
                            {formData.resultat_comptable && (
                              <div className="flex flex-col sm:flex-row sm:justify-between">
                                <span className="text-gray-600">Résultat Comptable:</span>
                                <span className="font-medium text-gray-900">
                                  {formData.resultat_comptable} MAD
                                </span>
                              </div>
                            )}
                            {formData.ran_anterieurs && (
                              <div className="flex flex-col sm:flex-row sm:justify-between">
                                <span className="text-gray-600">RAN Antérieurs:</span>
                                <span className="font-medium text-gray-900">
                                  {formData.ran_anterieurs} MAD
                                </span>
                              </div>
                            )}
                            {formData.reserve_legale && (
                              <div className="flex flex-col sm:flex-row sm:justify-between">
                                <span className="text-gray-600">Réserve Légale:</span>
                                <span className="font-medium text-gray-900">
                                  {formData.reserve_legale} MAD
                                </span>
                              </div>
                            )}
                            {formData.benefice_distribue && (
                              <div className="flex flex-col sm:flex-row sm:justify-between">
                                <span className="text-gray-600">Bénéfice Distribué:</span>
                                <span className="font-medium text-gray-900">
                                  {formData.benefice_distribue} MAD
                                </span>
                              </div>
                            )}
                            {formData.tpa_amount && (
                              <div className="flex flex-col sm:flex-row sm:justify-between">
                                <span className="text-gray-600">Montant TPA:</span>
                                <span className="font-medium text-gray-900">
                                  {formData.tpa_amount} MAD
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Display RAN amount for both types */}
                        {formData.ran_amount && (
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-gray-600">Montant RAN:</span>
                            <span className="font-medium text-gray-900">
                              {formData.ran_amount} MAD
                            </span>
                          </div>
                        )}
                        
                        {/* Display dividendes_nets only for DISTRIBUTION */}
                        {formData.decision_type === "DISTRIBUTION" && formData.dividendes_nets && (
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-gray-600">Dividendes Nets:</span>
                            <span className="font-medium text-gray-900">
                              {formData.dividendes_nets} MAD
                            </span>
                          </div>
                        )}
                      </div>
                      {formData.commentaire && (
                        <div className="mt-3">
                          <span className="text-gray-600 text-sm">
                            Commentaire Général:
                          </span>
                          <p className="font-medium text-sm mt-1 text-gray-900">
                            {formData.commentaire}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Statut des étapes */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Statut des Étapes</CardTitle>
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
                    <Check className="w-4 h-4" /> Créer l'AGO
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