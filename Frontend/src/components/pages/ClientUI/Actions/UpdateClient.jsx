import React, { useState, useEffect } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useClientStore from "@/store/useClientStore";
import { useNavigate, useParams } from "react-router-dom";
import { fr } from "date-fns/locale";

const UpdateClient = () => {
  const { id } = useParams();
  const [date, setDate] = useState();
  const [collabDate, setCollabDate] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const { updateClient, getClientById } = useClientStore();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    cin: "",
    telephone: "",
    telephone2: "",
    email: "",
    email_2: "",
    adresse: "",
    idFiscal: "",
    raisonSociale: "",
    rc: "",
    ice: "",
    taxeProfessionnelle: "",
    id_utilisateur: "",
    activite: "",
    statut: "actif",
    type: "pp",
    dateCollboration: "",
    datecreation: "",
  });

  useEffect(() => {
    const fetchClient = async () => {
      const client = await getClientById(id);
      console.log("Client data:", client);
      if (client) {
        setCollabDate(client?.date_collaboration)
        const clientData = {
          nom: client.nom_client || "",
          prenom: client.prenom_client || "",
          cin: client.CIN_client || "",
          telephone: client.telephone || "",
          telephone2: client.telephone2 || "",
          email: client.email || "",
          email_2: client.email_2 || "",
          adresse: client.adresse || "",
          idFiscal: client.id_fiscal || "",
          raisonSociale: client.raisonSociale || "",
          id_utilisateur: client.id_utilisateur || "",
          rc: client.rc || "",
          ice: client.ice || "",
          taxeProfessionnelle: client.taxe_profes || "",
          activite: client.activite || "",
          statut: client.statut || "actif",
          type: client.type || "pp",
          dateCollboration: client.date_collaboration || "",
          datecreation: client.datecreation || "",
        };

        setFormData(clientData);
        setOriginalData(clientData);

        if (client.datecreation) {
          setDate(new Date(client.datecreation));
        }
        if (client.dateCollboration) {
          setCollabDate(new Date(client.dateCollboration));
        }
      }
    };

    fetchClient();
  }, [id, getClientById]);

  // Check if form data has changed when formData is updated
  useEffect(() => {
    if (originalData) {
      // Check for any differences between original and current data
      const hasChanged = Object.keys(formData).some(
        (key) => formData[key] !== originalData[key]
      );

      // Also check if dates have changed
      const originalCreationDate = originalData.datecreation
        ? formatDate(new Date(originalData.datecreation))
        : "";
      const currentCreationDate = date ? formatDate(date) : "";

      const originalCollabDate = originalData.dateCollboration
        ? formatDate(new Date(originalData.dateCollboration))
        : "";
      const currentCollabDate = collabDate ? formatDate(collabDate) : "";

      const datesChanged =
        originalCreationDate !== currentCreationDate ||
        originalCollabDate !== currentCollabDate;

      setFormChanged(hasChanged || datesChanged);
    }
  }, [formData, date, collabDate, originalData]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const fieldMap = {
      nom_client: "nom",
      prenom_client: "prenom",
      CIN_client: "cin",
      telephone: "telephone",
      telephone2: "telephone2",
      id_utilisateur: "id_utilisateur",
      email: "email",
      email_2: "email_2",
      adresse: "adresse",
      id_fiscal: "idFiscal",
      raisonSociale: "raisonSociale",
      rc: "rc",
      ice: "ice",
      taxe_profes: "taxeProfessionnelle",
      activite: "activite",
    };

    const field = fieldMap[id] || id;

    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleCollabDateChange = (newDate) => {
    setCollabDate(newDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedData = {
      ...formData,
      dateCollboration: formatDate(collabDate),
      datecreation: formatDate(date),
    };

    const result = await updateClient(id, updatedData);
    console.log("Updating client:", updatedData);

    if (result) {
      // Success
      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/clients");
      }, 20);
    } else {
      // Failed
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto w-full min-h-screen px-4">
      <div className="max-w-full mx-auto">
        <div className="p-6 bg-[#2563EB] rounded-t-lg text-white mb-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/clients")}
              className=""
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold">
                Modification du Client
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Modifiez les informations du client
              </CardDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="grid grid-cols-1 ">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b dark:text-gray-300">
                  Informations Personnelles
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="nom_client"
                      className="block font-medium mb-2"
                    >
                      Nom
                    </Label>
                    <Input
                      id="nom_client"
                      placeholder="Entrez le nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="prenom_client"
                      className="block font-medium mb-2"
                    >
                      Prénom
                    </Label>
                    <Input
                      id="prenom_client"
                      placeholder="Entrez le prénom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="telephone"
                      className="block font-medium mb-2"
                    >
                      Téléphone
                    </Label>
                    <Input
                      id="telephone"
                      placeholder="+2126XXXXXXXX"
                      value={formData.telephone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="telephone2"
                      className="block font-medium mb-2"
                    >
                      Téléphone 2
                    </Label>
                    <Input
                      id="telephone2"
                      placeholder="+2126XXXXXXXX"
                      value={formData.telephone2}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="CIN_client"
                      className="block font-medium mb-2"
                    >
                      CIN
                    </Label>
                    <Input
                      id="CIN_client"
                      placeholder="Entrez le CIN"
                      value={formData.cin}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email" className="block font-medium mb-2">
                      Email
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="exemple@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email_2" className="block font-medium mb-2">
                      email_2
                    </Label>
                    <Input
                      type="email"
                      id="email_2"
                      placeholder="exemple@email.com"
                      value={formData.email_2}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="adresse" className="block font-medium mb-2">
                      Adresse
                    </Label>
                    <Input
                      id="adresse"
                      placeholder="Entrez l'adresse complète"
                      value={formData.adresse}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </Card>
            </div>
            {/* Company Information Section */}
            <div className="grid grid-cols-1 gap-3">
              <Card className="p-6 w-full">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b dark:text-gray-300">
                  Informations Entreprise
                </h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="raisonSociale"
                      className="block font-medium mb-2"
                    >
                      Raison Sociale
                    </Label>
                    <Input
                      id="raisonSociale"
                      placeholder="Entrez la raison sociale"
                      value={formData.raisonSociale}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="id_fiscal"
                      className="block font-medium mb-2"
                    >
                      ID Fiscal
                    </Label>
                    <Input
                      id="id_fiscal"
                      placeholder="Entrez l'ID fiscal"
                      value={formData.idFiscal}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rc" className="block font-medium mb-2">
                      RC
                    </Label>
                    <Input
                      id="rc"
                      placeholder="Entrez le RC"
                      value={formData.rc}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ice" className="block font-medium mb-2">
                      ICE
                    </Label>
                    <Input
                      id="ice"
                      placeholder="Entrez l'ICE"
                      value={formData.ice}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="taxe_profes"
                      className="block font-medium mb-2"
                    >
                      Taxe Professionnelle
                    </Label>
                    <Input
                      id="taxe_profes"
                      placeholder="Entrez la taxe professionnelle"
                      value={formData.taxeProfessionnelle}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="activite"
                      className="block font-medium mb-2"
                    >
                      Activité
                    </Label>
                    <Input
                      id="activite"
                      placeholder="Entrez l'activité principale"
                      value={formData.activite}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-800 py-6 mb-6 pb-2 border-b dark:text-gray-300">
                  Informations Complémentaires
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="block font-medium mb-2">
                      Date de Création
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDate(date)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={handleDateChange}
                          locale={fr}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="block font-medium mb-2">
                      Date de Collaboration
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDate(collabDate)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={collabDate}
                          onSelect={handleCollabDateChange}
                          locale={fr}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 py-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate("/clients")}
            >
              Annuler
            </Button>
            <Button
              disabled={isSubmitting || !formChanged}
              className={`w-full sm:w-auto ${
                formChanged
                  ? "bg-[#2563EB] hover:from-blue-700 hover:to-indigo-800"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Traitement...
                </div>
              ) : (
                "Mettre à jour"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateClient;
