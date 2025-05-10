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
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function AjouterHistorique() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { clients, fetchClients } = useClientStore();
  const { createHistorique, fetchHistoriques } = useHistoriqueJuridiqueStore();
  const [clientSelected, setClientSelected] = useState(null);

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
    id_client: "",
  });

  useEffect(() => {
    if (dialogOpen && clients.length === 0) {
      fetchClients();
    }
  }, [dialogOpen, clients.length, fetchClients]);

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

    if (!historyForm.objet.trim()) {
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

  const handleSubmitHistory = async() => {
    if (validateForm()) {
      // Format data for submission
      const formattedData = {
        ...historyForm,
        montant: historyForm.montant ? parseFloat(historyForm.montant) : null,
      };

      console.log("Données à soumettre:", formattedData);

      createHistorique(formattedData);
      await fetchHistoriques();
      setHistoryForm({
        date_modification: "",
        description: "",
        objet: "",
        montant: "",
        id_client: "",
      });

      setDialogOpen(false);
    } else {
      console.log("Le formulaire contient des erreurs");
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Ajouter Historique
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un Historique Juridique</DialogTitle>

          <DialogDescription>
            Enregistrez une nouvelle entrée dans l'historique juridique du
            dossier client
            {": "}
            <span className="font-bold underline">
              {clientSelected?.raisonSociale
                ? `${clientSelected.raisonSociale}`
                : `${clientSelected?.nom_client || ""} ${
                    clientSelected?.prenom_client || ""
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
              <Select
                value={historyForm.id_client}
                onValueChange={(value) => {
                  handleHistoryFormChange("id_client", value);
                  setClientSelected(
                    clients.find((client) => client.id_client == value)
                  );
                }}
              >
                <SelectTrigger
                  className={errors.id_client ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Sélectionnez un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem
                      key={client.id_client}
                      value={String(client.id_client)}
                    >
                      {client.nom_client && client.prenom_client
                        ? `${client.prenom_client} ${client.nom_client}`
                        : client.raisonSociale}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.id_client && (
                <p className="text-red-500 text-sm mt-1">{errors.id_client}</p>
              )}
            </div>
          </div>
          {/* Objet Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="history-objet" className="text-right">
              Objet
            </Label>
            <div className="col-span-3">
              <Input
                id="history-objet"
                type="text"
                value={historyForm.objet}
                onChange={(e) =>
                  handleHistoryFormChange("objet", e.target.value)
                }
                className={errors.objet ? "border-red-500" : ""}
                placeholder="Objet de l'historique..."
              />
              {errors.objet && (
                <p className="text-red-500 text-sm mt-1">{errors.objet}</p>
              )}
            </div>
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
          {/* Date Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="history-date" className="text-right">
              Date
            </Label>
            <div className="col-span-2 ">
              <Input
                id="history-date"
                type="date"
                value={historyForm.date_modification}
                onChange={(e) =>
                  handleHistoryFormChange("date_modification", e.target.value)
                }
                className={errors.date_modification ? "border-red-500 " : ""}
              />
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
            onClick={() => setDialogOpen(false)}
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
