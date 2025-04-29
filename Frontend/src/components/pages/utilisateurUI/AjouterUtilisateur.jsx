import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

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
import useUtilisateurStore from "@/store/useUtilisateurStore";
import { useNavigate } from "react-router-dom";

export default function AjouterUtilisateur() {
  const [date, setDate] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const {addUtilisateur}=useUtilisateurStore();
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
    setErrors((prev) => ({ ...prev, [name]: "" })); 
  };

  const handleSubmit = () => {
    const newErrors = {};
 
    // Simple required field validation
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key] = "Ce champ est requis";
      }
    });

    if (!date) {
      newErrors.dateIntri_utilisateur = "La date est requise";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const userData = {
      ...formData,
      dateIntri_utilisateur: formatDate(date),
    };
    addUtilisateur(userData);
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
    navigate("/utilisateurs"); 
 
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
    <div className="flex items-center justify-center w-full py-7">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Ajouter Utilisateur
          </CardTitle>
          <CardDescription className="text-center">
            Remplissez le formulaire pour ajouter un nouvel utilisateur
          </CardDescription>
        </CardHeader>
        <div>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Nom */}
              <div className="space-y-2">
                <Label htmlFor="nom_utilisateur">Nom</Label>
                <Input
                  id="nom_utilisateur"
                  name="nom_utilisateur"
                  placeholder="Entrez le nom"
                  value={formData.nom_utilisateur}
                  onChange={handleChange}
                  className={errors.nom_utilisateur ? "border-red-500" : ""}
                />
                {errors.nom_utilisateur && (
                  <p className="text-red-500 text-sm">
                    {errors.nom_utilisateur}
                  </p>
                )}
              </div>

              {/* Prénom */}
              <div className="space-y-2">
                <Label htmlFor="prenom_utilisateur">Prénom</Label>
                <Input
                  id="prenom_utilisateur"
                  name="prenom_utilisateur"
                  placeholder="Entrez le prénom"
                  value={formData.prenom_utilisateur}
                  onChange={handleChange}
                  className={errors.prenom_utilisateur ? "border-red-500" : ""}
                />
                {errors.prenom_utilisateur && (
                  <p className="text-red-500 text-sm">
                    {errors.prenom_utilisateur}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email_utilisateur">Email</Label>
                <Input
                  id="email_utilisateur"
                  name="email_utilisateur"
                  type="email"
                  placeholder="exemple@email.com"
                  value={formData.email_utilisateur}
                  onChange={handleChange}
                  className={errors.email_utilisateur ? "border-red-500" : ""}
                />
                {errors.email_utilisateur && (
                  <p className="text-red-500 text-sm">
                    {errors.email_utilisateur}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              {/* CIN */}
              <div className="space-y-2">
                <Label htmlFor="CIN_utilisateur">CIN</Label>
                <Input
                  id="CIN_utilisateur"
                  name="CIN_utilisateur"
                  placeholder="Carte d'Identité Nationale"
                  value={formData.CIN_utilisateur}
                  onChange={handleChange}
                  className={errors.CIN_utilisateur ? "border-red-500" : ""}
                />
                {errors.CIN_utilisateur && (
                  <p className="text-red-500 text-sm">
                    {errors.CIN_utilisateur}
                  </p>
                )}
              </div>

              {/* Numéro de téléphone */}
              <div className="space-y-2">
                <Label htmlFor="Ntele_utilisateur">Numéro de téléphone</Label>
                <Input
                  id="Ntele_utilisateur"
                  name="Ntele_utilisateur"
                  placeholder="+212 xxx xxx xxx"
                  value={formData.Ntele_utilisateur}
                  onChange={handleChange}
                  className={errors.Ntele_utilisateur ? "border-red-500" : ""}
                />
                {errors.Ntele_utilisateur && (
                  <p className="text-red-500 text-sm">
                    {errors.Ntele_utilisateur}
                  </p>
                )}
              </div>

              {/* Date d'introduction */}
              <div className="space-y-2">
                <Label>Date d'introduction</Label>
                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        errors.dateIntri_utilisateur && "border-red-500"
                      )}
                    >
                      {date ? (
                        formatDate(date)
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                  <p className="text-red-500 text-sm">
                    {errors.dateIntri_utilisateur}
                  </p>
                )}
              </div>

              {/* Rôle */}
              <div className="space-y-2">
                <Label htmlFor="role_utilisateur">Rôle</Label>
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
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role_utilisateur && (
                  <p className="text-red-500 text-sm">
                    {errors.role_utilisateur}
                  </p>
                )}
              </div>
            </div>

            {/* Adresse - Full width */}
            <div className="space-y-2 col-span-full">
              <Label htmlFor="adresse_utilisateur">Adresse</Label>
              <Input
                id="adresse_utilisateur"
                name="adresse_utilisateur"
                placeholder="Adresse complète"
                value={formData.adresse_utilisateur}
                onChange={handleChange}
                className={errors.adresse_utilisateur ? "border-red-500" : ""}
              />
              {errors.adresse_utilisateur && (
                <p className="text-red-500 text-sm">
                  {errors.adresse_utilisateur}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" onClick={handleSubmit}>
              Ajouter l'utilisateur
            </Button>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}
