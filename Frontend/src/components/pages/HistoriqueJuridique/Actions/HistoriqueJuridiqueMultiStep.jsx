import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  FileText,
  Users,
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
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HistoriqueJuridiqueMultiStep() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Informations de base
    date_modification: "",
    objet: "",
    montant: "",
    id_client: "",
    description: "",
    statut_objet: "non", // Status for the selected objet
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { id: "client", title: "Client", icon: Users },
    { id: "basic", title: "Informations de Base", icon: FileText },
    { id: "review", title: "Révision", icon: Check },
  ];


  const objetOptions = [
    { value: "Conseil stratégique", label: "Conseil stratégique" },
    { value: "Rédaction de contrat", label: "Rédaction de contrat" },
    { value: "Procédure judiciaire", label: "Procédure judiciaire" },
    { value: "Enregistrement", label: "Enregistrement" },
    { value: "Taxe Professionnelle", label: "Taxe Professionnelle" },
    { value: "Étape 3", label: "Étape 3 (à personnaliser)" },
    { value: "Étape 4", label: "Étape 4 (à personnaliser)" },
  ];

  const validateStep = (stepIndex) => {
    const newErrors = {};

    if (stepIndex === 0) {
      if (!formData.id_client) newErrors.id_client = "Client requis";
    } else if (stepIndex === 1) {
      if (!formData.date_modification)
        newErrors.date_modification = "Date de modification requise";
      if (!formData.objet) newErrors.objet = "Objet requis";
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

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Données du formulaire:", formData);
    alert("Historique juridique créé avec succès!");
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                  index < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : index === currentStep
                    ? "border-primary text-primary bg-primary/10"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <div className="mt-3 text-center">
                <div
                  className={`text-sm font-medium ${
                    index <= currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-20 h-0.5 mx-4 ${
                  index < currentStep ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full mx-auto ">
      <Card className="shadow-lg">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-3xl font-bold">
            Créer un Nouvel Historique Juridique
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Suivez les étapes ci-dessous pour créer un historique juridique
            complet
          </p>
        </CardHeader>

        <CardContent className="p-8">
          <StepIndicator />

          <div className="space-y-6">
            {/* Étape 1: Client */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="id_client">
                    Client <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.id_client}
                    onValueChange={(value) =>
                      handleInputChange("id_client", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.id_client ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client1">
                        Client 1 - Entreprise ABC
                      </SelectItem>
                      <SelectItem value="client2">
                        Client 2 - Société XYZ
                      </SelectItem>
                      <SelectItem value="client3">
                        Client 3 - Association DEF
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.id_client && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.id_client}</AlertDescription>
                    </Alert>
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

            {/* Étape 2: Informations de Base */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date_modification">
                      Date de Modification{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="date_modification"
                      type="date"
                      value={formData.date_modification}
                      onChange={(e) =>
                        handleInputChange("date_modification", e.target.value)
                      }
                      className={
                        errors.date_modification ? "border-destructive" : ""
                      }
                    />
                    {errors.date_modification && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {errors.date_modification}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="montant">
                      Montant <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="montant"
                      type="number"
                      step="0.01"
                      value={formData.montant}
                      onChange={(e) =>
                        handleInputChange("montant", e.target.value)
                      }
                      className={errors.montant ? "border-destructive" : ""}
                      placeholder="0.00"
                    />
                    {errors.montant && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.montant}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objet">
                    Objet <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.objet}
                    onValueChange={(value) => handleInputChange("objet", value)}
                  >
                    <SelectTrigger
                      className={errors.objet ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Sélectionner un objet" />
                    </SelectTrigger>
                    <SelectContent>
                      {objetOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.objet && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.objet}</AlertDescription>
                    </Alert>
                  )}
                </div>
                {/* Status display when objet is selected */}
                {formData.objet && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Statut de l'Objet
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Statut : {formData.objet}</Label>
                          <Select
                            value={formData.statut_objet}
                            onValueChange={(value) =>
                              handleInputChange("statut_objet", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="non">Non terminé</SelectItem>
                              <SelectItem value="oui">Terminé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            État actuel:
                          </span>
                          <span
                            className={`text-sm font-medium px-2 py-1 rounded ${
                              formData.statut_objet === "oui"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {formData.statut_objet === "oui"
                              ? "✓ Terminé"
                              : "✗ Non terminé"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description / Commentaire{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className={errors.description ? "border-destructive" : ""}
                    placeholder="Décrivez les détails de cet historique juridique et ajoutez vos commentaires..."
                  />
                  {errors.description && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.description}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Précédent
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    Suivant <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 3: Révision */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    Révision de vos informations
                  </h3>
                  <p className="text-muted-foreground">
                    Veuillez vérifier vos détails avant de créer l'historique
                    juridique.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Informations de base */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Informations de Base
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Date de modification:
                          </span>
                          <span className="font-medium">
                            {formData.date_modification}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Montant:
                          </span>
                          <span className="font-medium">
                            {formData.montant} €
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Objet:</span>
                          <span className="font-medium">{formData.objet}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Client:</span>
                          <span className="font-medium">
                            {formData.id_client}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-muted-foreground text-sm">
                          Description/Commentaire:
                        </span>
                        <p className="font-medium text-sm mt-1">
                          {formData.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Statut de l'objet */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Statut de l'Objet
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {formData.objet}:
                        </span>
                        <span
                          className={`font-medium px-2 py-1 rounded text-xs ${
                            formData.statut_objet === "oui"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {formData.statut_objet === "oui"
                            ? "✓ Terminé"
                            : "✗ Non terminé"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Retour
                  </Button>
                  <Button
                    onClick={onSubmit}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Créer l'Historique
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
