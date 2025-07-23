import React, { useState, useEffect } from "react";
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
  Info,
  Undo,
  CalendarIcon,
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Alert, AlertDescription } from "@/components/ui/alert";
import useHistoriqueFiscalStore from "@/store/HistoriqueFiscalStore";

// Utility function to format dates for HTML date inputs
const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    // Convert to YYYY-MM-DD format for HTML date input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn("Error formatting date:", dateString, error);
    return "";
  }
};

// Tax type definitions
const versementDefinitions = {
  TVA: {
    name: "TVA",
    periods: ["MENSUEL", "TRIMESTRIEL", "ANNUEL"],
    description: "Taxe sur la Valeur Ajoutée",
    icon: "💰",
    mandatory: true,
  },
  IS: {
    name: "Impôt sur les Sociétés (IS)",
    periods: ["TRIMESTRIEL"],
    description: "4 acomptes trimestriels",
    icon: "🏢",
    mandatory: true,
  },
  CM: {
    name: "Cotisation Minimale",
    periods: ["ANNUEL"],
    description: "Alternative à l'IS",
    icon: "📊",
  },
  DT: {
    name: "Droits de Timbre",
    periods: ["MENSUEL"],
    description: "Droits de timbre mensuels",
    icon: "📋",
  },
  IR_SALAIRES: {
    name: "IR sur Salaires",
    periods: ["MENSUEL"],
    description: "Retenue à la source mensuelle",
    icon: "👥",
    mandatory: true,
  },
  IR_PROF: {
    name: "IR Professionnel",
    periods: ["ANNUEL"],
    description: "Pour les personnes physiques",
    icon: "👤",
    ppOnly: true,
  },
  IR_RAS_LOYER: {
    name: "IR-RAS/Loyer",
    periods: ["MENSUEL"],
    description: "Retenue à la source sur loyers",
    icon: "🏠",
  },
  IS_RAS_HONORAIRES: {
    name: "IS-RAS/Honoraires",
    periods: ["MENSUEL", "TRIMESTRIEL"],
    description: "Retenue à la source sur honoraires (PM)",
    icon: "💼",
    pmOnly: true,
  },
  IR_RAS_HONORAIRES: {
    name: "IR-RAS/Honoraires",
    periods: ["MENSUEL", "TRIMESTRIEL"],
    description: "Retenue à la source sur honoraires (PP)",
    icon: "💼",
    ppOnly: true,
  },
  CPU: {
    name: "CPU",
    periods: ["MENSUEL"],
    description: "Contribution Professionnelle Unique",
    icon: "⚡",
  },
  CSS: {
    name: "CSS",
    periods: ["MENSUEL"],
    description: "Contribution Sociale de Solidarité",
    icon: "🤝",
  },
  TDB: {
    name: "Taxe sur Débits de Boissons",
    periods: ["TRIMESTRIEL"],
    description: "Pour les débits de boissons",
    icon: "🍺",
    optional: true,
  },
  TS: {
    name: "Taxe de Séjour",
    periods: ["TRIMESTRIEL"],
    description: "Taxe trimestrielle de séjour",
    icon: "🏨",
  },
  TPT: {
    name: "Taxe de Promotion Touristique",
    periods: ["TRIMESTRIEL"],
    description: "Taxe trimestrielle de promotion touristique",
    icon: "🏝️",
    optional: true,
  },
  TH: {
    name: "Taxe d'Habitation",
    periods: ["ANNUEL"],
    description: "Taxe annuelle d'habitation",
    icon: "🏠",
  },
  T_PROF: {
    name: "Taxe Professionnelle (Patente)",
    periods: ["ANNUEL"],
    description: "Patente annuelle",
    icon: "🏪",
  },
};

