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
import useClientStore from "@/store/useClientStore";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function AjouterHistorique() {
      const [dialogOpen, setDialogOpen] = useState(false);
      const { clients, fetchClients } = useClientStore();
      console.log("kkkk", clients);
      useEffect(() => {
        if (dialogOpen && clients.length === 0) {
          fetchClients();
        }
      }, [dialogOpen]);
      // Form state for the juridical history
      const [historyForm, setHistoryForm] = useState({
        date: "",
        type: "audience",
        description: "",
      });
    
      const handleHistoryFormChange = (field, value) => {
        setHistoryForm((prev) => ({ ...prev, [field]: value }));
      };
    
      const handleSubmitHistory = () => {
        // Handle the form submission logic here
        console.log("Submitted history:", historyForm);
        // Reset form
        setHistoryForm({
          date: "",
          type: "audience",
          description: "",
        });
        setDialogOpen(false);
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
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {/* Date Input */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="history-date" className="text-right">
            Date
          </Label>
          <Input
            id="history-date"
            type="date"
            value={historyForm.date}
            onChange={(e) =>
              handleHistoryFormChange("date", e.target.value)
            }
            className="col-span-3"
          />
        </div>

        {/* Type Select */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="history-type" className="text-right">
            Type
          </Label>
          <Select
            value={historyForm.type}
            onValueChange={(value) =>
              handleHistoryFormChange("type", value)
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="audience">Audience</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="procedure">Procédure</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="decision">Décision</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Client Select */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="client-select" className="text-right">
            Client
          </Label>
          <Select
            value={historyForm.client_id}
            onValueChange={(value) =>
              handleHistoryFormChange("client_id", value)
            }
          >
            <SelectTrigger className="col-span-3">
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
        </div>

        {/* Description Textarea */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="history-description" className="text-right">
            Description
          </Label>
          <Textarea
            id="history-description"
            value={historyForm.description}
            onChange={(e) =>
              handleHistoryFormChange("description", e.target.value)
            }
            placeholder="Détails de l'événement juridique..."
            className="col-span-3"
            rows={4}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" onClick={handleSubmitHistory}>
          Enregistrer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  )
}
