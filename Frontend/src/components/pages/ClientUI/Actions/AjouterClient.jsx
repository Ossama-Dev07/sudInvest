import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";

const AjouterClient = () => {
  const [date, setDate] = useState(new Date());
  const [collabDate, setCollabDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientType, setClientType] = useState("pp");
  const { addclient } = useClientStore();
  const navigate = useNavigate();
  const formatDate = (date) => {
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
    email: "",
    adresse: "",
    idFiscal: "",
    raisonSociale: "",
    rc: "",
    ice: "",
    taxeProfessionnelle: "",
    activite: "",
    statut: "actif",
    type: clientType,
    dateCollboration: formatDate(collabDate),
    datecreation: formatDate(date),
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const fieldMap = {
      nom_client: "nom",
      prenom_client: "prenom",
      CIN_client: "cin",
      telephone: "telephone",
      email: "email",
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

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (clientType === "pp") {
      if (!formData.nom) newErrors.nom = "Le nom est requis";
      if (!formData.prenom) newErrors.prenom = "Le prénom est requis";
    }

    if (clientType === "pm") {
      if (!formData.raisonSociale)
        newErrors.raisonSociale = "La raison sociale est requise";
    }

    if (!formData.cin) newErrors.cin = "Le CIN est requis";
    if (!formData.ice) newErrors.ice = "L'ICE est requis";
    if (!formData.rc) newErrors.rc = "Le RC est requis";
    if (!formData.idFiscal) newErrors.idFiscal = "Le identifient fiscal est requis";
    if (!formData.telephone) {
      newErrors.telephone = "Le téléphone est requis";
    } else if (!/^\+?[0-9\s]{10,15}$/.test(formData.telephone)) {
      newErrors.telephone = "Format invalide (+2126XXXXXXXX)";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (validate()) {
      console.log("Form submitted:", formData);
      addclient(formData);

      // Reset form after showing success
      setTimeout(() => {
        setIsSubmitting(false);

        navigate("/clients");
      }, 1500);
    } else {
      console.log("Form has errors:", errors);
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
              className="hover:bg-white/20 "
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold">
                Ajout d'un Nouveau Client
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Veuillez remplir les informations suivantes pour enregistrer un
                nouveau client
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

                <div className="mb-6 space-y-3">
                  <Label className="font-medium">Type de Client</Label>
                  <RadioGroup
                    defaultValue="pp"
                    className="flex space-x-8"
                    value={clientType}
                    onValueChange={(value) => {
                      setClientType(value);
                      setFormData({
                        ...formData,
                        type: value,
                      });
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pp" id="pp" />
                      <Label htmlFor="pp" className="font-medium">
                        Personne physique
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pm" id="pm" />
                      <Label htmlFor="pm" className="font-medium">
                        Personne morale
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {clientType === "pp" && (
                    <>
                      <div>
                        <Label
                          htmlFor="nom_client"
                          className="block font-medium mb-2"
                        >
                          Nom <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="nom_client"
                          placeholder="Entrez le nom"
                          value={formData.nom}
                          onChange={handleInputChange}
                          className={errors.nom ? "border-red-500" : ""}
                        />
                        {errors.nom && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.nom}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="prenom_client"
                          className="block font-medium mb-2"
                        >
                          Prénom <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="prenom_client"
                          placeholder="Entrez le prénom"
                          value={formData.prenom}
                          onChange={handleInputChange}
                          className={errors.prenom ? "border-red-500" : ""}
                        />
                        {errors.prenom && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.prenom}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <Label
                      htmlFor="CIN_client"
                      className="block font-medium mb-2"
                    >
                      CIN <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="CIN_client"
                      placeholder="Entrez le CIN"
                      value={formData.cin}
                      onChange={handleInputChange}
                      className={errors.cin ? "border-red-500" : ""}
                    />
                    {errors.cin && (
                      <p className="text-red-500 text-sm mt-1">{errors.cin}</p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="telephone"
                      className="block font-medium mb-2"
                    >
                      Téléphone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="telephone"
                      placeholder="+2126XXXXXXXX"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className={errors.telephone ? "border-red-500" : ""}
                    />
                    {errors.telephone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.telephone}
                      </p>
                    )}
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
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="id_fiscal"
                      className="block font-medium mb-2"
                    >
                      ID Fiscal<span className="text-red-500"> *</span>
                    </Label>
                    <Input
                      id="id_fiscal"
                      placeholder="Entrez l'ID fiscal"
                      value={formData.idFiscal}
                      onChange={handleInputChange}
                      className={errors.idFiscal ? "border-red-500" : ""}

                    />
                    {errors.idFiscal && (
                      <p className="text-red-500 text-sm mt-1">{errors.idFiscal}</p>
                    )}
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
              {/* Additional Information Section */}
            </div>
            {/* Company Information Section */}
            <div className="grid grid-cols-1 gap-3">
              <Card className="p-6 w-full">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b dark:text-gray-300">
                  Informations Entreprise
                </h2>

                <div className="grid grid-cols-1 gap-6">
                  {clientType === "pm" && (
                    <div>
                      <Label
                        htmlFor="raisonSociale"
                        className="block font-medium mb-2"
                      >
                        Raison Sociale <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="raisonSociale"
                        placeholder="Entrez la raison sociale"
                        value={formData.raisonSociale}
                        onChange={handleInputChange}
                        className={errors.raisonSociale ? "border-red-500" : ""}
                      />
                      {errors.raisonSociale && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.raisonSociale}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="rc" className="block font-medium mb-2">
                      RC <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="rc"
                      placeholder="Entrez le RC"
                      value={formData.rc}
                      onChange={handleInputChange}
                      className={errors.rc ? "border-red-500" : ""}
                    />
                    {errors.rc && (
                      <p className="text-red-500 text-sm mt-1">{errors.rc}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="ice" className="block font-medium mb-2">
                      ICE <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ice"
                      placeholder="Entrez l'ICE"
                      value={formData.ice}
                      onChange={handleInputChange}
                      className={errors.ice ? "border-red-500" : ""}
                    />
                    {errors.ice && (
                      <p className="text-red-500 text-sm mt-1">{errors.ice}</p>
                    )}
                  </div>
                  <div>
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
                  <div>
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
                          onSelect={setDate}
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
                          onSelect={setCollabDate}
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
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-[#2563EB] hover:from-blue-700 hover:to-indigo-800"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Traitement...
                </div>
              ) : (
                "Ajouter Client"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterClient;
