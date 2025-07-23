import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  CreditCard,
  MapPin,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import useUtilisateurStore from "@/store/useUtilisateurStore";
import { useNavigate, useParams } from "react-router-dom";
import { fr } from "date-fns/locale";

export default function UpdateUtilisateur() {
  const { id } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [date, setDate] = useState(null);
  const [initialDate, setInitialDate] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const { updateUtilisateur, getUtilisateurById } = useUtilisateurStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom_utilisateur: "",
    prenom_utilisateur: "",
    password: "",
    CIN_utilisateur: "",
    Ntele_utilisateur: "",
    email_utilisateur: "",
    adresse_utilisateur: "",
    role_utilisateur: "",
    statut_utilisateur: "actif",
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (id) {
        const userData = await getUtilisateurById(id);
        if (userData) {
          const formattedData = {
            nom_utilisateur: userData.nom_utilisateur || "",
            prenom_utilisateur: userData.prenom_utilisateur || "",
            password: "",
            CIN_utilisateur: userData.CIN_utilisateur || "",
            Ntele_utilisateur: userData.Ntele_utilisateur || "",
            email_utilisateur: userData.email_utilisateur || "",
            adresse_utilisateur: userData.adresse_utilisateur || "",
            role_utilisateur: userData.role_utilisateur || "",
            statut_utilisateur: userData.statut_utilisateur || "actif",
          };
          
          setFormData(formattedData);
          setInitialFormData(formattedData);

          if (userData.dateIntri_utilisateur) {
            const dateObj = new Date(userData.dateIntri_utilisateur);
            setDate(dateObj);
            setInitialDate(dateObj);
          }
        }
      }
    };

    loadUserData();
  }, [id, getUtilisateurById]);

  useEffect(() => {
    if (initialFormData) {

      const hasFormDataChanged = Object.keys(formData).some(key => {
        if (key === 'password' && formData[key] === '') return false;
        return formData[key] !== initialFormData[key];
      });
      
     
      const hasDateChanged = initialDate && date ? 
        initialDate.getTime() !== date.getTime() : 
        initialDate !== date;
      
      setFormChanged(hasFormDataChanged || hasDateChanged);
    }
  }, [formData, date, initialFormData, initialDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = () => {

    if (!formChanged) {
      return;
    }
    
    const newErrors = {};

    Object.entries(formData).forEach(([key, value]) => {

      if (key === "password" && !value.trim()) return;

      if (!value.trim() && key !== "password" && key !== "statut_utilisateur") {
        newErrors[key] = "Ce champ est requis";
      }
    });

    if (!date) {
      newErrors.dateIntri_utilisateur = "La date est requise";
    }

   
    if (
      formData.email_utilisateur &&
      !/\S+@\S+\.\S+/.test(formData.email_utilisateur)
    ) {
      newErrors.email_utilisateur = "Format d'email invalide";
    }

    if (
      formData.Ntele_utilisateur &&
      !/^\+?[0-9\s]{10,15}$/.test(formData.Ntele_utilisateur)
    ) {
      newErrors.Ntele_utilisateur = "Format de téléphone invalide";
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const userData = {
        ...formData,
        dateIntri_utilisateur: formatDate(date),
      };

      if (!userData.password.trim()) {
        delete userData.password;
      }

      updateUtilisateur(id, userData);

  
      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/utilisateurs");
      }, 1500);
    }, 800);
  };

  const roles = [
    { value: "admin", label: "Administrator" },
    { value: "consultant", label: "Consultant" },
  ];

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4">
      <Card className="w-full h-full overflow-hidden">
        <div className="bg-[#2563EB] p-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/utilisateurs")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Modifier Utilisateur
              </CardTitle>
              <CardDescription className="text-blue-100 mt-1">
                Modifiez les informations de l'utilisateur
              </CardDescription>
            </div>
          </div>
        </div>

        <CardContent className="p-6 pt-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-700 border-b pb-2 dark:text-gray-300">
                Informations Personnelles
              </h3>

              {/* Nom */}
              <div className="space-y-2">
                <Label
                  htmlFor="nom_utilisateur"
                  className="text-sm font-medium"
                >
                  Nom
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="nom_utilisateur"
                    name="nom_utilisateur"
                    placeholder="Entrez le nom"
                    value={formData.nom_utilisateur}
                    onChange={handleChange}
                    className={cn(
                      "pl-10",
                      errors.nom_utilisateur ? "border-red-500" : ""
                    )}
                  />
                </div>
                {errors.nom_utilisateur && (
                  <p className="text-red-500 text-xs">
                    {errors.nom_utilisateur}
                  </p>
                )}
              </div>

              {/* Prénom */}
              <div className="space-y-2">
                <Label
                  htmlFor="prenom_utilisateur"
                  className="text-sm font-medium"
                >
                  Prénom
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="prenom_utilisateur"
                    name="prenom_utilisateur"
                    placeholder="Entrez le prénom"
                    value={formData.prenom_utilisateur}
                    onChange={handleChange}
                    className={cn(
                      "pl-10",
                      errors.prenom_utilisateur ? "border-red-500" : ""
                    )}
                  />
                </div>
                {errors.prenom_utilisateur && (
                  <p className="text-red-500 text-xs">
                    {errors.prenom_utilisateur}
                  </p>
                )}
              </div>

              {/* CIN */}
              <div className="space-y-2">
                <Label
                  htmlFor="CIN_utilisateur"
                  className="text-sm font-medium"
                >
                  CIN
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="CIN_utilisateur"
                    name="CIN_utilisateur"
                    placeholder="Carte d'Identité Nationale"
                    value={formData.CIN_utilisateur}
                    onChange={handleChange}
                    className={cn(
                      "pl-10",
                      errors.CIN_utilisateur ? "border-red-500" : ""
                    )}
                  />
                </div>
                {errors.CIN_utilisateur && (
                  <p className="text-red-500 text-xs">
                    {errors.CIN_utilisateur}
                  </p>
                )}
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <Label
                  htmlFor="adresse_utilisateur"
                  className="text-sm font-medium"
                >
                  Adresse
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="adresse_utilisateur"
                    name="adresse_utilisateur"
                    placeholder="Adresse complète"
                    value={formData.adresse_utilisateur}
                    onChange={handleChange}
                    className={cn(
                      "pl-10",
                      errors.adresse_utilisateur ? "border-red-500" : ""
                    )}
                  />
                </div>
                {errors.adresse_utilisateur && (
                  <p className="text-red-500 text-xs">
                    {errors.adresse_utilisateur}
                  </p>
                )}
              </div>

              {/* Date d'introduction */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Date d'introduction
                </Label>
                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-gray-500",
                        errors.dateIntri_utilisateur && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? formatDate(date) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      locale={fr}
                      onSelect={(newDate) => {
                        setDate(newDate);
                        setIsDatePickerOpen(false);
                        setErrors((prev) => ({
                          ...prev,
                          dateIntri_utilisateur: "",
                        }));
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.dateIntri_utilisateur && (
                  <p className="text-red-500 text-xs">
                    {errors.dateIntri_utilisateur}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-700 border-b pb-2 dark:text-gray-300">
                Informations du Compte
              </h3>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email_utilisateur"
                  className="text-sm font-medium"
                >
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="email_utilisateur"
                    name="email_utilisateur"
                    type="email"
                    placeholder="exemple@email.com"
                    value={formData.email_utilisateur}
                    onChange={handleChange}
                    className={cn(
                      "pl-10",
                      errors.email_utilisateur ? "border-red-500" : ""
                    )}
                  />
                </div>
                {errors.email_utilisateur && (
                  <p className="text-red-500 text-xs">
                    {errors.email_utilisateur}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe (laisser vide pour ne pas modifier)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={cn(
                      "pl-10 pr-10",
                      errors.password ? "border-red-500" : ""
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}
                <p className="text-xs text-gray-500">
                  Le mot de passe doit contenir au moins 8 caractères
                </p>
              </div>

              {/* Numéro de téléphone */}
              <div className="space-y-2">
                <Label
                  htmlFor="Ntele_utilisateur"
                  className="text-sm font-medium"
                >
                  Numéro de téléphone
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="Ntele_utilisateur"
                    name="Ntele_utilisateur"
                    placeholder="+212 xxx xxx xxx"
                    value={formData.Ntele_utilisateur}
                    onChange={handleChange}
                    className={cn(
                      "pl-10",
                      errors.Ntele_utilisateur ? "border-red-500" : ""
                    )}
                  />
                </div>
                {errors.Ntele_utilisateur && (
                  <p className="text-red-500 text-xs">
                    {errors.Ntele_utilisateur}
                  </p>
                )}
              </div>

              {/* Rôle */}
              <div className="space-y-2">
                <Label
                  htmlFor="role_utilisateur"
                  className="text-sm font-medium"
                >
                  Rôle
                </Label>
                <Select
                  value={formData.role_utilisateur}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      role_utilisateur: value,
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      role_utilisateur: "",
                    }));
                  }}
                >
                  <SelectTrigger
                    className={errors.role_utilisateur ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem
                        key={role.value}
                        value={role.value}
                        className="cursor-pointer"
                      >
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role_utilisateur && (
                  <p className="text-red-500 text-xs">
                    {errors.role_utilisateur}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 flex flex-wrap gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate("/utilisateurs")}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formChanged}
            className={cn(
              "w-full sm:w-auto",
              formChanged ? "bg-[#2563EB] hover:from-blue-700 hover:to-indigo-800" : "bg-gray-400 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Traitement...
              </div>
            ) : (
              "Mettre à jour l'utilisateur"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}