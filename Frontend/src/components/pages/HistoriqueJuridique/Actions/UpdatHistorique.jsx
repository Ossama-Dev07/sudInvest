import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { X, Plus, Calendar as CalendarIcon } from "lucide-react";
import useHistoriqueJuridiqueStore from "@/store/HistoriqueJuridiqueStore";
import { useEffect, useState } from "react";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function UpdateHistorique({ data }) {
  const { updateHistorique, fetchHistoriques } = useHistoriqueJuridiqueStore();
  const [date, setDate] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormState, setInitialFormState] = useState(null);

  // Predefined Objet options
  const predefinedObjets = [
    "Consultation juridique",
    "Rédaction de contrat",
    "Procédure judiciaire",
    "Conseil stratégique",
  ];

  // Form state with the specified fields
  const [historyForm, setHistoryForm] = useState({
    date_modification: "",
    description: "",
    objet: "",
    montant: "",
    id_client: "",
  });

  // Error state for validation
  const [errors, setErrors] = useState({
    date_modification: "",
    description: "",
    objet: "",
    montant: "",
  });

  // State for custom objet input
  const [isCustomObjet, setIsCustomObjet] = useState(false);
  const [customObjet, setCustomObjet] = useState("");
  const [initialCustomObjet, setInitialCustomObjet] = useState("");

  // Load data into form when component mounts
  useEffect(() => {
    if (data) {
      // Format date for the input (YYYY-MM-DD)
      const formattedDate = data.date_modification
        ? data.date_modification.split("T")[0]
        : "";

      // If we have a valid date, parse it into a Date object for the datepicker
      if (formattedDate) {
        try {
          const parsedDate = parse(formattedDate, "yyyy-MM-dd", new Date());
          setDate(parsedDate);
        } catch (error) {
          console.error("Error parsing date:", error);
        }
      }

      // Check if the objet is one of the predefined options
      const isPredefinedObjet = predefinedObjets.includes(data.objet);
      
      const formState = {
        date_modification: formattedDate,
        description: data.description || "",
        objet: isPredefinedObjet ? data.objet : "",
        montant: data.montant?.toString() || "",
        id_client: data.id_client?.toString() || "",
      };

      setHistoryForm(formState);
      setInitialFormState(JSON.stringify(formState));

      // Set custom objet if not a predefined option
      if (!isPredefinedObjet && data.objet) {
        setIsCustomObjet(true);
        setCustomObjet(data.objet);
        setInitialCustomObjet(data.objet);
      }
      
      // Reset hasChanges when loading initial data
      setHasChanges(false);
    }
  }, [data]);

  // Check for changes to enable/disable the save button
  useEffect(() => {
    if (initialFormState) {
      const currentFormState = JSON.stringify({
        ...historyForm,
        objet: isCustomObjet ? customObjet : historyForm.objet,
      });
      
      // Compare initial state with current state
      const formChanged = currentFormState !== initialFormState;
      
      // Compare custom objet if applicable
      const customObjetChanged = isCustomObjet && 
        customObjet !== initialCustomObjet;
        
      setHasChanges(formChanged || customObjetChanged);
    }
  }, [historyForm, customObjet, isCustomObjet, initialFormState, initialCustomObjet]);

  // Update form when date changes
  useEffect(() => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      handleHistoryFormChange("date_modification", formattedDate);
    }
  }, [date]);

  const handleHistoryFormChange = (field, value) => {
    // Clear error when user edits a field
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setHistoryForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Check required fields
    if (!historyForm.date_modification) {
      newErrors.date_modification = "La date est requise";
      isValid = false;
    }

    // Check objet (either from predefined or custom)
    const currentObjet = isCustomObjet ? customObjet : historyForm.objet;
    if (!currentObjet || !currentObjet.trim()) {
      newErrors.objet = "L'objet est requis";
      isValid = false;
    }

    // Validate montant is a valid number if provided
    if (historyForm.montant && isNaN(parseFloat(historyForm.montant))) {
      newErrors.montant = "Le montant doit être un nombre";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitHistory = async () => {
    if (validateForm()) {
      const finalObjet = isCustomObjet ? customObjet : historyForm.objet;

      const formattedData = {
        id: data.id,
        ...historyForm,
        objet: finalObjet,
        montant: historyForm.montant ? parseFloat(historyForm.montant) : null,
      };

      console.log("Données à mettre à jour:", formattedData);

      updateHistorique(data?.id, formattedData);
      await fetchHistoriques();
      onClose();
    } else {
      console.log("Le formulaire contient des erreurs");
    }
  };

  // Format client name/company for display
  const clientDisplay = data?.raisonSociale
    ? data.raisonSociale
    : `${data?.prenom_client || ""} ${data?.nom_client || ""}`;

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Modifier un Historique Juridique</DialogTitle>
        <DialogDescription>
          Modifiez cette entrée dans l'historique juridique du dossier client
          {": "}
          <span className="font-bold underline">{clientDisplay}</span>
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {/* Client Display (read-only) */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Client</Label>
          <div className="col-span-3">
            <Input
              type="text"
              value={clientDisplay}
              disabled
              className="bg-gray-200 dark:bg-gray-700 "
            />
          </div>
        </div>

        {/* Objet Select with Custom Option */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="history-objet" className="text-right">
            Objet
          </Label>
          <div className="col-span-3 flex items-center space-x-2">
            {!isCustomObjet ? (
              <Select
                value={historyForm.objet}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setIsCustomObjet(true);
                    handleHistoryFormChange("objet", "");
                  } else {
                    handleHistoryFormChange("objet", value);
                  }
                }}
              >
                <SelectTrigger className={errors.objet ? "border-red-500" : ""}>
                  <SelectValue placeholder="Sélectionnez un objet" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedObjets.map((objet) => (
                    <SelectItem key={objet} value={objet}>
                      {objet}
                    </SelectItem>
                  ))}
                  <SelectItem
                    value="custom"
                    className="text-blue-600 font-semibold"
                  >
                    <div className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" /> Ajouter un nouvel objet
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center space-x-2 w-full">
                <Input
                  type="text"
                  value={customObjet}
                  onChange={(e) => setCustomObjet(e.target.value)}
                  className={errors.objet ? "border-red-500" : ""}
                  placeholder="Nouvel objet..."
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsCustomObjet(false);
                    setCustomObjet("");
                    handleHistoryFormChange("objet", "");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {errors.objet && (
            <div className="col-span-4 text-right">
              <p className="text-red-500 text-sm mt-1">{errors.objet}</p>
            </div>
          )}
        </div>

        {/* Montant Input */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="history-montant" className="text-right">
            Montant
          </Label>
          <div className="col-span-3">
            <Input
              id="history-montant"
              type="number"
              step="0.01"
              value={historyForm.montant}
              onChange={(e) =>
                handleHistoryFormChange("montant", e.target.value)
              }
              className={errors.montant ? "border-red-500" : ""}
              placeholder="0.00"
            />
            {errors.montant && (
              <p className="text-red-500 text-sm mt-1">{errors.montant}</p>
            )}
          </div>
        </div>

        {/* Date Picker replacing Date Input */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="history-date" className="text-right">
            Date
          </Label>
          <div className="col-span-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="history-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                    errors.date_modification && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date
                    ? format(date, "PPP", { locale: fr })
                    : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={fr}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date_modification && (
              <p className="text-red-500 text-sm mt-1">
                {errors.date_modification}
              </p>
            )}
          </div>
        </div>

        {/* Description Textarea */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="history-description" className="text-right">
            Description
          </Label>
          <div className="col-span-3">
            <Textarea
              id="history-description"
              value={historyForm.description}
              onChange={(e) =>
                handleHistoryFormChange("description", e.target.value)
              }
              placeholder="Détails de l'événement juridique..."
              rows={4}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button 
          type="button" 
          onClick={handleSubmitHistory} 
          disabled={!hasChanges}
        >
          Enregistrer
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}