import React, { useEffect, useState } from "react";
import {
  Check,
  AlertCircle,
  Ban,
  Receipt,
  ClipboardList,
  Loader2,
  Building2,
  Users
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import useClientStore from "@/store/useClientStore";
import useHistoriqueFiscalStore from "@/store/HistoriqueFiscalStore";

// Simple versement item component
const VersementItem = ({ versement, versementKey, isSelected, config, onToggle, updateConfig, isDisabled, disabledReason }) => (
  <div className={`border rounded-lg p-4 transition-all ${
    isSelected 
      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" 
      : isDisabled 
        ? "border-gray-200 bg-gray-50 dark:bg-gray-800/50 opacity-60"
        : "border-gray-200 hover:border-gray-300"
  }`}>
    <div className="flex items-start space-x-3">
      <Checkbox
        checked={isSelected}
        disabled={isDisabled}
        onCheckedChange={() => !isDisabled && onToggle(versementKey)}
        className="mt-1"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{versement.icon}</span>
          <span className="font-medium">{versement.name}</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">{versement.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {versement.mandatory && <Badge variant="destructive" className="text-xs">Obligatoire</Badge>}
          {versement.optional && <Badge variant="secondary" className="text-xs">Optionnel</Badge>}
          {versement.pmOnly && <Badge variant="outline" className="text-xs">PM</Badge>}
          {versement.ppOnly && <Badge variant="outline" className="text-xs">PP</Badge>}
        </div>

        {isDisabled && disabledReason && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <Ban className="w-3 h-3" />
            {disabledReason}
          </p>
        )}

        {isSelected && (
          <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded border space-y-3">
            {/* Period selection */}
            {versement.periods && versement.periods.length > 1 && (
              <div>
                <Label className="text-xs">Périodicité</Label>
                <Select
                  value={config?.periode}
                  onValueChange={(value) => updateConfig(versementKey, 'periode', value)}
                >
                  <SelectTrigger className="h-8 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {versement.periods.map(period => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Monthly selection and amounts */}
            {config?.periode === "MENSUEL" && (
              <div>
                <Label className="text-xs">Sélectionnez les mois et montants (MAD)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { num: 1, name: "Janvier" }, { num: 2, name: "Février" }, { num: 3, name: "Mars" },
                    { num: 4, name: "Avril" }, { num: 5, name: "Mai" }, { num: 6, name: "Juin" },
                    { num: 7, name: "Juillet" }, { num: 8, name: "Août" }, { num: 9, name: "Septembre" },
                    { num: 10, name: "Octobre" }, { num: 11, name: "Novembre" }, { num: 12, name: "Décembre" }
                  ].map(month => (
                    <div key={month.num} className="border rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Checkbox
                          checked={config?.selectedPeriods?.includes(month.num)}
                          onCheckedChange={(checked) => {
                            const newPeriods = checked
                              ? [...(config?.selectedPeriods || []), month.num]
                              : config?.selectedPeriods?.filter(m => m !== month.num) || [];
                            updateConfig(versementKey, 'selectedPeriods', newPeriods);
                          }}
                        />
                        <Label className="text-xs font-medium">{month.name}</Label>
                      </div>
                      {config?.selectedPeriods?.includes(month.num) && (
                        <div className="space-y-1">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Montant payé"
                            className="h-7 text-xs"
                            value={config?.amounts?.[`M${month.num}`] || ''}
                            onChange={(e) => updateConfig(versementKey, `amounts.M${month.num}`, e.target.value)}
                          />
                          <Select
                            value={config?.statuts?.[`M${month.num}`] || 'NON_PAYE'}
                            onValueChange={(value) => updateConfig(versementKey, `statuts.M${month.num}`, value)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NON_PAYE">Non payé</SelectItem>
                              <SelectItem value="PAYE">Payé</SelectItem>
                              <SelectItem value="EN_RETARD">En retard</SelectItem>
                              <SelectItem value="PARTIEL">Partiel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quarterly selection and amounts */}
            {config?.periode === "TRIMESTRIEL" && (
              <div>
                <Label className="text-xs">Sélectionnez les trimestres et montants (MAD)</Label>
                <div className="grid grid-cols-1 gap-2 mt-1">
                  {(["TVA", "TDB", "TS", "TPT"].includes(versementKey) ? [
                    { num: 1, name: "T1 (Janvier-Février-Mars)" },
                    { num: 2, name: "T2 (Avril-Mai-Juin)" },
                    { num: 3, name: "T3 (Juillet-Août-Septembre)" },
                    { num: 4, name: "T4 (Octobre-Novembre-Décembre)" }
                  ] : [
                    { num: 1, name: "T1" },
                    { num: 2, name: "T2" },
                    { num: 3, name: "T3" },
                    { num: 4, name: "T4" }
                  ]).map(quarter => (
                    <div key={quarter.num} className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                          checked={config?.selectedPeriods?.includes(quarter.num)}
                          onCheckedChange={(checked) => {
                            const newPeriods = checked
                              ? [...(config?.selectedPeriods || []), quarter.num]
                              : config?.selectedPeriods?.filter(q => q !== quarter.num) || [];
                            updateConfig(versementKey, 'selectedPeriods', newPeriods);
                          }}
                        />
                        <Label className="text-sm font-medium">{quarter.name}</Label>
                      </div>
                      {config?.selectedPeriods?.includes(quarter.num) && (
                        <div className="space-y-2 ml-6">
                          {/* Amount and Status row */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Montant payé</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="h-8 text-xs mt-1"
                                value={config?.amounts?.[`T${quarter.num}`] || ''}
                                onChange={(e) => updateConfig(versementKey, `amounts.T${quarter.num}`, e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Statut</Label>
                              <Select
                                value={config?.statuts?.[`T${quarter.num}`] || 'NON_PAYE'}
                                onValueChange={(value) => updateConfig(versementKey, `statuts.T${quarter.num}`, value)}
                              >
                                <SelectTrigger className="h-8 text-xs mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="NON_PAYE">Non payé</SelectItem>
                                  <SelectItem value="PAYE">Payé</SelectItem>
                                  <SelectItem value="EN_RETARD">En retard</SelectItem>
                                  <SelectItem value="PARTIEL">Partiel</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          {/* Date range only for IS (not TVA, TDB, TS, TPT) */}
                          {!["TVA", "TDB", "TS", "TPT"].includes(versementKey) && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Date début</Label>
                                <Input
                                  type="date"
                                  className="h-8 text-xs mt-1"
                                  value={config?.dateRanges?.[`T${quarter.num}`]?.start || ''}
                                  onChange={(e) => updateConfig(versementKey, `dateRanges.T${quarter.num}.start`, e.target.value)}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Date fin</Label>
                                <Input
                                  type="date"
                                  className="h-8 text-xs mt-1"
                                  value={config?.dateRanges?.[`T${quarter.num}`]?.end || ''}
                                  onChange={(e) => updateConfig(versementKey, `dateRanges.T${quarter.num}.end`, e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Annual amount and status */}
            {config?.periode === "ANNUEL" && (
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Montant payé annuel (MAD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="h-8 mt-1"
                    value={config?.montant || ''}
                    onChange={(e) => updateConfig(versementKey, 'montant', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Statut de paiement</Label>
                  <Select
                    value={config?.statut || 'NON_PAYE'}
                    onValueChange={(value) => updateConfig(versementKey, 'statut', value)}
                  >
                    <SelectTrigger className="h-8 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NON_PAYE">Non payé</SelectItem>
                      <SelectItem value="PAYE">Payé</SelectItem>
                      <SelectItem value="EN_RETARD">En retard</SelectItem>
                      <SelectItem value="PARTIEL">Partiel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Simple declaration item component
const DeclarationItem = ({ declaration, declarationKey, isSelected, onToggle, isDisabled, disabledReason }) => (
  <div className={`border rounded-lg p-3 transition-all ${
    isSelected 
      ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
      : isDisabled 
        ? "border-gray-200 bg-gray-50 dark:bg-gray-800/50 opacity-60"
        : "border-gray-200 hover:border-gray-300"
  }`}>
    <div className="flex items-start space-x-3">
      <Checkbox
        checked={isSelected}
        disabled={isDisabled}
        onCheckedChange={() => !isDisabled && onToggle(declarationKey)}
        className="mt-1"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{declaration.icon}</span>
          <span className="font-medium">{declaration.name}</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">{declaration.description}</p>
        
        <div className="flex flex-wrap gap-1">
          {declaration.mandatory && <Badge variant="destructive" className="text-xs">Obligatoire</Badge>}
          {declaration.optional && <Badge variant="secondary" className="text-xs">Optionnel</Badge>}
          {declaration.pmOnly && <Badge variant="outline" className="text-xs">PM</Badge>}
          {declaration.ppOnly && <Badge variant="outline" className="text-xs">PP</Badge>}
        </div>

        {isDisabled && disabledReason && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <Ban className="w-3 h-3" />
            {disabledReason}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default function AjouterHistoriqueFiscal() {
  const navigate = useNavigate();
  const { clients, fetchClients, loading: clientsLoading } = useClientStore();
  const { createHistorique, loading, error, clearError } = useHistoriqueFiscalStore();

  // Form state
  const [formData, setFormData] = useState({
    id_client: "",
    annee_fiscal: new Date().getFullYear().toString(),
    description: "",
    statut_global: "EN_COURS",
    commentaire_general: ""
  });

  const [selectedVersements, setSelectedVersements] = useState(new Set());
  const [versementConfig, setVersementConfig] = useState({});
  const [selectedDeclarations, setSelectedDeclarations] = useState(new Set());
  const [selectedClient, setSelectedClient] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (clients.length === 0 && !clientsLoading) {
      fetchClients();
    }
  }, [clients.length, fetchClients, clientsLoading]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  // Updated versement definitions with new RAS terms
  const versementDefinitions = {
    TVA: { name: "TVA", periods: ["MENSUEL", "TRIMESTRIEL", "ANNUEL"], category: "Taxes sur Chiffre d'Affaires", description: "Taxe sur la Valeur Ajoutée", icon: "💰", mandatory: true },
    IS: { name: "Impôt sur les Sociétés (IS)", periods: ["TRIMESTRIEL"], category: "Impôts sur Bénéfices", description: "4 acomptes trimestriels", icon: "🏢", mandatory: true },
    CM: { name: "Cotisation Minimale", periods: ["ANNUEL"], category: "Impôts sur Bénéfices", description: "Alternative à l'IS", icon: "📊" },
    DT: { name: "Droits de Timbre", periods: ["MENSUEL"], category: "Droits et Taxes", description: "Droits de timbre mensuels", icon: "📋" },
    IR_SALAIRES: { name: "IR sur Salaires", periods: ["MENSUEL"], category: "Impôts sur Revenus", description: "Retenue à la source mensuelle", icon: "👥", mandatory: true },
    IR_PROF: { name: "IR Professionnel", periods: ["ANNUEL"], category: "Impôts sur Revenus", description: "Pour les personnes physiques", icon: "👤", ppOnly: true },
    IR_RAS_LOYER: { name: "IR-RAS/Loyer", periods: ["MENSUEL"], category: "Impôts sur Revenus", description: "Retenue à la source sur loyers", icon: "🏠" },
    IS_RAS_HONORAIRES: { name: "IS-RAS/Honoraires", periods: ["MENSUEL", "TRIMESTRIEL"], category: "Impôts sur Bénéfices", description: "Retenue à la source sur honoraires (PM)", icon: "💼", pmOnly: true },
    IR_RAS_HONORAIRES: { name: "IR-RAS/Honoraires", periods: ["MENSUEL", "TRIMESTRIEL"], category: "Impôts sur Revenus", description: "Retenue à la source sur honoraires (PP)", icon: "💼", ppOnly: true },
    CPU: { name: "CPU", periods: ["MENSUEL"], category: "Contributions Spéciales", description: "Contribution Professionnelle Unique", icon: "⚡" },
    CSS: { name: "CSS", periods: ["MENSUEL"], category: "Contributions Sociales", description: "Contribution Sociale de Solidarité", icon: "🤝" },
    TDB: { name: "Taxe sur Débits de Boissons", periods: ["TRIMESTRIEL"], category: "Taxes Spécialisées", description: "Pour les débits de boissons", icon: "🍺", optional: true },
    TS: { name: "Taxe de Séjour", periods: ["TRIMESTRIEL"], category: "Taxes sur Services", description: "Taxe trimestrielle de séjour", icon: "🏨" },
    TPT: { name: "Taxe de Promotion Touristique", periods: ["TRIMESTRIEL"], category: "Taxes Spécialisées", description: "Taxe trimestrielle de promotion touristique", icon: "🏝️", optional: true },
    TH: { name: "Taxe d'Habitation", periods: ["ANNUEL"], category: "Taxes Locales", description: "Taxe annuelle d'habitation", icon: "🏠" },
    T_PROF: { name: "Taxe Professionnelle (Patente)", periods: ["ANNUEL"], category: "Taxes Locales", description: "Patente annuelle", icon: "🏪" }
  };

  // Declaration definitions
  const declarationDefinitions = {
    ETAT_9421: { name: "État 9421", pmOnly: true, mandatory: true, category: "Déclarations Obligatoires", description: "Obligatoire pour PM", icon: "📊" },
    ETAT_9000: { name: "État 9000", ppOnly: true, mandatory: true, category: "Déclarations Obligatoires", description: "Obligatoire pour PP", icon: "👤" },
    ETAT_SYNTHESE: { name: "État de Synthèse", mandatory: true, category: "Déclarations Obligatoires", description: "État financier annuel", icon: "📈" },
    DECL_TP: { name: "Déclaration TP Optionnelle", optional: true, category: "Déclarations Optionnelles", description: "Déclaration optionnelle", icon: "📝" }
  };

  // Get available items based on client type
  const getAvailableVersements = () => {
    const available = {};
    Object.entries(versementDefinitions).forEach(([key, versement]) => {
      let isDisabled = false;
      let disabledReason = "";
      
      if (selectedClient) {
        if (versement.pmOnly && selectedClient.type !== "pm") {
          isDisabled = true;
          disabledReason = "Réservé aux Personnes Morales";
        }
        if (versement.ppOnly && selectedClient.type !== "pp") {
          isDisabled = true;
          disabledReason = "Réservé aux Personnes Physiques";
        }
      }
      
      available[key] = { ...versement, isDisabled, disabledReason };
    });
    return available;
  };

  const getAvailableDeclarations = () => {
    const available = {};
    Object.entries(declarationDefinitions).forEach(([key, declaration]) => {
      let isDisabled = false;
      let disabledReason = "";
      
      if (selectedClient) {
        if (declaration.pmOnly && selectedClient.type !== "pm") {
          isDisabled = true;
          disabledReason = "Réservé aux Personnes Morales (PM)";
        }
        if (declaration.ppOnly && selectedClient.type !== "pp") {
          isDisabled = true;
          disabledReason = "Réservé aux Personnes Physiques (PP)";
        }
      } else {
        if (declaration.pmOnly || declaration.ppOnly) {
          isDisabled = true;
          disabledReason = "Veuillez d'abord sélectionner un client";
        }
      }
      
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
      setVersementConfig(prev => ({
        ...prev,
        [versementKey]: {
          periode: versement.periods ? versement.periods[0] : "ANNUEL",
          montant: "",
          amounts: {},
          statuts: {},
          statut: "NON_PAYE",
          selectedPeriods: [],
          dateRanges: {} // New field for date ranges
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
        const [parent, child, grandchild] = field.split('.');
        if (grandchild) {
          // Handle nested objects like dateRanges.T1.start
          return {
            ...prev,
            [versementKey]: {
              ...current,
              [parent]: {
                ...current[parent],
                [child]: {
                  ...current[parent]?.[child],
                  [grandchild]: value
                }
              }
            }
          };
        } else {
          // Handle two-level nesting like amounts.M1
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

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "id_client") {
      const client = clients.find(c => c.id_client == value);
      setSelectedClient(client);
      setSelectedVersements(new Set());
      setVersementConfig({});
      setSelectedDeclarations(new Set());
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
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

  // Convert form data to API format
  const convertToApiFormat = () => {
    const paiements = [];
    const declarations = [];

    // Convert versements to paiements
    Array.from(selectedVersements).forEach(versementKey => {
      const versement = versementDefinitions[versementKey];
      const config = versementConfig[versementKey];

      if (config?.periode === "MENSUEL" && config?.selectedPeriods?.length > 0) {
        // Create paiement only for selected months
        config.selectedPeriods.forEach(month => {
          const amount = config.amounts?.[`M${month}`];
          const statut = config.statuts?.[`M${month}`] || 'NON_PAYE';
          
          paiements.push({
            type_impot: versement.name,
            periode: "MENSUEL",
            periode_numero: month, // Keep periode_numero for monthly
            montant_du: null,
            montant_paye: parseFloat(amount) || 0,
            statut: statut,
            commentaire: null
          });
        });
      } else if (config?.periode === "TRIMESTRIEL" && config?.selectedPeriods?.length > 0) {
        // Handle quarterly versements
        config.selectedPeriods.forEach(quarter => {
          const amount = config.amounts?.[`T${quarter}`];
          const statut = config.statuts?.[`T${quarter}`] || 'NON_PAYE';
          const dateStart = config.dateRanges?.[`T${quarter}`]?.start;
          const dateEnd = config.dateRanges?.[`T${quarter}`]?.end;
          
          if (["TVA", "TDB", "TS", "TPT"].includes(versementKey)) {
            // TVA, TDB, TS, TPT use periode_numero
            paiements.push({
              type_impot: versement.name,
              periode: "TRIMESTRIEL",
              periode_numero: quarter,
              montant_du: null,
              montant_paye: parseFloat(amount) || 0,
              statut: statut,
              commentaire: null
            });
          } else {
            // Other quarterly versements (IS) use date ranges
            paiements.push({
              type_impot: versement.name,
              periode: "TRIMESTRIEL",
              periode_numero: null, // No period number for IS
              date_start: dateStart || null,
              date_end: dateEnd || null,
              montant_du: null,
              montant_paye: parseFloat(amount) || 0,
              statut: statut,
              commentaire: null
            });
          }
        });
      } else {
        // Annual payment
        paiements.push({
          type_impot: versement.name,
          periode: config?.periode || "ANNUEL",
          periode_numero: null,
          montant_du: null,
          montant_paye: parseFloat(config?.montant) || 0,
          statut: config?.statut || "NON_PAYE",
          commentaire: null
        });
      }
    });

    // Convert selected declarations
    Array.from(selectedDeclarations).forEach(declarationKey => {
      const declaration = declarationDefinitions[declarationKey];
      declarations.push({
        type_declaration: declaration.name,
        annee_declaration: parseInt(formData.annee_fiscal),
        dateDeclaration: null,
        montant_declare: 0,
        date_limite: null,
        statut_declaration: "NON_DEPOSEE",
        obligatoire: declaration.mandatory || false,
        commentaire: null
      });
    });

    return {
      id_client: formData.id_client,
      annee_fiscal: formData.annee_fiscal,
      description: formData.description,
      statut_global: formData.statut_global,
      commentaire_general: formData.commentaire_general,
      paiements,
      declarations
    };
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.id_client) newErrors.id_client = "Client requis";
    if (!formData.annee_fiscal) newErrors.annee_fiscal = "Année fiscale requise";
    if (!formData.description.trim()) newErrors.description = "Description requise";
    if (selectedVersements.size === 0) newErrors.versements = "Veuillez sélectionner au moins un versement";
    if (selectedDeclarations.size === 0) newErrors.declarations = "Veuillez sélectionner au moins une déclaration";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const apiData = convertToApiFormat();
      console.log("Données envoyées à l'API:", apiData);
      
      const result = await createHistorique(apiData);
      console.log("Historique créé avec succès:", result);
      
      // alert("Historique fiscal créé avec succès!");
      navigate("/historique_fiscal");
      
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      
      if (error.errors) {
        setErrors(error.errors);
      } else {
        console.log(`Erreur: ${error.message || "Une erreur est survenue lors de la création de l'historique fiscal"}`);
      }
    }
  };

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement des clients...</span>
        </div>
      </div>
    );
  }

  const availableVersements = getAvailableVersements();
  const availableDeclarations = getAvailableDeclarations();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Créer un Nouvel Historique Fiscal</h1>
        <p className="text-gray-600">Renseignez les informations et sélectionnez les éléments applicables</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200">
          <p className="text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Basic Information */}
        <div>
          <CardHeader>
            <CardTitle>Informations de Base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_client">Client <span className="text-red-500">*</span></Label>
                <Select value={formData.id_client} onValueChange={(value) => handleInputChange("id_client", value)}>
                  <SelectTrigger className={errors.id_client ? "border-red-500" : ""}>
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
                {errors.id_client && (
                  <span className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.id_client}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="annee_fiscal">Année Fiscale <span className="text-red-500">*</span></Label>
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

            {formData.id_client && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2">
                  {getSelectedClient()?.type === "pm" ? (
                    <Building2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Users className="w-4 h-4 text-green-600" />
                  )}
                  <span className="font-medium text-blue-800">
                    {formatClientName(getSelectedClient())} - {getSelectedClient()?.type}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={errors.description ? "border-red-500" : ""}
                rows={3}
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
                rows={2}
                placeholder="Commentaire général sur l'historique fiscal..."
              />
            </div>
          </CardContent>
        </div>

        {/* Versements */}
        <div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Versements (Paiements)
              <Badge variant="secondary">{selectedVersements.size}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errors.versements && (
              <div className="mb-4 p-3 bg-red-50 rounded border-l-4 border-red-400">
                <p className="text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.versements}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(availableVersements).map(([key, versement]) => (
                <VersementItem
                  key={key}
                  versement={versement}
                  versementKey={key}
                  isSelected={selectedVersements.has(key)}
                  config={versementConfig[key]}
                  onToggle={handleVersementToggle}
                  updateConfig={updateVersementConfig}
                  isDisabled={versement.isDisabled}
                  disabledReason={versement.disabledReason}
                />
              ))}
            </div>
          </CardContent>
        </div>

        {/* Declarations */}
        <div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Déclarations
              <Badge variant="secondary">{selectedDeclarations.size}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errors.declarations && (
              <div className="mb-4 p-3 bg-red-50 rounded border-l-4 border-red-400">
                <p className="text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.declarations}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(availableDeclarations).map(([key, declaration]) => (
                <DeclarationItem
                  key={key}
                  declaration={declaration}
                  declarationKey={key}
                  isSelected={selectedDeclarations.has(key)}
                  onToggle={handleDeclarationToggle}
                  isDisabled={declaration.isDisabled}
                  disabledReason={declaration.disabledReason}
                />
              ))}
            </div>
          </CardContent>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/historique_fiscal")}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Création en cours...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Créer l'Historique Fiscal
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}