// Declaration definitions without categories
const declarationDefinitions = {
  ETAT_9421: {
    name: "État 9421",
    pmOnly: true,
    mandatory: true,
    description: "Obligatoire pour PM",
    icon: "📊",
  },
  ETAT_9000: {
    name: "État 9000",
    ppOnly: true,
    mandatory: true,
    description: "Obligatoire pour PP",
    icon: "👤",
  },
  ETAT_SYNTHESE: {
    name: "État de Synthèse",
    mandatory: true,
    description: "État financier annuel",
    icon: "📈",
  },
  DECL_TP: {
    name: "Déclaration TP Optionnelle",
    optional: true,
    description: "Déclaration optionnelle",
    icon: "📝",
  },
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
  { num: 12, name: "Décembre", short: "Déc" },
];

// Quarters for quarterly periods - Different versions for different tax types
const QUARTERS_WITH_MONTHS = [
  { num: 1, name: "T1 (Janvier-Mars)", short: "T1" },
  { num: 2, name: "T2 (Avril-Juin)", short: "T2" },
  { num: 3, name: "T3 (Juillet-Septembre)", short: "T3" },
  { num: 4, name: "T4 (Octobre-Décembre)", short: "T4" },
];

// For range-based taxes (IS, IR_RAS_HONORAIRES, IS_RAS_HONORAIRES)
const QUARTERS_SIMPLE = [
  { num: 1, name: "T1", short: "T1" },
  { num: 2, name: "T2", short: "T2" },
  { num: 3, name: "T3", short: "T3" },
  { num: 4, name: "T4", short: "T4" },
];

// Function to determine if a tax code uses range-based quarters
const isRangeBasedTax = (taxCode) => {
  // Range-based taxes are those NOT in the predefined quarterly list
  return !["TVA", "TDB", "TS", "TPT"].includes(taxCode);
};

// Function to get the appropriate quarters array
const getQuartersForTax = (taxCode) => {
  return isRangeBasedTax(taxCode) ? QUARTERS_SIMPLE : QUARTERS_WITH_MONTHS;
};

