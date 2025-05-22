import React, { useEffect, useState } from "react";
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
  Check,
} from "lucide-react";

// Import shadcn components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
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
import { useNavigate } from "react-router-dom";
import useUtilisateurStore from "@/store/useUtilisateurStore";
import { toast } from "react-toastify";

const AjouterUtilisateur = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { addUtilisateur } = useUtilisateurStore();
  const error = useUtilisateurStore((state) => state.error);

  const [date, setDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear only the specific field's error
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = () => {
    const newErrors = {};

    // Validate required fields individually
    if (!formData.nom_utilisateur.trim()) {
      newErrors.nom_utilisateur = "Ce champ est requis";
    }

    if (!formData.prenom_utilisateur.trim()) {
      newErrors.prenom_utilisateur = "Ce champ est requis";
    }

    if (!formData.email_utilisateur.trim()) {
      newErrors.email_utilisateur = "Ce champ est requis";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Ce champ est requis";
    }

    if (!formData.role_utilisateur.trim()) {
      newErrors.role_utilisateur = "Ce champ est requis";
    }

    // These fields will have their errors cleared independently
    // but we still check for required validation
    if (!formData.CIN_utilisateur.trim()) {
      newErrors.CIN_utilisateur = "Ce champ est requis";
    }

    if (!date) {
      newErrors.dateIntri_utilisateur = "La date est requise";
    }

    // Email validation
    if (
      formData.email_utilisateur &&
      !/\S+@\S+\.\S+/.test(formData.email_utilisateur)
    ) {
      newErrors.email_utilisateur = "Format d'email invalide";
    }

    // Phone validation (simple check for now)
    if (
      formData.Ntele_utilisateur &&
      !/^\+?[0-9\s]{10,15}$/.test(formData.Ntele_utilisateur)
    ) {
      newErrors.Ntele_utilisateur = "Format de téléphone invalide";
    }

    // Password strength
    if (formData.password && formData.password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Show loading state
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const userData = {
        ...formData,
        dateIntri_utilisateur: formatDate(date),
      };
      addUtilisateur(userData);
      setShowSuccess(true);

      // Reset form after showing success
      setTimeout(() => {
        setFormData({
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
        setDate(null);
        setIsSubmitting(false);
        setShowSuccess(false);
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

  // Handle CIN field independently
  const handleCINChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      CIN_utilisateur: value,
    }));
    // Clear only CIN error
    setErrors((prev) => ({ ...prev, CIN_utilisateur: "" }));
  };

  // Handle phone number field independently
  const handlePhoneChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      Ntele_utilisateur: value,
    }));
    // Clear only phone number error
    setErrors((prev) => ({ ...prev, Ntele_utilisateur: "" }));
  };

  // Handle address field independently
  const handleAddressChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      adresse_utilisateur: value,
    }));
    // Clear only address error
    setErrors((prev) => ({ ...prev, adresse_utilisateur: "" }));
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4">
      <Card className="w-full  h-full overflow-hidden">
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
                Ajouter un Utilisateur
              </CardTitle>
              <CardDescription className="text-blue-100 mt-1">
                Remplissez le formulaire pour ajouter un nouvel utilisateur au
                système
              </CardDescription>
            </div>
          </div>
        </div>

        <CardContent className="p-6 pt-8 ">
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

              {/* CIN - with dedicated handler */}
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
                    onChange={handleCINChange}
                    className={cn(
                      "pl-10",
                      errors.CIN_utilisateur   ? "border-red-500" : ""
                    )}
                  />
                  {errors.CIN_utilisateur && (
                    <p className="text-red-500 text-xs">
                      {errors.CIN_utilisateur}
                    </p>
                  )}
                </div>
              </div>

              {/* Adresse - with dedicated handler */}
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
                    onChange={handleAddressChange}
                    className="pl-10"
                  />
                </div>
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
                  Mot de passe
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

              {/* Numéro de téléphone - with dedicated handler */}
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
                    onChange={handlePhoneChange}
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

        <CardFooter className="px-6 py-4  flex flex-wrap gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate("/utilisateurs")}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[#2563EB] hover:from-blue-700 hover:to-indigo-800"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Traitement...
              </div>
            ) : (
              "Ajouter l'utilisateur"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AjouterUtilisateur;
