import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Save,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit3,
  Info
} from 'lucide-react';
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Alert, AlertDescription } from "@/components/ui/alert";
import useHistoriqueFiscalStore from "@/store/HistoriqueFiscalStore";

// Tax type definitions
const versementDefinitions = {
  TVA: { name: "TVA", periods: ["MENSUEL", "TRIMESTRIEL", "ANNUEL"], category: "Taxes sur Chiffre d'Affaires", description: "Taxe sur la Valeur Ajoutée", icon: "💰", mandatory: true },
  IS: { name: "Impôt sur les Sociétés (IS)", periods: ["TRIMESTRIEL"], category: "Impôts sur Bénéfices", description: "4 acomptes trimestriels", icon: "🏢", mandatory: true },
  CM: { name: "Cotisation Minimale", periods: ["ANNUEL"], category: "Impôts sur Bénéfices", description: "Alternative à l'IS", icon: "📊" },
  DT: { name: "Droits de Timbre", periods: ["MENSUEL"], category: "Droits et Taxes", description: "Droits de timbre mensuels", icon: "📋" },
  IR_SALAIRES: { name: "IR sur Salaires", periods: ["MENSUEL"], category: "Impôts sur Revenus", description: "Retenue à la source mensuelle", icon: "👥", mandatory: true },
  IR_PROF: { name: "IR Professionnel", periods: ["ANNUEL"], category: "Impôts sur Revenus", description: "Pour les personnes physiques", icon: "👤", ppOnly: true },
  CPU: { name: "CPU", periods: ["MENSUEL"], category: "Contributions Spéciales", description: "Contribution Professionnelle Unique", icon: "⚡" },
  CSS: { name: "CSS", periods: ["MENSUEL"], category: "Contributions Sociales", description: "Contribution Sociale de Solidarité", icon: "🤝" },
  TDB: { name: "Taxe sur Débits de Boissons", periods: ["TRIMESTRIEL"], category: "Taxes Spécialisées", description: "Pour les débits de boissons", icon: "🍺", optional: true },
  TS: { name: "Taxe de Séjour", periods: ["TRIMESTRIEL"], category: "Taxes sur Services", description: "Taxe trimestrielle de séjour", icon: "🏨" },
  TPT: { name: "Taxe de Promotion Touristique", periods: ["TRIMESTRIEL"], category: "Taxes Spécialisées", description: "Taxe trimestrielle de promotion touristique", icon: "🏝️", optional: true },
  TH: { name: "Taxe d'Habitation", periods: ["ANNUEL"], category: "Taxes Locales", description: "Taxe annuelle d'habitation", icon: "🏠" },
  T_PROF: { name: "Taxe Professionnelle (Patente)", periods: ["ANNUEL"], category: "Taxes Locales", description: "Patente annuelle", icon: "🏪" }
};

const declarationDefinitions = {
  ETAT_9421: { name: "État 9421", pmOnly: true, mandatory: true, category: "Déclarations Obligatoires", description: "Obligatoire pour PM", icon: "📊" },
  ETAT_9000: { name: "État 9000", ppOnly: true, mandatory: true, category: "Déclarations Obligatoires", description: "Obligatoire pour PP", icon: "👤" },
  ETAT_SYNTHESE: { name: "État de Synthèse", mandatory: true, category: "Déclarations Obligatoires", description: "État financier annuel", icon: "📈" },
  DECL_TP: { name: "Déclaration TP Optionnelle", optional: true, category: "Déclarations Optionnelles", description: "Déclaration optionnelle", icon: "📝" }
};

// Months for monthly periods
const MONTHS = [
  { num: 1, name: "Janvier", short: "Jan" },
  { num: 2, name: "Février", short: "Fév" },
  { num: 3, name: "Mars", short: "Mar" },
  { num: 4, name: "Avril", short: "Avr" },
  { num: 5, name: "Mai", short: "Mai" },
  { num: 6, name: "Juin", short: "Juin" },
  { num: 7, name: "Juillet", short: "Juil" },
  { num: 8, name: "Août", short: "Août" },
  { num: 9, name: "Septembre", short: "Sep" },
  { num: 10, name: "Octobre", short: "Oct" },
  { num: 11, name: "Novembre", short: "Nov" },
  { num: 12, name: "Décembre", short: "Déc" }
];