export default function UpdateSpecificTaxType({
  isOpen,
  onClose,
  taxCode,
  isDeclaration = false,
  historiqueId,
}) {
  const {
    currentHistorique,
    updateHistorique,
    fetchHistoriqueById,
    deletePaiement,
    deleteDeclaration,
    loading,
  } = useHistoriqueFiscalStore();

  // State declarations
  const [periods, setPeriods] = useState([]);
  const [currentPeriodType, setCurrentPeriodType] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [initialPeriods, setInitialPeriods] = useState([]);
  const [errors, setErrors] = useState({});
  // Track periods marked for deletion (delete on save)
  const [periodsToDelete, setPeriodsToDelete] = useState(new Set());
  // Track open popovers for date pickers
  const [openPopovers, setOpenPopovers] = useState({});

  // Get tax definition
  const taxDefinition = isDeclaration
    ? declarationDefinitions[taxCode]
    : versementDefinitions[taxCode];

  // Load existing periods when modal opens
  useEffect(() => {
    if (isOpen && currentHistorique && taxCode) {
      loadExistingPeriods();
      setPeriodsToDelete(new Set()); // Reset delete tracking
      setOpenPopovers({}); // Reset popover states
    }
  }, [isOpen, currentHistorique, taxCode]);

  // Check for changes
  useEffect(() => {
    if (initialPeriods.length >= 0) {
      const hasDataChanges =
        JSON.stringify(periods) !== JSON.stringify(initialPeriods);
      const hasDeletions = periodsToDelete.size > 0;
      setHasChanges(hasDataChanges || hasDeletions);
    }
  }, [periods, initialPeriods, periodsToDelete]);

  // Helper function to check period type compatibility
  const isPeriodTypeCompatible = (selectedPeriodType) => {
    if (isDeclaration) return selectedPeriodType === "ANNUEL"; // Declarations are always annual
    if (!taxDefinition?.periods) return false;
    return taxDefinition.periods.includes(selectedPeriodType);
  };

  const loadExistingPeriods = () => {
    let existingPeriods = [];
    let detectedPeriodType = "";

    if (isDeclaration) {
      // Load existing declarations
      const relatedDeclarations =
        currentHistorique.declarations?.filter(
          (d) =>
            d.type_declaration === taxDefinition?.name ||
            taxCode === d.type_declaration
        ) || [];

      existingPeriods = relatedDeclarations.map((d) => ({
        id: d.id,
        type: "declaration",
        periode: "ANNUEL",
        periode_numero: null,
        annee: d.annee_declaration || currentHistorique.annee_fiscal,
        statut: d.statut_declaration || d.statut || "NON_DEPOSEE",
        dateDeposit: formatDateForInput(d.dateDeclaration), // Format date properly for HTML input
        commentaire: d.commentaire || "",
      }));
      detectedPeriodType = "ANNUEL";
    } else {
      // Load existing payments
      const relatedPayments =
        currentHistorique.paiements?.filter(
          (p) =>
            p.type_impot === taxDefinition?.name || taxCode === p.type_impot
        ) || [];

      existingPeriods = relatedPayments.map((p) => ({
        id: p.id,
        type: "paiement",
        periode: p.periode || "ANNUEL",
        periode_numero: p.periode_numero,
        annee: currentHistorique.annee_fiscal,
        montant: p.montant_paye || 0,
        statut: p.statut_paiement || p.statut || "NON_PAYE",
        date_start: formatDateForInput(p.date_start),
        date_end: formatDateForInput(p.date_end),
        dateDeposit: formatDateForInput(p.date_paiement), // Format date properly for HTML input
        commentaire: p.commentaire || "",
      }));

      // Detect the current period type from existing data
      if (existingPeriods.length > 0) {
        detectedPeriodType = existingPeriods[0].periode;
      }
    }

    setPeriods(existingPeriods);
    setInitialPeriods(JSON.parse(JSON.stringify(existingPeriods)));

    // Enhanced period type detection and selection
    if (detectedPeriodType) {
      // If we have existing data, use the detected period type
      setCurrentPeriodType(detectedPeriodType);
    } else if (isDeclaration) {
      // Declarations are always annual
      setCurrentPeriodType("ANNUEL");
    } else if (taxDefinition?.periods?.length > 0) {
      // If no existing periods, set based on available options
      if (taxDefinition.periods.length === 1) {
        // Only one period available, use it
        setCurrentPeriodType(taxDefinition.periods[0]);
      } else {
        // Multiple periods available, don't auto-select to force user choice
        setCurrentPeriodType("");
      }
    } else {
      // No periods defined, fallback
      setCurrentPeriodType("");
    }
  };

  const handlePeriodChange = (index, field, value) => {
    setPeriods((prev) => {
      const newPeriods = [...prev];
      newPeriods[index] = { ...newPeriods[index], [field]: value };
      return newPeriods;
    });

    // Clear error for this field
    if (errors[`${index}_${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`${index}_${field}`]: "",
      }));
    }
  };

  // Handle date selection for datepickers
  const handleDateSelect = (index, field, date) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      handlePeriodChange(index, field, formattedDate);
    }
    // Close the popover
    setOpenPopovers((prev) => ({
      ...prev,
      [`${index}_${field}`]: false,
    }));
  };

  // Handle popover open/close
  const handlePopoverOpenChange = (index, field, isOpen) => {
    setOpenPopovers((prev) => ({
      ...prev,
      [`${index}_${field}`]: isOpen,
    }));
  };

  const getMissingPeriodsInfo = () => {
    if (!currentPeriodType)
      return {
        count: 0,
        description: "Aucune configuration",
        canAdd: false,
        nextPeriod: null,
      };

    // Filter out periods marked for deletion for counting missing periods
    const activePeriods = periods.filter(
      (_, index) => !periodsToDelete.has(index)
    );

    if (currentPeriodType === "MENSUEL") {
      const existingMonths = activePeriods
        .filter((p) => p.periode === "MENSUEL")
        .map((p) => p.periode_numero)
        .filter(Boolean);
      const missingMonths = MONTHS.filter(
        (month) => !existingMonths.includes(month.num)
      );
      const nextMissingMonth = missingMonths[0]; // Get only the first missing month
      return {
        count: missingMonths.length,
        description:
          missingMonths.length > 0
            ? `Prochain: ${nextMissingMonth.name}`
            : "Tous les 12 mois sont présents",
        canAdd: missingMonths.length > 0,
        nextPeriod: nextMissingMonth,
      };
    } else if (currentPeriodType === "TRIMESTRIEL") {
      const existingQuarters = activePeriods
        .filter((p) => p.periode === "TRIMESTRIEL")
        .map((p) => p.periode_numero)
        .filter(Boolean);

      // Use the appropriate quarters based on tax type
      const availableQuarters = getQuartersForTax(taxCode);
      const missingQuarters = availableQuarters.filter(
        (quarter) => !existingQuarters.includes(quarter.num)
      );
      const nextMissingQuarter = missingQuarters[0]; // Get only the first missing quarter

      return {
        count: missingQuarters.length,
        description:
          missingQuarters.length > 0
            ? `Prochain: ${nextMissingQuarter.short}`
            : "Tous les 4 trimestres sont présents",
        canAdd: missingQuarters.length > 0,
        nextPeriod: nextMissingQuarter,
      };
    } else if (currentPeriodType === "ANNUEL") {
      const hasAnnualPeriod = activePeriods.some((p) => p.periode === "ANNUEL");
      return {
        count: hasAnnualPeriod ? 0 : 1,
        description: hasAnnualPeriod
          ? "Période annuelle déjà présente"
          : "Ajouter période annuelle",
        canAdd: !hasAnnualPeriod,
        nextPeriod: hasAnnualPeriod ? null : { name: "Annuel", num: 1 },
      };
    }

    return {
      count: 0,
      description: "Configuration inconnue",
      canAdd: false,
      nextPeriod: null,
    };
  };

  const addNewPeriod = () => {
    // Vérifier que nous avons un type de période sélectionné
    if (!currentPeriodType) {
      console.warn("Aucun type de période sélectionné");
      return;
    }

    // Vérifier que le type sélectionné est compatible avec la définition du versement
    if (!isPeriodTypeCompatible(currentPeriodType)) {
      console.warn(
        `Le type de période ${currentPeriodType} n'est pas compatible avec ${taxCode}`
      );
      return;
    }

    const newPeriod = {
      id: null, // Will be created on server
      type: isDeclaration ? "declaration" : "paiement",
      periode: currentPeriodType, // Utilise le type sélectionné
      periode_numero: null,
      annee: parseInt(currentHistorique.annee_fiscal),
      montant: isDeclaration ? undefined : 0, // No montant for declarations
      statut: isDeclaration ? "NON_DEPOSEE" : "NON_PAYE",
      date_start: "",
      date_end: "",
      dateDeposit: "",
      commentaire: "",
    };

    const missingInfo = getMissingPeriodsInfo();

    if (!missingInfo.canAdd || !missingInfo.nextPeriod) return;

    // Add only the next missing period (one at a time)
    if (currentPeriodType === "MENSUEL") {
      const nextMonth = missingInfo.nextPeriod;
      const monthlyPeriod = {
        ...newPeriod,
        periode_numero: nextMonth.num,
        id: `new_${Date.now()}_${nextMonth.num}`,
      };
      setPeriods((prev) => [...prev, monthlyPeriod]);
    } else if (currentPeriodType === "TRIMESTRIEL") {
      const nextQuarter = missingInfo.nextPeriod;
      const quarterlyPeriod = {
        ...newPeriod,
        periode_numero: nextQuarter.num, // This ensures T1=1, T2=2, T3=3, T4=4
        id: `new_${Date.now()}_${nextQuarter.num}`,
      };
      setPeriods((prev) => [...prev, quarterlyPeriod]);
    } else if (currentPeriodType === "ANNUEL") {
      // Annual - add single period only if none exists for this period type
      const activePeriods = periods.filter(
        (_, index) => !periodsToDelete.has(index)
      );
      const hasAnnualPeriod = activePeriods.some((p) => p.periode === "ANNUEL");
      if (!hasAnnualPeriod) {
        setPeriods((prev) => [
          ...prev,
          { ...newPeriod, id: `new_${Date.now()}` },
        ]);
      }
    }
  };

  // Mark period for deletion (don't delete immediately)
  const markPeriodForDeletion = (index) => {
    setPeriodsToDelete((prev) => new Set([...prev, index]));
  };

  // Unmark period for deletion
  const unmarkPeriodForDeletion = (index) => {
    setPeriodsToDelete((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  // Remove period completely (for new periods that don't exist in DB)
  const removePeriod = (index) => {
    setPeriods((prev) => prev.filter((_, i) => i !== index));
    // Also remove from deletion tracking if it was there
    setPeriodsToDelete((prev) => {
      const newSet = new Set();
      for (const idx of prev) {
        if (idx > index) {
          newSet.add(idx - 1);
        } else if (idx < index) {
          newSet.add(idx);
        }
        // Skip idx === index as we're removing that period
      }
      return newSet;
    });
  };

  const validatePeriods = () => {
    const newErrors = {};
    let isValid = true;

    periods.forEach((period, index) => {
      // Skip validation for periods marked for deletion
      if (periodsToDelete.has(index)) return;

      // Only validate montant for payments (not declarations)
      if (
        !isDeclaration &&
        period.montant &&
        isNaN(parseFloat(period.montant))
      ) {
        newErrors[`${index}_montant`] = "Le montant doit être un nombre";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validatePeriods()) {
      return;
    }

    try {
      // Step 1: Delete periods marked for deletion from database
      const deletionPromises = [];

      for (const index of periodsToDelete) {
        const periodToDelete = periods[index];

        // Only delete if the period has a valid database ID
        if (
          periodToDelete.id &&
          !periodToDelete.id.toString().startsWith("new_") &&
          !isNaN(periodToDelete.id)
        ) {
          if (periodToDelete.type === "declaration") {
            deletionPromises.push(deleteDeclaration(periodToDelete.id));
          } else {
            deletionPromises.push(deletePaiement(periodToDelete.id));
          }
        }
      }

      // Wait for all deletions to complete
      if (deletionPromises.length > 0) {
        await Promise.all(deletionPromises);
      }

      // Step 2: Filter out deleted periods from the periods array
      const remainingPeriods = periods.filter(
        (_, index) => !periodsToDelete.has(index)
      );

      // Step 3: Prepare the update data
      const currentPaiements = currentHistorique.paiements || [];
      const currentDeclarations = currentHistorique.declarations || [];

      if (isDeclaration) {
        // Update declarations
        const otherDeclarations = currentDeclarations.filter(
          (d) =>
            d.type_declaration !== taxDefinition?.name &&
            taxCode !== d.type_declaration
        );

        const updatedDeclarations = [
          ...otherDeclarations,
          ...remainingPeriods
            .filter((p) => p.type === "declaration")
            .map((p) => ({
              ...(p.id && !p.id.toString().startsWith("new_") && !isNaN(p.id)
                ? { id: parseInt(p.id) }
                : {}),
              type_declaration: taxDefinition?.name || taxCode,
              annee_declaration: p.annee,
              dateDeclaration: p.dateDeposit || null, // Map dateDeposit to dateDeclaration for API
              montant_declare: 0, // Always 0 for declarations now
              statut_declaration: p.statut,
              commentaire: p.commentaire || null,
            })),
        ];

        await updateHistorique(historiqueId, {
          annee_fiscal: currentHistorique.annee_fiscal,
          description: currentHistorique.description,
          statut_global: currentHistorique.statut_global,
          declarations: updatedDeclarations,
          paiements: currentPaiements,
        });
      } else {
        // Update payments
        const otherPaiements = currentPaiements.filter(
          (p) =>
            p.type_impot !== taxDefinition?.name && taxCode !== p.type_impot
        );

        const updatedPaiements = [
          ...otherPaiements,
          ...remainingPeriods
            .filter((p) => p.type === "paiement")
            .map((p) => ({
              ...(p.id && !p.id.toString().startsWith("new_") && !isNaN(p.id)
                ? { id: parseInt(p.id) }
                : {}),
              type_impot: taxDefinition?.name || taxCode,
              periode: p.periode,
              periode_numero: p.periode_numero,
              date_start: p.date_start || null,
              date_end: p.date_end || null,
              montant_du: null,
              montant_paye: parseFloat(p.montant) || 0,
              statut: p.statut,
              date_paiement: p.dateDeposit || null, // Map dateDeposit to date_paiement
              commentaire: p.commentaire || null,
            })),
        ];

        await updateHistorique(historiqueId, {
          annee_fiscal: currentHistorique.annee_fiscal,
          description: currentHistorique.description,
          statut_global: currentHistorique.statut_global,
          paiements: updatedPaiements,
          declarations: currentDeclarations,
        });
      }

      // Step 4: Reset state and refresh data
      setPeriodsToDelete(new Set());
      await fetchHistoriqueById(historiqueId);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const getStatusVariant = (status) => {
    // Handle null/undefined status
    if (!status) {
      return "secondary";
    }

    switch (status) {
      case "DEPOSEE":
      case "PAYE":
        return "default";
      case "NON_DEPOSEE":
      case "NON_PAYE":
        return "secondary";
      case "EN_RETARD":
        return "destructive";
      case "PARTIEL":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getPeriodDisplay = (period) => {
    if (period.periode === "MENSUEL" && period.periode_numero) {
      const month = MONTHS.find((m) => m.num === period.periode_numero);
      return month ? month.name : `Mois ${period.periode_numero}`;
    }
    if (period.periode === "TRIMESTRIEL" && period.periode_numero) {
      // Use the appropriate quarters display based on tax type
      const quarters = getQuartersForTax(taxCode);
      const quarter = quarters.find((q) => q.num === period.periode_numero);
      return quarter ? quarter.name : `T${period.periode_numero}`;
    }
    return period.periode || "Annuel";
  };

  const isPeriodMarkedForDeletion = (index) => {
    return periodsToDelete.has(index);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 -m-6 mb-0 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{taxDefinition?.icon || "📄"}</span>
            <div>
              <DialogTitle className="text-xl">
                Modifier {taxDefinition?.name || taxCode}
              </DialogTitle>
              <DialogDescription>
                {taxDefinition?.description || "Gestion des périodes"}
              </DialogDescription>
            </div>
            <div className="ml-auto flex gap-2">
              <Badge variant="outline">{periods.length} période(s)</Badge>
              {periodsToDelete.size > 0 && (
                <Badge variant="destructive">
                  {periodsToDelete.size} à supprimer
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-0">
          {/* Add New Period */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter des Périodes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {taxDefinition?.periods?.length > 0 || isDeclaration ? (
                <div className="space-y-3">
                  {/* Period Type Selector - Only show if multiple periods available AND no existing periods AND not a declaration */}
                  {!isDeclaration &&
                    taxDefinition?.periods?.length > 1 &&
                    periods.length === 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Type de période
                        </Label>
                        <Select
                          value={currentPeriodType}
                          onValueChange={(value) => {
                            setCurrentPeriodType(value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type de période" />
                          </SelectTrigger>
                          <SelectContent>
                            {taxDefinition.periods.map((period) => (
                              <SelectItem key={period} value={period}>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {period}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-gray-500">
                          Périodes disponibles :{" "}
                          {taxDefinition.periods.join(", ")}
                        </div>
                      </div>
                    )}

                  {currentPeriodType ? (
                    <>
                      <Alert>
                        <Info className="w-5 h-5" />
                        <AlertDescription>
                          <p className="font-medium mb-1">
                            Configuration:{" "}
                            <span className="font-bold">
                              {currentPeriodType}
                            </span>
                            {!isDeclaration &&
                              taxDefinition?.periods?.length > 1 &&
                              periods.length === 0 && (
                                <span className="text-xs text-gray-500 ml-2">
                                  (Modifiable ci-dessus)
                                </span>
                              )}
                          </p>
                          <p className="text-sm">
                            {(() => {
                              const missingInfo = getMissingPeriodsInfo();
                              return missingInfo.canAdd
                                ? `${missingInfo.description}`
                                : missingInfo.description;
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
                          return `Ajouter ${
                            missingInfo.nextPeriod?.name ||
                            missingInfo.nextPeriod?.short ||
                            "période suivante"
                          }`;
                        })()}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>
                        {isDeclaration
                          ? "Aucune configuration de période nécessaire"
                          : "Aucune configuration détectée"}
                      </p>
                      <p className="text-sm">
                        {isDeclaration
                          ? "Les déclarations sont automatiquement configurées en mode annuel"
                          : "Sélectionnez un type de période ci-dessus"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune période définie pour ce type</p>
                  <p className="text-sm">
                    {isDeclaration
                      ? "Les déclarations sont configurées automatiquement en mode annuel"
                      : "Contactez l'administrateur pour configurer les périodes"}
                  </p>
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
                  <p className="text-sm">
                    Ajoutez une nouvelle période ci-dessus
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {periods.map((period, index) => {
                    const isMarkedForDeletion =
                      isPeriodMarkedForDeletion(index);
                    const isNewPeriod =
                      !period.id || period.id.toString().startsWith("new_");

                    return (
                      <Card
                        key={period.id || index}
                        className={`transition-all duration-200 ${
                          isMarkedForDeletion
                            ? "bg-red-50 border-red-200 opacity-60"
                            : "bg-gray-50"
                        }`}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-medium ${
                                  isMarkedForDeletion
                                    ? "line-through text-red-500"
                                    : ""
                                }`}
                              >
                                {getPeriodDisplay(period)}
                              </span>
                              <Badge
                                variant={getStatusVariant(
                                  period.statut ||
                                    (isDeclaration ? "NON_DEPOSEE" : "NON_PAYE")
                                )}
                              >
                                {period.statut ||
                                  (isDeclaration ? "NON_DEPOSEE" : "NON_PAYE")}
                              </Badge>
                              {isMarkedForDeletion && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  À supprimer
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {isMarkedForDeletion ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => unmarkPeriodForDeletion(index)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <Undo className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (isNewPeriod) {
                                      removePeriod(index);
                                    } else {
                                      markPeriodForDeletion(index);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Only show form fields if not marked for deletion */}
                          {!isMarkedForDeletion && (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Only show montant for payments, not declarations */}
                                {!isDeclaration && (
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Montant (MAD)
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={period.montant || ""}
                                      onChange={(e) =>
                                        handlePeriodChange(
                                          index,
                                          "montant",
                                          e.target.value
                                        )
                                      }
                                      className={
                                        errors[`${index}_montant`]
                                          ? "border-red-500"
                                          : ""
                                      }
                                      placeholder="0.00"
                                    />
                                    {errors[`${index}_montant`] && (
                                      <p className="text-xs text-red-500">
                                        {errors[`${index}_montant`]}
                                      </p>
                                    )}
                                  </div>
                                )}

                                <div className="space-y-1">
                                  <Label className="text-xs">Statut</Label>
                                  <Select
                                    value={
                                      period.statut ||
                                      (isDeclaration
                                        ? "NON_DEPOSEE"
                                        : "NON_PAYE")
                                    }
                                    onValueChange={(value) =>
                                      handlePeriodChange(index, "statut", value)
                                    }
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
                                    Date de Dépôt
                                  </Label>
                                  <Popover
                                    open={
                                      openPopovers[`${index}_dateDeposit`] ||
                                      false
                                    }
                                    onOpenChange={(isOpen) =>
                                      handlePopoverOpenChange(
                                        index,
                                        "dateDeposit",
                                        isOpen
                                      )
                                    }
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant={"outline"}
                                        className={`w-full justify-start text-left font-normal ${
                                          !period.dateDeposit &&
                                          "text-muted-foreground"
                                        }`}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {period.dateDeposit ? (
                                          format(
                                            new Date(period.dateDeposit),
                                            "PPP",
                                            { locale: fr }
                                          )
                                        ) : (
                                          <span>Sélectionner une date</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <CalendarComponent
                                        mode="single"
                                        locale={fr}
                                        selected={
                                          period.dateDeposit
                                            ? new Date(period.dateDeposit)
                                            : undefined
                                        }
                                        onSelect={(date) =>
                                          handleDateSelect(
                                            index,
                                            "dateDeposit",
                                            date
                                          )
                                        }
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                {!isDeclaration && (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-xs">
                                        Date Début
                                      </Label>
                                      <Popover
                                        open={
                                          openPopovers[`${index}_date_start`] ||
                                          false
                                        }
                                        onOpenChange={(isOpen) =>
                                          handlePopoverOpenChange(
                                            index,
                                            "date_start",
                                            isOpen
                                          )
                                        }
                                      >
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant={"outline"}
                                            className={`w-full justify-start text-left font-normal ${
                                              !period.date_start &&
                                              "text-muted-foreground"
                                            }`}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {period.date_start ? (
                                              format(
                                                new Date(period.date_start),
                                                "PPP",
                                                { locale: fr }
                                              )
                                            ) : (
                                              <span>Sélectionner une date</span>
                                            )}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                          <CalendarComponent
                                            locale={fr}
                                            mode="single"
                                            selected={
                                              period.date_start
                                                ? new Date(period.date_start)
                                                : undefined
                                            }
                                            onSelect={(date) =>
                                              handleDateSelect(
                                                index,
                                                "date_start",
                                                date
                                              )
                                            }
                                            initialFocus
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>

                                    <div className="space-y-1">
                                      <Label className="text-xs">
                                        Date Fin
                                      </Label>
                                      <Popover
                                        open={
                                          openPopovers[`${index}_date_end`] ||
                                          false
                                        }
                                        onOpenChange={(isOpen) =>
                                          handlePopoverOpenChange(
                                            index,
                                            "date_end",
                                            isOpen
                                          )
                                        }
                                      >
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant={"outline"}
                                            className={`w-full justify-start text-left font-normal ${
                                              !period.date_end &&
                                              "text-muted-foreground"
                                            }`}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {period.date_end ? (
                                              format(
                                                new Date(period.date_end),
                                                "PPP",
                                                { locale: fr }
                                              )
                                            ) : (
                                              <span>Sélectionner une date</span>
                                            )}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                          <CalendarComponent
                                            locale={fr}
                                            mode="single"
                                            selected={
                                              period.date_end
                                                ? new Date(period.date_end)
                                                : undefined
                                            }
                                            onSelect={(date) =>
                                              handleDateSelect(
                                                index,
                                                "date_end",
                                                date
                                              )
                                            }
                                            initialFocus
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </>
                                )}

                                {isDeclaration && (
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Commentaire
                                    </Label>
                                    <Textarea
                                      value={period.commentaire || ""}
                                      onChange={(e) =>
                                        handlePeriodChange(
                                          index,
                                          "commentaire",
                                          e.target.value
                                        )
                                      }
                                      rows={2}
                                      placeholder="Commentaire sur cette déclaration..."
                                      className="mt-1"
                                    />
                                  </div>
                                )}
                              </div>

                              {!isDeclaration && (
                                <div className="mt-3">
                                  <Label className="text-xs">Commentaire</Label>
                                  <Textarea
                                    value={period.commentaire || ""}
                                    onChange={(e) =>
                                      handlePeriodChange(
                                        index,
                                        "commentaire",
                                        e.target.value
                                      )
                                    }
                                    rows={2}
                                    placeholder="Commentaire sur cette période..."
                                    className="mt-1"
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 -m-6 mt-0 flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || loading}>
            {loading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les modifications
                {periodsToDelete.size > 0 &&
                  ` (${periodsToDelete.size} suppression(s))`}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
