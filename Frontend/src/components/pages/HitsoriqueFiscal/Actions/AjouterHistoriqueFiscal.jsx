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
  Zap,
  Receipt,
  ClipboardList
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

// Versement Card Component
const VersementCard = ({ category, versements, selectedVersements, versementConfig, onVersementToggle, updateVersementConfig }) => (
  <Card className="mb-4">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-lg">
        <Receipt className="w-5 h-5" />
        {category}
        <Badge variant="secondary" className="text-xs">
          {versements.filter(v => selectedVersements.has(v.key)).length}/{versements.length}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {versements.map(({ key, name, periods, optional, mandatory, pmOnly, ppOnly, description, icon, warning, isDisabled, disabledReason }) => {
          const isSelected = selectedVersements.has(key);
          const config = versementConfig[key];
          
          return (
            <div key={key} className={`border rounded-lg p-4 transition-all ${
              isSelected 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" 
                : isDisabled 
                  ? "border-gray-200 bg-gray-50 dark:bg-gray-800/50 opacity-60"
                  : "border-gray-200 hover:border-gray-300"
            }`}>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={key}
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => !isDisabled && onVersementToggle(key)}
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
                    </div>

                    {isDisabled && disabledReason && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <Ban className="w-3 h-3" />
                        {disabledReason}
                      </p>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="ml-6 space-y-4 p-4 bg-white dark:bg-gray-900 rounded border">
                    {/* Période Selection */}
                    {periods && periods.length > 1 && (
                      <div>
                        <Label className="text-xs font-medium">Périodicité</Label>
                        <Select
                          value={config?.periode}
                          onValueChange={(value) => updateVersementConfig(key, 'periode', value)}
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

                    {/* Special case for IS (quarterly) */}
                    {key === "IS" && (
                      <div>
                        <Label className="text-xs font-medium">Acomptes trimestriels</Label>
                        <div className="grid grid-cols-4 gap-2 mt-1">
                          {[1, 2, 3, 4].map(quarter => (
                            <div key={quarter}>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <Checkbox
                                  checked={config?.quarters?.includes(quarter)}
                                  onCheckedChange={(checked) => {
                                    const newQuarters = checked
                                      ? [...(config?.quarters || []), quarter]
                                      : config?.quarters?.filter(q => q !== quarter) || [];
                                    updateVersementConfig(key, 'quarters', newQuarters);
                                  }}
                                />
                                <span className="text-xs">T{quarter}</span>
                              </label>
                              {config?.quarters?.includes(quarter) && (
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Montant"
                                  className="h-8 mt-1 text-xs"
                                  value={config?.amounts?.[`T${quarter}`] || ''}
                                  onChange={(e) => updateVersementConfig(key, `amounts.T${quarter}`, e.target.value)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Monthly selection for TVA, DT, IR_SALAIRES, CSS */}
                    {(config?.periode === "MENSUEL" && ["TVA", "DT", "IR_SALAIRES", "CSS"].includes(key)) && (
                      <div>
                        <Label className="text-xs font-medium">Mois sélectionnés</Label>
                        <div className="grid grid-cols-6 gap-1 mt-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                            <div key={month}>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <Checkbox
                                  checked={config?.months?.includes(month)}
                                  onCheckedChange={(checked) => {
                                    const newMonths = checked
                                      ? [...(config?.months || []), month]
                                      : config?.months?.filter(m => m !== month) || [];
                                    updateVersementConfig(key, 'months', newMonths);
                                  }}
                                />
                                <span className="text-xs">{month}</span>
                              </label>
                              {config?.months?.includes(month) && (
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Montant"
                                  className="h-6 mt-1 text-xs"
                                  value={config?.amounts?.[`M${month}`] || ''}
                                  onChange={(e) => updateVersementConfig(key, `amounts.M${month}`, e.target.value)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quarterly selection for TDB, TS, TPT */}
                    {["TDB", "TS", "TPT"].includes(key) && (
                      <div>
                        <Label className="text-xs font-medium">Trimestres</Label>
                        <div className="grid grid-cols-4 gap-2 mt-1">
                          {[1, 2, 3, 4].map(quarter => (
                            <div key={quarter}>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <Checkbox
                                  checked={config?.quarters?.includes(quarter)}
                                  onCheckedChange={(checked) => {
                                    const newQuarters = checked
                                      ? [...(config?.quarters || []), quarter]
                                      : config?.quarters?.filter(q => q !== quarter) || [];
                                    updateVersementConfig(key, 'quarters', newQuarters);
                                  }}
                                />
                                <span className="text-xs">T{quarter}</span>
                              </label>
                              {config?.quarters?.includes(quarter) && (
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Montant"
                                  className="h-8 mt-1 text-xs"
                                  value={config?.amounts?.[`T${quarter}`] || ''}
                                  onChange={(e) => updateVersementConfig(key, `amounts.T${quarter}`, e.target.value)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Single amount for annual payments */}
                    {(key === "CM" || key === "IR_PROF" || key === "CPU" || key === "TSC" || key === "TH" || key === "T_PROF" || key === "TPA" || 
                      (config?.periode === "ANNUEL")) && key !== "IS" && (
                      <div>
                        <Label className="text-xs font-medium">Montant annuel (MAD)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="h-8 mt-1"
                          value={config?.montant || ''}
                          onChange={(e) => updateVersementConfig(key, 'montant', e.target.value)}
                        />
                      </div>
                    )}

                    {/* TVA Trimestrial amounts */}
                    {(config?.periode === "TRIMESTRIEL" && key === "TVA") && (
                      <div>
                        <Label className="text-xs font-medium">Montants trimestriels</Label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {[1, 2, 3, 4].map(quarter => (
                            <div key={quarter}>
                              <Label className="text-xs">T{quarter}</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="h-8 mt-1"
                                value={config?.amounts?.[`T${quarter}`] || ''}
                                onChange={(e) => updateVersementConfig(key, `amounts.T${quarter}`, e.target.value)}
                              />
                            </div>
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

// Declaration Card Component
const DeclarationCard = ({ category, declarations, selectedDeclarations, onDeclarationToggle }) => (
  <Card className="mb-4">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-lg">
        <ClipboardList className="w-5 h-5" />
        {category}
        <Badge variant="secondary" className="text-xs">
          {declarations.filter(d => selectedDeclarations.has(d.key)).length}/{declarations.length}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {declarations.map(({ key, name, optional, mandatory, pmOnly, ppOnly, description, icon, isDisabled, disabledReason }) => {
          const isSelected = selectedDeclarations.has(key);
          
          return (
            <div key={key} className={`border rounded-lg p-3 transition-all ${
              isSelected 
                ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
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
                    onCheckedChange={() => !isDisabled && onDeclarationToggle(key)}
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
                    </div>

                    {isDisabled && disabledReason && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <Ban className="w-3 h-3" />
                        {disabledReason}
                      </p>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="ml-6 p-3 bg-white dark:bg-gray-900 rounded border">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 dark:text-green-300">
                        Déclaration sélectionnée
                      </span>
                    </div>
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
  const { createHistorique } = useHistoriqueFiscalStore();

  // Form state
  const [formData, setFormData] = useState({
    id_client: "",
    annee_fiscal: new Date().getFullYear().toString(),
    description: "",
    statut_global: "EN_COURS",
    commentaire_general: ""
  });

  // Separate states for versements and declarations
  const [selectedVersements, setSelectedVersements] = useState(new Set());
  const [versementConfig, setVersementConfig] = useState({});
  const [selectedDeclarations, setSelectedDeclarations] = useState(new Set());
  const [selectedClient, setSelectedClient] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (clients.length === 0) {
      fetchClients();
    }
  }, [clients.length, fetchClients]);

  const steps = [
    { id: "basic", title: "Informations de Base", icon: FileText },
    { id: "versements", title: "Versements", icon: Receipt },
    { id: "declarations", title: "Déclarations", icon: ClipboardList },
    { id: "review", title: "Révision", icon: Check },
  ];

  // Versement definitions
  const versementDefinitions = {
    TVA: {
      name: "TVA",
      periods: ["MENSUEL", "TRIMESTRIEL", "ANNUEL"],
      defaultPeriod: "TRIMESTRIEL",
      category: "Taxes sur Chiffre d'Affaires",
      description: "Taxe sur la Valeur Ajoutée",
      icon: "💰",
      mandatory: true
    },
    IS: {
      name: "Impôt sur les Sociétés (IS)",
      periods: ["TRIMESTRIEL"],
      category: "Impôts sur Bénéfices",
      description: "4 acomptes trimestriels",
      icon: "🏢",
      mandatory: true,
      pmOnly: true
    },
    CM: {
      name: "Cotisation Minimale",
      periods: ["ANNUEL"],
      category: "Impôts sur Bénéfices",
      description: "Alternative à l'IS",
      icon: "📊",
      pmOnly: true
    },
    DT: {
      name: "Droits de Timbre",
      periods: ["MENSUEL"],
      category: "Droits et Taxes",
      description: "Droits de timbre mensuels",
      icon: "📋"
    },
    IR_SALAIRES: {
      name: "IR sur Salaires",
      periods: ["MENSUEL"],
      category: "Impôts sur Revenus",
      description: "Retenue à la source mensuelle",
      icon: "👥",
      mandatory: true
    },
    IR_PROF: {
      name: "IR Professionnel",
      periods: ["ANNUEL"],
      category: "Impôts sur Revenus",
      description: "Pour les personnes physiques",
      icon: "👤",
      ppOnly: true
    },
    CPU: {
      name: "CPU",
      periods: ["MENSUEL"],
      category: "Contributions Spéciales",
      description: "Contribution Professionnelle Unique",
      icon: "⚡"
    },
    CSS: {
      name: "CSS",
      periods: ["MENSUEL"],
      category: "Contributions Sociales",
      description: "Contribution Sociale de Solidarité",
      icon: "🤝"
    },
    TDB: {
      name: "Taxe sur Débits de Boissons",
      periods: ["TRIMESTRIEL"],
      optional: true,
      category: "Taxes Spécialisées",
      description: "Pour les débits de boissons",
      icon: "🍺"
    },
    TS: {
      name: "Taxe de Services",
      periods: ["TRIMESTRIEL"],
      category: "Taxes sur Services",
      description: "Taxe trimestrielle sur services",
      icon: "🛎️"
    },
    TPT: {
      name: "Taxe sur les Produits de Tabac",
      periods: ["TRIMESTRIEL"],
      optional: true,
      category: "Taxes Spécialisées",
      description: "Pour les produits de tabac",
      icon: "🚬"
    },
    TSC: {
      name: "Taxe Spéciale sur le Ciment",
      periods: ["ANNUEL"],
      optional: true,
      category: "Taxes Spécialisées",
      description: "Pour l'industrie du ciment",
      icon: "🏗️"
    },
    TH: {
      name: "Taxe d'Habitation",
      periods: ["ANNUEL"],
      category: "Taxes Locales",
      description: "Taxe annuelle d'habitation",
      icon: "🏠"
    },
    T_PROF: {
      name: "Taxe Professionnelle (Patente)",
      periods: ["ANNUEL"],
      category: "Taxes Locales",
      description: "Patente annuelle",
      icon: "🏪"
    },
    TPA: {
      name: "TPA",
      periods: ["ANNUEL"],
      pmOnly: true,
      category: "Taxes sur Produits",
      description: "Taxe sur les Produits Agricoles",
      icon: "🌾"
    }
  };

  // Declaration definitions
  const declarationDefinitions = {
    DECL_TP: {
      name: "Déclaration TP Optionnelle",
      optional: true,
      category: "Déclarations Optionnelles",
      description: "Déclaration optionnelle",
      icon: "📝"
    },
    ETAT_9421: {
      name: "État 9421",
      pmOnly: true,
      mandatory: true,
      category: "Déclarations Obligatoires",
      description: "Obligatoire pour PM",
      icon: "📊"
    },
    ETAT_9000: {
      name: "État 9000",
      ppOnly: true,
      mandatory: true,
      category: "Déclarations Obligatoires",
      description: "Obligatoire pour PP",
      icon: "👤"
    },
    ETAT_SYNTHESE: {
      name: "État de Synthèse",
      mandatory: true,
      category: "Déclarations Obligatoires",
      description: "État financier annuel",
      icon: "📈"
    }
  };

  // Get available items based on client type
  const getAvailableVersements = () => {
    const available = {};
    
    Object.entries(versementDefinitions).forEach(([key, versement]) => {
      let isAvailable = true;
      let isDisabled = false;
      let disabledReason = "";
      
      if (selectedClient) {
        if (versement.pmOnly && selectedClient.type !== "PM") {
          isAvailable = false;
          disabledReason = "Réservé aux Personnes Morales";
        }
        if (versement.ppOnly && selectedClient.type !== "PP") {
          isAvailable = false;
          disabledReason = "Réservé aux Personnes Physiques";
        }
      }
      
      if (isAvailable) {
        available[key] = { ...versement, isDisabled, disabledReason };
      }
    });
    
    return available;
  };

  const getAvailableDeclarations = () => {
    const available = {};
    
    Object.entries(declarationDefinitions).forEach(([key, declaration]) => {
      let isDisabled = false;
      let disabledReason = "";
      
      if (selectedClient) {
        // État 9421 - Only for Personnes Morales (PM)
        if (declaration.pmOnly && selectedClient.type !== "pm") {
          console.log("i'm here",selectedClient.type)
          isDisabled = true;
          disabledReason = "Réservé aux Personnes Morales (PM)";
        }
        // État 9000 - Only for Personnes Physiques (PP)
        if (declaration.ppOnly && selectedClient.type !== "pp") {
          isDisabled = true;
          disabledReason = "Réservé aux Personnes Physiques (PP)";
        }
      } else {
        // If no client selected, disable type-specific declarations
        if (declaration.pmOnly || declaration.ppOnly) {
          isDisabled = true;
          disabledReason = "Veuillez d'abord sélectionner un client";
        }
      }
      
      // Always include all declarations, but mark them as disabled if needed
      available[key] = { ...declaration, isDisabled, disabledReason };
    });
    
    return available;
  };

  // Handle versement selection
  const handleVersementToggle = (versementKey) => {
    const newSelected = new Set(selectedVersements);
    const versement = versementDefinitions[versementKey];
    
    if (newSelected.has(versementKey)) {
      newSelected.delete(versementKey);
      const newConfig = { ...versementConfig };
      delete newConfig[versementKey];
      setVersementConfig(newConfig);
    } else {
      newSelected.add(versementKey);
      
      // Set default configuration
      setVersementConfig(prev => ({
        ...prev,
        [versementKey]: {
          periode: versement.periods ? versement.periods[0] : "ANNUEL",
          quarters: versementKey === "IS" ? [1, 2, 3, 4] : [],
          months: versement.periods?.includes("MENSUEL") ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [],
          amounts: {},
          montant: ""
        }
      }));
    }
    
    setSelectedVersements(newSelected);
  };

  // Handle declaration selection
  const handleDeclarationToggle = (declarationKey) => {
    const newSelected = new Set(selectedDeclarations);
    
    if (newSelected.has(declarationKey)) {
      newSelected.delete(declarationKey);
    } else {
      newSelected.add(declarationKey);
    }
    
    setSelectedDeclarations(newSelected);
  };

  // Update versement configuration
  const updateVersementConfig = (versementKey, field, value) => {
    setVersementConfig(prev => {
      const current = prev[versementKey] || {};
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [versementKey]: {
            ...current,
            [parent]: {
              ...current[parent],
              [child]: value
            }
          }
        };
      }
      
      return {
        ...prev,
        [versementKey]: {
          ...current,
          [field]: value
        }
      };
    });
  };

  // Group items by category
  const groupedVersements = {};
  Object.entries(getAvailableVersements()).forEach(([key, versement]) => {
    if (!groupedVersements[versement.category]) {
      groupedVersements[versement.category] = [];
    }
    groupedVersements[versement.category].push({ key, ...versement });
  });

  const groupedDeclarations = {};
  Object.entries(getAvailableDeclarations()).forEach(([key, declaration]) => {
    if (!groupedDeclarations[declaration.category]) {
      groupedDeclarations[declaration.category] = [];
    }
    groupedDeclarations[declaration.category].push({ key, ...declaration });
  });

  // Validation
  const validateStep = (stepIndex) => {
    const newErrors = {};

    if (stepIndex === 0) {
      if (!formData.id_client) newErrors.id_client = "Client requis";
      if (!formData.annee_fiscal) newErrors.annee_fiscal = "Année fiscale requise";
      if (!formData.description.trim()) newErrors.description = "Description requise";
    }

    if (stepIndex === 1) {
      if (selectedVersements.size === 0) newErrors.versements = "Veuillez sélectionner au moins un versement";
    }

    if (stepIndex === 2) {
      if (selectedDeclarations.size === 0) newErrors.declarations = "Veuillez sélectionner au moins une déclaration";
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
    
    if (name === "id_client") {
      const client = clients.find(c => c.id_client == value);
      setSelectedClient(client);
      setSelectedVersements(new Set());
      setVersementConfig({});
      setSelectedDeclarations(new Set());
    }
    
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
    
    const fiscalData = {
      ...formData,
      versements: Array.from(selectedVersements).map(key => ({
        type: key,
        name: versementDefinitions[key].name,
        config: versementConfig[key]
      })),
      declarations: Array.from(selectedDeclarations).map(key => ({
        type: key,
        name: declarationDefinitions[key].name,
        done: true // Can be modified later in details
      }))
    };
    
    console.log("Données du formulaire fiscal:", fiscalData);
    alert("Historique fiscal créé avec succès!");
    navigate("/historique_fiscal");
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
                            Type: {getSelectedClient()?.type} • ID: {formData.id_client}
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

                {/* Année fiscale */}
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

            {/* Étape 2: Versements */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2">
                    Versements (Paiements)
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Sélectionnez les versements et indiquez les montants correspondants.
                  </p>
                </div>

                {errors.versements && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border-l-4 border-red-400">
                    <p className="text-red-700 dark:text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.versements}
                    </p>
                  </div>
                )}

                {/* Versement Categories */}
                {Object.entries(groupedVersements).map(([category, versements]) => (
                  <VersementCard
                    key={category}
                    category={category}
                    versements={versements}
                    selectedVersements={selectedVersements}
                    versementConfig={versementConfig}
                    onVersementToggle={handleVersementToggle}
                    updateVersementConfig={updateVersementConfig}
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

            {/* Étape 3: Déclarations */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2">
                    Déclarations
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Sélectionnez les déclarations applicables. Le statut (fait/non fait) sera géré dans les détails.
                  </p>
                </div>

                {errors.declarations && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border-l-4 border-red-400">
                    <p className="text-red-700 dark:text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.declarations}
                    </p>
                  </div>
                )}

                {/* Declaration Categories */}
                {Object.entries(groupedDeclarations).map(([category, declarations]) => (
                  <DeclarationCard
                    key={category}
                    category={category}
                    declarations={declarations}
                    selectedDeclarations={selectedDeclarations}
                    onDeclarationToggle={handleDeclarationToggle}
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

            {/* Étape 4: Révision */}
            {currentStep === 3 && (
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

                  {/* Versements sélectionnés */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        Versements Sélectionnés
                        <Badge variant="default">
                          {selectedVersements.size} élément{selectedVersements.size > 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Array.from(selectedVersements).map(versementKey => {
                        const versement = versementDefinitions[versementKey];
                        const config = versementConfig[versementKey];
                        return (
                          <div key={versementKey} className="border-l-4 border-blue-200 pl-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-900 flex items-center gap-2">
                                <span className="text-lg">{versement.icon}</span>
                                {versement.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {versement.category}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div className="space-y-1">
                                <div>Période: {config?.periode || versement.periods?.[0] || "Annuel"}</div>
                                {config?.montant && (
                                  <div>Montant: {config.montant} MAD</div>
                                )}
                                {config?.amounts && Object.keys(config.amounts).length > 0 && (
                                  <div>Montants détaillés: {Object.keys(config.amounts).length} période(s)</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Déclarations sélectionnées */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5" />
                        Déclarations Sélectionnées
                        <Badge variant="default">
                          {selectedDeclarations.size} élément{selectedDeclarations.size > 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Array.from(selectedDeclarations).map(declarationKey => {
                        const declaration = declarationDefinitions[declarationKey];
                        return (
                          <div key={declarationKey} className="border-l-4 border-green-200 pl-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-900 flex items-center gap-2">
                                <span className="text-lg">{declaration.icon}</span>
                                {declaration.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {declaration.category}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              Déclaration sélectionnée - Statut à définir dans les détails
                            </div>
                          </div>
                        );
                      })}
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