// Quarters for quarterly periods
const QUARTERS = [
  { num: 1, name: "T1 (Janvier-Mars)", short: "T1" },
  { num: 2, name: "T2 (Avril-Juin)", short: "T2" },
  { num: 3, name: "T3 (Juillet-Septembre)", short: "T3" },
  { num: 4, name: "T4 (Octobre-Décembre)", short: "T4" }
];

export default function UpdateSpecificTaxType({ 
  isOpen, 
  onClose, 
  taxCode, 
  isDeclaration = false, 
  historiqueId 
}) {
  const { 
    currentHistorique, 
    updateHistorique, 
    fetchHistoriqueById,
    loading 
  } = useHistoriqueFiscalStore();

  // State declarations
  const [periods, setPeriods] = useState([]);
  const [currentPeriodType, setCurrentPeriodType] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [initialPeriods, setInitialPeriods] = useState([]);
  const [errors, setErrors] = useState({});

  // Get tax definition
  const taxDefinition = isDeclaration 
    ? declarationDefinitions[taxCode] 
    : versementDefinitions[taxCode];

  // Load existing periods when modal opens
  useEffect(() => {
    if (isOpen && currentHistorique && taxCode) {
      loadExistingPeriods();
    }
  }, [isOpen, currentHistorique, taxCode]);

  // Check for changes
  useEffect(() => {
    if (initialPeriods.length >= 0) {
      const hasChanges = JSON.stringify(periods) !== JSON.stringify(initialPeriods);
      setHasChanges(hasChanges);
    }
  }, [periods, initialPeriods]);

  const loadExistingPeriods = () => {
    let existingPeriods = [];
    let detectedPeriodType = "";

    if (isDeclaration) {
      // Load existing declarations
      const relatedDeclarations = currentHistorique.declarations?.filter(d => 
        d.type_declaration === taxDefinition?.name || taxCode === d.type_declaration
      ) || [];

      existingPeriods = relatedDeclarations.map(d => ({
        id: d.id,
        type: 'declaration',
        periode: 'ANNUEL',
        periode_numero: null,
        annee: d.annee_declaration || currentHistorique.annee_fiscal,
        montant: d.montant_declare || 0,
        statut: d.statut_declaration || d.statut || 'NON_DEPOSEE',
        date: d.dateDeclaration || '',
        date_limite: d.date_limite || '',
        obligatoire: d.obligatoire || false,
        commentaire: d.commentaire || ''
      }));
      detectedPeriodType = "ANNUEL";
    } else {
      // Load existing payments
      const relatedPayments = currentHistorique.paiements?.filter(p => 
        p.type_impot === taxDefinition?.name || taxCode === p.type_impot
      ) || [];

      existingPeriods = relatedPayments.map(p => ({
        id: p.id,
        type: 'paiement',
        periode: p.periode || 'ANNUEL',
        periode_numero: p.periode_numero,
        annee: currentHistorique.annee_fiscal,
        montant: p.montant_paye || 0,
        statut: p.statut_paiement || p.statut || 'NON_PAYE',
        date_start: p.date_start || '',
        date_end: p.date_end || '',
        commentaire: p.commentaire || ''
      }));

      // Detect the current period type from existing data
      if (existingPeriods.length > 0) {
        detectedPeriodType = existingPeriods[0].periode;
      }
    }

    setPeriods(existingPeriods);
    setInitialPeriods(JSON.parse(JSON.stringify(existingPeriods)));
    
    // Set the current period type based on existing data or default to the first available
    if (detectedPeriodType) {
      setCurrentPeriodType(detectedPeriodType);
    } else if (taxDefinition?.periods?.length > 0) {
      // If no existing periods, default to the first available period type
      setCurrentPeriodType(taxDefinition.periods[0]);
    }
  };

  const handlePeriodChange = (index, field, value) => {
    setPeriods(prev => {
      const newPeriods = [...prev];
      newPeriods[index] = { ...newPeriods[index], [field]: value };
      return newPeriods;
    });

    // Clear error for this field
    if (errors[`${index}_${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${index}_${field}`]: ""
      }));
    }
  };

  const getMissingPeriodsInfo = () => {
    if (!currentPeriodType) return { count: 0, description: "Aucune configuration", canAdd: false, nextPeriod: null };

    if (currentPeriodType === "MENSUEL") {
      const existingMonths = periods
        .filter(p => p.periode === "MENSUEL")
        .map(p => p.periode_numero)
        .filter(Boolean);
      const missingMonths = MONTHS.filter(month => !existingMonths.includes(month.num));
      const nextMissingMonth = missingMonths[0]; // Get only the first missing month
      return {
        count: missingMonths.length,
        description: missingMonths.length > 0 ? 
          `Prochain: ${nextMissingMonth.name}` : 
          "Tous les 12 mois sont présents",
        canAdd: missingMonths.length > 0,
        nextPeriod: nextMissingMonth
      };
    } else if (currentPeriodType === "TRIMESTRIEL") {
      const existingQuarters = periods
        .filter(p => p.periode === "TRIMESTRIEL")
        .map(p => p.periode_numero)
        .filter(Boolean);
      const missingQuarters = QUARTERS.filter(quarter => !existingQuarters.includes(quarter.num));
      const nextMissingQuarter = missingQuarters[0]; // Get only the first missing quarter
      return {
        count: missingQuarters.length,
        description: missingQuarters.length > 0 ? 
          `Prochain: ${nextMissingQuarter.short}` : 
          "Tous les 4 trimestres sont présents",
        canAdd: missingQuarters.length > 0,
        nextPeriod: nextMissingQuarter
      };
    } else if (currentPeriodType === "ANNUEL") {
      const hasAnnualPeriod = periods.some(p => p.periode === "ANNUEL");
      return {
        count: hasAnnualPeriod ? 0 : 1,
        description: hasAnnualPeriod ? "Période annuelle déjà présente" : "Ajouter période annuelle",
        canAdd: !hasAnnualPeriod,
        nextPeriod: hasAnnualPeriod ? null : { name: "Annuel", num: 1 }
      };
    }
    
    return { count: 0, description: "Configuration inconnue", canAdd: false, nextPeriod: null };
  };

  const addNewPeriod = () => {
    if (!currentPeriodType) return;

    const newPeriod = {
      id: null, // Will be created on server
      type: isDeclaration ? 'declaration' : 'paiement',
      periode: currentPeriodType,
      periode_numero: null,
      annee: parseInt(currentHistorique.annee_fiscal),
      montant: 0,
      statut: isDeclaration ? 'NON_DEPOSEE' : 'NON_PAYE',
      date_start: '',
      date_end: '',
      date: '',
      date_limite: '',
      obligatoire: taxDefinition?.mandatory || false,
      commentaire: ''
    };

    const missingInfo = getMissingPeriodsInfo();
    
    if (!missingInfo.canAdd || !missingInfo.nextPeriod) return;

    // Add only the next missing period (one at a time)
    if (currentPeriodType === "MENSUEL") {
      const nextMonth = missingInfo.nextPeriod;
      const monthlyPeriod = {
        ...newPeriod,
        periode_numero: nextMonth.num,
        id: `new_${Date.now()}_${nextMonth.num}`
      };
      setPeriods(prev => [...prev, monthlyPeriod]);
    } else if (currentPeriodType === "TRIMESTRIEL") {
      const nextQuarter = missingInfo.nextPeriod;
      const quarterlyPeriod = {
        ...newPeriod,
        periode_numero: nextQuarter.num,
        id: `new_${Date.now()}_${nextQuarter.num}`
      };
      setPeriods(prev => [...prev, quarterlyPeriod]);
    } else {
      // Annual - add single period only if none exists
      const hasAnnualPeriod = periods.some(p => p.periode === "ANNUEL");
      if (!hasAnnualPeriod) {
        setPeriods(prev => [...prev, { ...newPeriod, id: `new_${Date.now()}` }]);
      }
    }
  };

  const removePeriod = (index) => {
    setPeriods(prev => prev.filter((_, i) => i !== index));
  };

  const validatePeriods = () => {
    const newErrors = {};
    let isValid = true;

    periods.forEach((period, index) => {
      if (period.montant && isNaN(parseFloat(period.montant))) {
        newErrors[`${index}_montant`] = "Le montant doit être un nombre";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // In UpdateSpecificTaxType.jsx - Replace the handleSave function with this:

const handleSave = async () => {
  if (!validatePeriods()) {
    return;
  }

  try {
    // Prepare the update data
    const currentPaiements = currentHistorique.paiements || [];
    const currentDeclarations = currentHistorique.declarations || [];

    if (isDeclaration) {
      // Update declarations
      const otherDeclarations = currentDeclarations.filter(d => 
        d.type_declaration !== taxDefinition?.name && taxCode !== d.type_declaration
      );

      const updatedDeclarations = [
        ...otherDeclarations,
        ...periods.filter(p => p.type === 'declaration').map(p => ({
          // FIX: Only include ID if it's a valid number, not a temporary ID
          ...(p.id && !p.id.toString().startsWith('new_') && !isNaN(p.id) ? { id: parseInt(p.id) } : {}),
          type_declaration: taxDefinition?.name || taxCode,
          annee_declaration: p.annee,
          dateDeclaration: p.date || null,
          montant_declare: parseFloat(p.montant) || 0,
          date_limite: p.date_limite || null,
          statut_declaration: p.statut,
          obligatoire: p.obligatoire,
          commentaire: p.commentaire || null
        }))
      ];

      await updateHistorique(historiqueId, {
        annee_fiscal: currentHistorique.annee_fiscal,
        description: currentHistorique.description,
        statut_global: currentHistorique.statut_global,
        commentaire_general: currentHistorique.commentaire_general,
        declarations: updatedDeclarations,
        paiements: currentPaiements
      });
    } else {
      // Update payments
      const otherPaiements = currentPaiements.filter(p => 
        p.type_impot !== taxDefinition?.name && taxCode !== p.type_impot
      );

      const updatedPaiements = [
        ...otherPaiements,
        ...periods.filter(p => p.type === 'paiement').map(p => ({
          // FIX: Only include ID if it's a valid number, not a temporary ID
          ...(p.id && !p.id.toString().startsWith('new_') && !isNaN(p.id) ? { id: parseInt(p.id) } : {}),
          type_impot: taxDefinition?.name || taxCode,
          periode: p.periode,
          periode_numero: p.periode_numero,
          date_start: p.date_start || null,
          date_end: p.date_end || null,
          montant_du: null,
          montant_paye: parseFloat(p.montant) || 0,
          // FIX: Use 'statut' not 'statut_paiement'
          statut: p.statut,
          commentaire: p.commentaire || null
        }))
      ];

      await updateHistorique(historiqueId, {
        annee_fiscal: currentHistorique.annee_fiscal,
        description: currentHistorique.description,
        statut_global: currentHistorique.statut_global,
        commentaire_general: currentHistorique.commentaire_general,
        paiements: updatedPaiements,
        declarations: currentDeclarations
      });
    }

    // Refresh the data and close modal
    await fetchHistoriqueById(historiqueId);
    onClose();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
  }
};

  const getStatusVariant = (status) => {
    // Handle null/undefined status
    if (!status) {
      return 'secondary';
    }
    
    switch (status) {
      case 'DEPOSEE':
      case 'PAYE': 
        return 'default';
      case 'NON_DEPOSEE':
      case 'NON_PAYE': 
        return 'secondary';
      case 'EN_RETARD': 
        return 'destructive';
      case 'PARTIEL': 
        return 'outline';
      default: 
        return 'secondary';
    }
  };

  const getPeriodDisplay = (period) => {
    if (period.periode === "MENSUEL" && period.periode_numero) {
      const month = MONTHS.find(m => m.num === period.periode_numero);
      return month ? month.name : `Mois ${period.periode_numero}`;
    }
    if (period.periode === "TRIMESTRIEL" && period.periode_numero) {
      const quarter = QUARTERS.find(q => q.num === period.periode_numero);
      return quarter ? quarter.name : `T${period.periode_numero}`;
    }
    return period.periode || 'Annuel';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 -m-6 mb-0 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{taxDefinition?.icon || '📄'}</span>
            <div>
              <DialogTitle className="text-xl">
                Modifier {taxDefinition?.name || taxCode}
              </DialogTitle>
              <DialogDescription>
                {taxDefinition?.description || 'Gestion des périodes'}
              </DialogDescription>
            </div>
            <div className="ml-auto">
              <Badge variant="outline">{periods.length} période(s)</Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-0">
          {/* Tax Info */}
         

          {/* Add New Period */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter des Périodes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentPeriodType ? (
                <div className="space-y-3">
                  <Alert>
                    <Info className="w-5 h-5" />
                    <AlertDescription>
                      <p className="font-medium mb-1">
                        Configuration: <span className="font-bold">{currentPeriodType}</span>
                      </p>
                      <p className="text-sm">
                        {(() => {
                          const missingInfo = getMissingPeriodsInfo();
                          return missingInfo.canAdd ? 
                            `${missingInfo.description}` : 
                            missingInfo.description;
                        })()}
                      </p>
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={addNewPeriod} 
                    disabled={!getMissingPeriodsInfo().canAdd}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {(() => {
                      const missingInfo = getMissingPeriodsInfo();
                      if (!missingInfo.canAdd) {
                        return "Toutes les périodes sont présentes";
                      }
                      if (currentPeriodType === "ANNUEL") {
                        return "Ajouter la période annuelle";
                      }
                      return `Ajouter ${missingInfo.nextPeriod?.name || missingInfo.nextPeriod?.short || 'période suivante'}`;
                    })()}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune configuration détectée</p>
                  <p className="text-sm">Les périodes seront configurées automatiquement lors du premier ajout</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Periods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Périodes Existantes ({periods.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {periods.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune période définie</p>
                  <p className="text-sm">Ajoutez une nouvelle période ci-dessus</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {periods.map((period, index) => (
                    <Card key={period.id || index} className="bg-gray-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getPeriodDisplay(period)}</span>
                            <Badge 
                              variant={getStatusVariant(period.statut || (isDeclaration ? 'NON_DEPOSEE' : 'NON_PAYE'))}
                            >
                              {period.statut || (isDeclaration ? 'NON_DEPOSEE' : 'NON_PAYE')}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePeriod(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Montant (MAD)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={period.montant || ''}
                              onChange={(e) => handlePeriodChange(index, 'montant', e.target.value)}
                              className={errors[`${index}_montant`] ? "border-red-500" : ""}
                              placeholder="0.00"
                            />
                            {errors[`${index}_montant`] && (
                              <p className="text-xs text-red-500">{errors[`${index}_montant`]}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Statut</Label>
                            <Select
                              value={period.statut || (isDeclaration ? 'NON_DEPOSEE' : 'NON_PAYE')}
                              onValueChange={(value) => handlePeriodChange(index, 'statut', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un statut" />
                              </SelectTrigger>
                              <SelectContent>
                                {isDeclaration ? (
                                  <>
                                    <SelectItem value="NON_DEPOSEE">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-500" />
                                        Non Déposée
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="DEPOSEE">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Déposée
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="EN_RETARD">
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        En Retard
                                      </div>
                                    </SelectItem>
                                  </>
                                ) : (
                                  <>
                                    <SelectItem value="NON_PAYE">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-500" />
                                        Non Payé
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="PAYE">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Payé
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="EN_RETARD">
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        En Retard
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="PARTIEL">
                                      <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-orange-500" />
                                        Partiel
                                      </div>
                                    </SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">
                              {isDeclaration ? 'Date Déclaration' : 'Date Début'}
                            </Label>
                            <Input
                              type="date"
                              value={isDeclaration ? (period.date || '') : (period.date_start || '')}
                              onChange={(e) => handlePeriodChange(
                                index, 
                                isDeclaration ? 'date' : 'date_start', 
                                e.target.value
                              )}
                            />
                          </div>

                          {!isDeclaration && (
                            <div className="space-y-1">
                              <Label className="text-xs">Date Fin</Label>
                              <Input
                                type="date"
                                value={period.date_end || ''}
                                onChange={(e) => handlePeriodChange(index, 'date_end', e.target.value)}
                              />
                            </div>
                          )}

                          {isDeclaration && (
                            <>
                              <div className="space-y-1">
                                <Label className="text-xs">Date Limite</Label>
                                <Input
                                  type="date"
                                  value={period.date_limite || ''}
                                  onChange={(e) => handlePeriodChange(index, 'date_limite', e.target.value)}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={period.obligatoire || false}
                                  onCheckedChange={(checked) => handlePeriodChange(index, 'obligatoire', checked)}
                                />
                                <Label className="text-xs">Obligatoire</Label>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="mt-3">
                          <Label className="text-xs">Commentaire</Label>
                          <Textarea
                            value={period.commentaire || ''}
                            onChange={(e) => handlePeriodChange(index, 'commentaire', e.target.value)}
                            rows={2}
                            placeholder="Commentaire sur cette période..."
                            className="mt-1"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 -m-6 mt-0 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || loading}
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les modifications
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}