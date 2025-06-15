import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Save, Loader2, User, Mail, CreditCard, Phone, MapPin, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '@/store/AuthStore';

export default function ProfileForm({ 
  user, 
  profileData, 
  hasUnsavedChanges, 
  onInputChange, 
  onResetChanges, 
  setHasUnsavedChanges 
}) {
  const { updateProfile, loading } = useAuthStore();

  const handleSaveProfile = async () => {
    try {
      // Only send fields that have changed
      const changedFields = {};
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== (user[key] || '')) {
          changedFields[key] = profileData[key];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        toast.info('No changes to save');
        return;
      }

      await updateProfile(changedFields);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const completionPercentage = user?.completion_percentage || 0;

  return (
    <div className="space-y-6">
      {/* User Information Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="w-5 h-5" />
            Informations personnelles
          </CardTitle>
          <CardDescription className="text-muted-foreground">Vos informations personnelles et de contact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom" className="flex items-center gap-2 text-foreground">
                <User className="w-4 h-4" />
                Nom
              </Label>
              <Input
                id="nom"
                value={profileData.nom_utilisateur}
                onChange={(e) => onInputChange('nom_utilisateur', e.target.value)}
                placeholder="Entrez votre nom"
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prenom" className="flex items-center gap-2 text-foreground">
                <User className="w-4 h-4" />
                Prénom
              </Label>
              <Input
                id="prenom"
                value={profileData.prenom_utilisateur}
                onChange={(e) => onInputChange('prenom_utilisateur', e.target.value)}
                placeholder="Entrez votre prénom"
                className="bg-background text-foreground border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
              <Mail className="w-4 h-4" />
              Adresse e-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={profileData.email_utilisateur}
              disabled
              className="bg-muted text-muted-foreground border-border"
            />
            <p className="text-xs text-muted-foreground">
              L'adresse e-mail ne peut pas être modifiée. Contactez l'administrateur si nécessaire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cin" className="flex items-center gap-2 text-foreground">
                <CreditCard className="w-4 h-4" />
                CIN
              </Label>
              <Input
                id="cin"
                value={profileData.CIN_utilisateur}
                onChange={(e) => onInputChange('CIN_utilisateur', e.target.value)}
                placeholder="Numéro CIN"
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="flex items-center gap-2 text-foreground">
                <Phone className="w-4 h-4" />
                Téléphone
              </Label>
              <Input
                id="telephone"
                value={profileData.Ntele_utilisateur}
                onChange={(e) => onInputChange('Ntele_utilisateur', e.target.value)}
                placeholder="Numéro de téléphone"
                className="bg-background text-foreground border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse" className="flex items-center gap-2 text-foreground">
              <MapPin className="w-4 h-4" />
              Adresse
            </Label>
            <Input
              id="adresse"
              value={profileData.adresse_utilisateur}
              onChange={(e) => onInputChange('adresse_utilisateur', e.target.value)}
              placeholder="Votre adresse complète"
              className="bg-background text-foreground border-border"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4" />
                Date d'inscription
              </Label>
              <Input
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : ''}
                disabled
                className="bg-muted text-muted-foreground border-border"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4" />
                Dernière activité
              </Label>
              <Input
                value={user?.last_active ? new Date(user.last_active).toLocaleDateString('fr-FR') : 'Jamais'}
                disabled
                className="bg-muted text-muted-foreground border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Achèvement du profil</CardTitle>
          <CardDescription className="text-muted-foreground">
            Complétez votre profil pour une meilleure expérience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Progression</span>
              <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={handleSaveProfile} 
          disabled={!hasUnsavedChanges || loading}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Sauvegarder les modifications
        </Button>
        <Button 
          variant="outline" 
          onClick={onResetChanges}
          disabled={!hasUnsavedChanges}
          className="border-border text-foreground hover:bg-muted"
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}
