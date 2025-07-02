import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  FileText,
  DollarSign,
  Eye,
  Building2,
  Users,
  Calendar,
  AlertCircle,
  Ban,
  Info,
  CheckCircle2,
  Zap
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import useClientStore from "@/store/useClientStore";
import useHistoriqueFiscalStore from "@/store/HistiriqueFiscalStore";

// Tax Category Card Component
const TaxCategoryCard = ({ category, taxes, selectedTaxes, taxConfig, onTaxToggle, updateTaxConfig }) => (
  <Card className="mb-4">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-lg">
        <DollarSign className="w-5 h-5" />
        {category}
        <Badge variant="secondary" className="text-xs">
          {taxes.filter(tax => selectedTaxes.has(tax.key)).length}/{taxes.length}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {taxes.map(({ key, name, type, periods, optional, mandatory, pmOnly, ppOnly, description, icon, warning, isDisabled, disabledReason }) => {
          const isSelected = selectedTaxes.has(key);
          const config = taxConfig[key];
          
          return (
            <div key={key} className={`border rounded-lg p-3 transition-all ${
              isSelected 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" 
                : isDisabled 
                  ? "border-gray-200 bg-gray-50 dark:bg-gray-800/50 opacity-60"
                  : "border-gray-200 hover:border-gray-300"
            }`}>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={key}
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => !isDisabled && onTaxToggle(key)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={key}
                      className={`block text-sm font-medium leading-none cursor-pointer ${
                        isDisabled ? "text-gray-400" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{icon}</span>
                        <span>{name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{description}</p>
                    </label>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mandatory && <Badge variant="destructive" className="text-xs">Obligatoire</Badge>}
                      {optional && <Badge variant="secondary" className="text-xs">Optionnel</Badge>}
                      {pmOnly && <Badge variant="outline" className="text-xs">PM</Badge>}
                      {ppOnly && <Badge variant="outline" className="text-xs">PP</Badge>}
                      {warning && <Badge variant="destructive" className="text-xs">⚠️ Excluant</Badge>}
                      {type === "DECLARATION" && <Badge variant="default" className="text-xs">Déclaration</Badge>}
                    </div>

                    {isDisabled && disabledReason && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <Ban className="w-3 h-3" />
                        {disabledReason}
                      </p>
                    )}
                  </div>
                </div>

                {isSelected && type === "VERSEMENT" && periods && (
                  <div className="ml-6 space-y-3 p-3 bg-white dark:bg-gray-900 rounded border">
                    {periods.length > 1 && (
                      <div>
                        <Label className="text-xs font-medium">Périodicité</Label>
                        <Select
                          value={config?.periode}
                          onValueChange={(value) => updateTaxConfig(key, 'periode', value)}
                        >
                          <SelectTrigger className="h-8 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {periods.map(period => (
                              <SelectItem key={period} value={period}>
                                {period}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {config?.periode === "MENSUEL" && (
                      <div>
                        <Label className="text-xs font-medium">Mois sélectionnés</Label>
                        <div className="grid grid-cols-6 gap-1 mt-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                            <label key={month} className="flex items-center gap-1 cursor-pointer">
                              <Checkbox
                                checked={config?.months?.includes(month)}
                                onCheckedChange={(checked) => {
                                  const newMonths = checked
                                    ? [...(config?.months || []), month]
                                    : config?.months?.filter(m => m !== month) || [];
                                  updateTaxConfig(key, 'months', newMonths);
                                }}
                              />
                              <span className="text-xs">{month}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

export default function AjouterHistoriqueFiscal() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { clients, fetchClients } = useClientStore();
  console.log(clients)
  const { createHistorique } = useHistoriqueFiscalStore();

  // Form state
  const [formData, setFormData] = useState({
    id_client: "",
    annee_fiscal: new Date().getFullYear().toString(),
    description: "",
    statut_global: "EN_COURS",
    commentaire_general: ""
  });

  // Selected taxes state
  const [selectedTaxes, setSelectedTaxes] = useState(new Set());
  const [taxConfig, setTaxConfig] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (clients.length === 0) {
      fetchClients();
    }
  }, [clients.length, fetchClients]);

  const steps = [
    { id: "basic", title: "Informations de Base", icon: FileText },
    { id: "taxes", title: "Sélection des Impôts", icon: DollarSign },
    { id: "review", title: "Révision", icon: Check },
  ];

  // Enhanced tax definitions
  const taxDefinitions = {
    // VERSEMENTS - Taxes sur Chiffre d'Affaires
    TVA: {
      name: "TVA",
      type: "VERSEMENT",
      periods: ["MENSUEL", "TRIMESTRIEL", "ANNUEL"],
      defaultPeriod: "TRIMESTRIEL",
      conflicts: [],
      excludedBy: ["CPU"],
      category: "Taxes sur Chiffre d'Affaires",
      description: "Taxe sur la Valeur Ajoutée",
      icon: "💰",
      mandatory: true
    },

    // VERSEMENTS - Impôts sur Bénéfices
    IS: {
      name: "Impôt sur les Sociétés (IS)",
      type: "VERSEMENT",
      periods: ["TRIMESTRIEL"],
      isQuarterly: true,
      quarters: [1, 2, 3, 4],
      conflicts: ["CM"],
      excludedBy: ["CPU"],
      category: "Impôts sur Bénéfices",
      description: "4 acomptes trimestriels obligatoires",
      icon: "🏢",
      mandatory: true,
      pmOnly: true
    },
    CM: {
      name: "Cotisation Minimale",
      type: "VERSEMENT",
      periods: ["ANNUEL"],
      conflicts: ["IS"],
      excludedBy: ["CPU"],
      category: "Impôts sur Bénéfices",
      description: "Alternative à l'IS pour certaines entreprises",
      icon: "📊",
      pmOnly: true
    },

    // VERSEMENTS - Impôts sur Revenus
    IR_SALAIRES: {
      name: "IR sur Salaires",
      type: "VERSEMENT",
      periods: ["MENSUEL"],
      excludedBy: [],
      category: "Impôts sur Revenus",
      description: "Retenue à la source mensuelle",
      icon: "👥",
      mandatory: true
    },
    IR_PROF: {
      name: "IR Professionnel",
      type: "VERSEMENT",
      periods: ["ANNUEL"],
      excludedBy: ["CPU"],
      category: "Impôts sur Revenus",
      description: "Pour les personnes physiques",
      icon: "👤",
      ppOnly: true
    },

    // VERSEMENTS - Contributions Spéciales
    CPU: {
      name: "CPU",
      type: "VERSEMENT",
      periods: ["MENSUEL"],
      excludes: ["IR_PROF", "CM", "IS", "TVA"],
      excludesDeclarations: ["ETAT_SYNTHESE"],
      category: "Contributions Spéciales",
      description: "⚠️ Exclut: IR Prof, CM, IS, TVA, État Synthèse",
      icon: "⚡",
      warning: true
    },

    // VERSEMENTS - Contributions Sociales
    CSS: {
      name: "CSS",
      type: "VERSEMENT",
      periods: ["MENSUEL"],
      excludedBy: [],
      category: "Contributions Sociales",
      description: "Contribution Sociale de Solidarité",
      icon: "🤝"
    },

    // VERSEMENTS - Droits et Taxes
    DT: {
      name: "Droits de Timbre",
      type: "VERSEMENT",
      periods: ["MENSUEL"],
      excludedBy: [],
      category: "Droits et Taxes",
      description: "Droits de timbre mensuels",
      icon: "📋"
    },

    // VERSEMENTS - Taxes Spécialisées
    TDB: {
      name: "Taxe sur Débits de Boissons",
      type: "VERSEMENT",
      periods: ["TRIMESTRIEL"],
      optional: true,
      excludedBy: [],
      category: "Taxes Spécialisées",
      description: "Pour les débits de boissons",
      icon: "🍺"
    },
    TPT: {
      name: "Taxe sur les Produits de Tabac",
      type: "VERSEMENT",
      periods: ["TRIMESTRIEL"],
      optional: true,
      excludedBy: [],
      category: "Taxes Spécialisées", 
      description: "Pour les produits de tabac",
      icon: "🚬"
    },
    TSC: {
      name: "Taxe Spéciale sur le Ciment",
      type: "VERSEMENT",
      periods: ["ANNUEL"],
      optional: true,
      excludedBy: [],
      category: "Taxes Spécialisées",
      description: "Pour l'industrie du ciment",
      icon: "🏗️"
    },

    // VERSEMENTS - Taxes sur Services
    TS: {
      name: "Taxe de Services",
      type: "VERSEMENT",
      periods: ["TRIMESTRIEL"],
      excludedBy: [],
      category: "Taxes sur Services",
      description: "Taxe trimestrielle sur services",
      icon: "🛎️"
    },

    // VERSEMENTS - Taxes Locales
    TH: {
      name: "Taxe d'Habitation",
      type: "VERSEMENT",
      periods: ["ANNUEL"],
      excludedBy: [],
      category: "Taxes Locales",
      description: "Taxe annuelle d'habitation",
      icon: "🏠"
    },
    T_PROF: {
      name: "Taxe Professionnelle (Patente)",
      type: "VERSEMENT",
      periods: ["ANNUEL"],
      excludedBy: [],
      category: "Taxes Locales",
      description: "Patente annuelle",
      icon: "🏪"
    },

    // VERSEMENTS - Taxes sur Produits
    TPA: {
      name: "TPA",
      type: "VERSEMENT",
      periods: ["ANNUEL"],
      pmOnly: true,
      excludedBy: [],
      category: "Taxes sur Produits",
      description: "Taxe sur les Produits Agricoles",
      icon: "🌾"
    },

    // DECLARATIONS
    DECL_TP: {
      name: "Déclaration TP Optionnelle",
      type: "DECLARATION",
      optional: true,
      excludedBy: [],
      category: "Déclarations Optionnelles",
      description: "Déclaration optionnelle",
      icon: "📝"
    },
    ETAT_9421: {
      name: "État 9421",
      type: "DECLARATION",
      pmOnly: true,
      mandatory: true,
      excludedBy: [],
      category: "Déclarations Obligatoires",
      description: "Obligatoire pour PM",
      icon: "📊"
    },
    ETAT_9000: {
      name: "État 9000",
      type: "DECLARATION",
      ppOnly: true,
      mandatory: true,
      excludedBy: [],
      category: "Déclarations Obligatoires",
      description: "Obligatoire pour PP",
      icon: "👤"
    },
    ETAT_SYNTHESE: {
      name: "État de Synthèse",
      type: "DECLARATION",
      mandatory: true,
      excludedBy: ["CPU"],
      category: "Déclarations Obligatoires",
      description: "État financier annuel",
      icon: "📈"
    }
  };

  // Get available taxes based on conditions
  const getAvailableTaxes = () => {
    const available = {};
    
    Object.entries(taxDefinitions).forEach(([key, tax]) => {
      let isAvailable = true;
      let isDisabled = false;
      let disabledReason = "";
      
      // Check client type restrictions
      if (selectedClient) {
        if (tax.pmOnly && selectedClient.type !== "PM") {
          isAvailable = false;
          disabledReason = "Réservé aux Personnes Morales";
        }
        if (tax.ppOnly && selectedClient.type !== "PP") {
          isAvailable = false;
          disabledReason = "Réservé aux Personnes Physiques";
        }
      }
      
      // Check if excluded by selected taxes
      if (tax.excludedBy?.some(excluder => selectedTaxes.has(excluder))) {
        isDisabled = true;
        const excluderTax = tax.excludedBy.find(excluder => selectedTaxes.has(excluder));
        disabledReason = `Exclu par ${taxDefinitions[excluderTax]?.name}`;
      }
      
      // Check conflicts
      if (tax.conflicts?.some(conflict => selectedTaxes.has(conflict))) {
        isDisabled = true;
        const conflictTax = tax.conflicts.find(conflict => selectedTaxes.has(conflict));
        disabledReason = `Incompatible avec ${taxDefinitions[conflictTax]?.name}`;
      }
      
      if (isAvailable) {
        available[key] = { ...tax, isDisabled, disabledReason };
      }
    });
    
    return available;
  };

  // Handle tax selection
  const handleTaxToggle = (taxKey) => {
    const newSelected = new Set(selectedTaxes);
    const tax = taxDefinitions[taxKey];
    
    if (newSelected.has(taxKey)) {
      // Remove tax
      newSelected.delete(taxKey);
      const newConfig = { ...taxConfig };
      delete newConfig[taxKey];
      setTaxConfig(newConfig);
    } else {
      // Add tax
      newSelected.add(taxKey);
      
      // Remove any taxes that this one excludes
      if (tax.excludes) {
        tax.excludes.forEach(excluded => {
          newSelected.delete(excluded);
          const newConfig = { ...taxConfig };
          delete newConfig[excluded];
          setTaxConfig(newConfig);
        });
      }
      
      // Set default configuration
      setTaxConfig(prev => ({
        ...prev,
        [taxKey]: {
          periode: tax.periods ? tax.periods[0] : null,
          quarters: tax.isQuarterly ? [1, 2, 3, 4] : [],
          months: tax.periods?.includes("MENSUEL") ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : []
        }
      }));
    }
    
    setSelectedTaxes(newSelected);
  };

  // Update tax configuration
  const updateTaxConfig = (taxKey, field, value) => {
    setTaxConfig(prev => ({
      ...prev,
      [taxKey]: {
        ...prev[taxKey],
        [field]: value
      }
    }));
  };

  // Group taxes by category
  const groupedTaxes = {};
  Object.entries(getAvailableTaxes()).forEach(([key, tax]) => {
    if (!groupedTaxes[tax.category]) {
      groupedTaxes[tax.category] = [];
    }
    groupedTaxes[tax.category].push({ key, ...tax });
  });

  // Get active conflicts
  const getActiveConflicts = () => {
    const conflicts = [];
    
    if (selectedTaxes.has("IS") && selectedTaxes.has("CM")) {
      conflicts.push({
        type: "error",
        message: "IS et CM ne peuvent pas coexister"
      });
    }
    
    if (selectedTaxes.has("CPU")) {
      const excluded = ["IR_PROF", "CM", "IS", "TVA"].filter(tax => selectedTaxes.has(tax));
      if (excluded.length > 0) {
        conflicts.push({
          type: "warning",
          message: `CPU exclut automatiquement: ${excluded.map(tax => taxDefinitions[tax]?.name).join(", ")}`
        });
      }
    }
    
    return conflicts;
  };

  // Validation
  const validateStep = (stepIndex) => {
    const newErrors = {};

    if (stepIndex === 0) {
      if (!formData.id_client) newErrors.id_client = "Client requis";
      if (!formData.annee_fiscal) newErrors.annee_fiscal = "Année fiscale requise";
      if (!formData.description.trim()) newErrors.description = "Description requise";
    }

    if (stepIndex === 1) {
      if (selectedTaxes.size === 0) newErrors.taxes = "Veuillez sélectionner au moins un impôt ou une déclaration";
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
    
    // Handle client selection
    if (name === "id_client") {
      const client = clients.find(c => c.id_client == value);
      setSelectedClient(client);
      setSelectedTaxes(new Set());
      setTaxConfig({});
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

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

  const getSelectedClient = () => {
    return clients.find(client => client.id_client == formData.id_client);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("Données du formulaire fiscal:", { formData, selectedTaxes: Array.from(selectedTaxes), taxConfig });
    alert("Historique fiscal créé avec succès!");
    navigate("/historique-fiscal");
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
    <div className="w-full mx-auto h-full min-h-screen">
      <div className="flex flex-col md:flex-row h-full">
        {/* Mobile Header */}
        <div className="md:hidden p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              Créer un Nouvel Historique Fiscal
            </h1>
            <p className="text-gray-600 mb-4">
              Suivez les étapes ci-dessous pour créer un historique fiscal complet
            </p>
          </div>
          <MobileStepIndicator />
          <Separator className="my-4" />
        </div>

        {/* Desktop Left Sidebar */}
        <div className="hidden md:block w-1/3 p-8 border-r-2 border-gray-200">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              Créer un Nouvel Historique Fiscal
            </h1>
            <p className="text-gray-600 mb-4">
              Suivez les étapes ci-dessous pour créer un historique fiscal complet
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
                    Renseignez les informations principales de l'historique fiscal
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
                    <span className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.id_client}
                    </span>
                  )}
                </div>

                {/* Année fiscale et Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="annee_fiscal">
                      Année Fiscale <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="annee_fiscal"
                      type="number"
                      min="2000"
                      max="2050"
                      value={formData.annee_fiscal}
                      onChange={(e) => handleInputChange("annee_fiscal", e.target.value)}
                      className={errors.annee_fiscal ? "border-red-500" : ""}
                      placeholder="2025"
                    />
                    {errors.annee_fiscal && (
                      <span className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.annee_fiscal}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={errors.description ? "border-red-500" : ""}
                    rows={4}
                    placeholder="Description de l'historique fiscal..."
                  />
                  {errors.description && (
                    <span className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commentaire_general">Commentaire Général</Label>
                  <Textarea
                    id="commentaire_general"
                    value={formData.commentaire_general}
                    onChange={(e) => handleInputChange("commentaire_general", e.target.value)}
                    rows={3}
                    placeholder="Commentaire général sur l'historique fiscal..."
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

            {/* Étape 2: Sélection des Impôts */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2">
                    Sélection des Impôts et Déclarations
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Sélectionnez les impôts et déclarations applicables. Les incompatibilités sont gérées automatiquement.
                  </p>
                </div>

                {/* Conflicts and Warnings */}
                {getActiveConflicts().length > 0 && (
                  <div className="space-y-2">
                    {getActiveConflicts().map((conflict, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        conflict.type === "error" 
                          ? "bg-red-50 border-red-400 dark:bg-red-950/50" 
                          : "bg-yellow-50 border-yellow-400 dark:bg-yellow-950/50"
                      }`}>
                        <div className="flex items-start gap-2">
                          {conflict.type === "error" ? (
                            <Ban className="w-5 h-5 text-red-600 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          )}
                          <p className={`${
                            conflict.type === "error" 
                              ? "text-red-700 dark:text-red-300" 
                              : "text-yellow-700 dark:text-yellow-300"
                          }`}>
                            {conflict.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {errors.taxes && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border-l-4 border-red-400">
                    <p className="text-red-700 dark:text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.taxes}
                    </p>
                  </div>
                )}

                {/* Tax Categories */}
                {Object.entries(groupedTaxes).map(([category, taxes]) => (
                  <TaxCategoryCard
                    key={category}
                    category={category}
                    taxes={taxes}
                    selectedTaxes={selectedTaxes}
                    taxConfig={taxConfig}
                    onTaxToggle={handleTaxToggle}
                    updateTaxConfig={updateTaxConfig}
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
                  <h3 className="text-lg font-semibold mb-2">
                    Révision de vos informations
                  </h3>
                  <p className="text-gray-600">
                    Veuillez vérifier vos détails avant de créer l'historique fiscal.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Informations de base */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Informations de Base
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-600">Client:</span>
                          <span className="font-medium text-gray-900 flex items-center gap-2">
                            {selectedClient?.type === "PM" ? (
                              <Building2 className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Users className="w-4 h-4 text-green-600" />
                            )}
                            {getSelectedClient() ? formatClientName(getSelectedClient()) : formData.id_client}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-600">Année Fiscale:</span>
                          <span className="font-medium text-gray-900">
                            {formData.annee_fiscal}
                          </span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-gray-600">Description:</span>
                          <p className="font-medium text-gray-900 mt-1">
                            {formData.description}
                          </p>
                        </div>
                        {formData.commentaire_general && (
                          <div className="sm:col-span-2">
                            <span className="text-gray-600">Commentaire Général:</span>
                            <p className="font-medium text-gray-900 mt-1">
                              {formData.commentaire_general}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Impôts et déclarations sélectionnés */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Impôts et Déclarations Sélectionnés
                        <Badge variant="default">
                          {selectedTaxes.size} élément{selectedTaxes.size > 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Array.from(selectedTaxes).map(taxKey => {
                        const tax = taxDefinitions[taxKey];
                        const config = taxConfig[taxKey];
                        return (
                          <div key={taxKey} className="border-l-4 border-blue-200 pl-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-900 flex items-center gap-2">
                                <span className="text-lg">{tax.icon}</span>
                                {tax.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {tax.category}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {tax.type === "VERSEMENT" ? (
                                <div className="space-y-1">
                                  <div>Période: {config?.periode || tax.periods?.[0] || "Annuel"}</div>
                                  {config?.quarters && config.quarters.length > 0 && (
                                    <div>Acomptes: T{config.quarters.join(', T')}</div>
                                  )}
                                  {config?.months && config.months.length > 0 && (
                                    <div>Mois: {config.months.length}/12 sélectionnés</div>
                                  )}
                                </div>
                              ) : (
                                "Déclaration annuelle"
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Final warnings */}
                  {getActiveConflicts().length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-800">
                          <AlertCircle className="w-5 h-5" />
                          Avertissements finaux
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {getActiveConflicts().map((conflict, index) => (
                          <div key={index} className={`p-3 rounded text-sm ${
                            conflict.type === "error" 
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200" 
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                          }`}>
                            {conflict.message}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
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
                    <Check className="w-4 h-4" /> Créer l'Historique Fiscal
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