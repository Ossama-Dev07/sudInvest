import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import useHistoriqueJuridiqueStore from "@/store/HistoriqueJuridiqueStore";
import useClientStore from "@/store/useClientStore";
import { PlusCircle, Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useParams } from "react-router-dom";

export default function AjouterHistorique() {
  const { id } = useParams();

  const [dialogOpen, setDialogOpen] = useState(false);

  const { createHistorique, fetchHistoriques } = useHistoriqueJuridiqueStore();
  const [date, setDate] = useState(null);
  const { currentClient } = useClientStore();

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
    id_client: id,
  });

  // Error state for validation
  const [errors, setErrors] = useState({
    date_modification: "",
    description: "",
    objet: "",
    montant: "",
    id_client: "",
  });

  // State for custom objet input
  const [isCustomObjet, setIsCustomObjet] = useState(false);
  const [customObjet, setCustomObjet] = useState("");

  // Update form when date changes from DatePicker
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

    if (!historyForm.id_client) {
      newErrors.id_client = "Le client est requis";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitHistory = async () => {
    if (validateForm()) {
      // Determine the final objet value
      const finalObjet = isCustomObjet ? customObjet : historyForm.objet;

      // Format data for submission
      const formattedData = {
        ...historyForm,
        objet: finalObjet,
        montant: historyForm.montant ? parseFloat(historyForm.montant) : null,
      };

      console.log("Données à soumettre:", formattedData);
      await createHistorique(formattedData);

      await fetchHistoriques();

      // Reset form and dialog
      setHistoryForm({
        date_modification: "",
        description: "",
        objet: "",
        montant: "",
        id_client: "",
      });
      setCustomObjet("");
      setIsCustomObjet(false);
      setDate(null);
      setDialogOpen(false);
    } else {
      console.log("Le formulaire contient des erreurs");
    }
  };

  // Reset form when dialog closes
  const handleDialogClose = (open) => {
    if (!open) {
      setHistoryForm({
        date_modification: "",
        description: "",
        objet: "",
        montant: "",
        id_client: "",
      });
      setCustomObjet("");
      setIsCustomObjet(false);
      setDate(null);
    }
    setDialogOpen(open);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un Historique Juridique</DialogTitle>
          <DialogDescription>
            Enregistrez une nouvelle entrée dans l'historique juridique du
            dossier client{" "}
            <span className="font-bold underline">
              {currentClient?.raisonSociale
                ? `${currentClient.raisonSociale}`
                : `${currentClient?.nom_client || ""} ${
                    currentClient?.prenom_client || ""
                  }`}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Client Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="client-select" className="text-right">
              Client
            </Label>
            <div className="col-span-3">
              <Input
                id="client-select"
                type="text"
                value={
                  currentClient?.nom_client && currentClient?.prenom_client
                    ? `${currentClient?.prenom_client} ${currentClient?.nom_client}`
                    : currentClient?.raisonSociale
                }
              />
              {errors.id_client && (
                <p className="text-red-500 text-sm mt-1">{errors.id_client}</p>
              )}
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
                  <SelectTrigger
                    className={errors.objet ? "border-red-500" : ""}
                  >
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
                        <Plus className="mr-2 h-4 w-4" /> Ajouter un nouvel
                        objet
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
                    <CalendarIcon className="mr-2 h-4 w-4 " />
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
            variant="outline"
            onClick={() => handleDialogClose(false)}
          >
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmitHistory}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
