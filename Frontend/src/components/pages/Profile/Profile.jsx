import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  User, 
  Mail, 
  Calendar,
  Save,
  Trash2,
  Info,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Settings,
  Phone,
  MapPin,
  CreditCard,
  Lock,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '@/store/AuthStore';

export default function Profile() {
  const { 
    user, 
    loading, 
    getProfile, 
    updateProfile, 
    changePassword, 
    deleteAccount 
  } = useAuthStore();

  const [profileData, setProfileData] = useState({
    nom_utilisateur: '',
    prenom_utilisateur: '',
    email_utilisateur: '',
    CIN_utilisateur: '',
    Ntele_utilisateur: '',
    adresse_utilisateur: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [deleteData, setDeleteData] = useState({
    password: '',
    confirmation: ''
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    current_password: false,
    new_password: false,
    new_password_confirmation: false,
    delete_password: false
  });

  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        nom_utilisateur: user.nom_utilisateur || '',
        prenom_utilisateur: user.prenom_utilisateur || '',
        email_utilisateur: user.email_utilisateur || '',
        CIN_utilisateur: user.CIN_utilisateur || '',
        Ntele_utilisateur: user.Ntele_utilisateur || '',
        adresse_utilisateur: user.adresse_utilisateur || ''
      });
      setCompletionPercentage(user.completion_percentage || 0);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      await getProfile();
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation
      });
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
      setPasswordVisibility({
        current_password: false,
        new_password: false,
        new_password_confirmation: false,
        delete_password: false
      });
      setIsPasswordDialogOpen(false);
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteData.confirmation !== 'DELETE_MY_ACCOUNT') {
      toast.error('Please type "DELETE_MY_ACCOUNT" to confirm');
      return;
    }

    try {
      await deleteAccount(deleteData);
      // Redirect will be handled by the auth store
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const resetChanges = () => {
    if (user) {
      setProfileData({
        nom_utilisateur: user.nom_utilisateur || '',
        prenom_utilisateur: user.prenom_utilisateur || '',
        email_utilisateur: user.email_utilisateur || '',
        CIN_utilisateur: user.CIN_utilisateur || '',
        Ntele_utilisateur: user.Ntele_utilisateur || '',
        adresse_utilisateur: user.adresse_utilisateur || ''
      });
      setHasUnsavedChanges(false);
    }
  };

  const getInitials = (nom, prenom) => {
    return `${nom?.charAt(0) || ''}${prenom?.charAt(0) || ''}`.toUpperCase();
  };

  const tasksList = [
    { 
      id: 1, 
      text: "Ajouter un nom d'utilisateur", 
      completed: !!(profileData.nom_utilisateur && profileData.prenom_utilisateur)
    },
    { 
      id: 2, 
      text: "Vérifier l'adresse e-mail", 
      completed: !!profileData.email_utilisateur 
    },
    { 
      id: 3, 
      text: "Ajouter un numéro de téléphone", 
      completed: !!profileData.Ntele_utilisateur 
    },
    { 
      id: 4, 
      text: "Compléter l'adresse", 
      completed: !!profileData.adresse_utilisateur 
    }
  ];

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profil Personnel</h1>
                <p className="text-sm text-gray-600">Gérer les paramètres et informations de votre compte électronique</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user?.statut_utilisateur === 'actif' ? 'default' : 'secondary'}>
                {user?.statut_utilisateur || 'Unknown'}
              </Badge>
              <Badge variant="outline">
                {user?.role_utilisateur || 'User'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profil
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Sécurité
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Paramètres
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                {/* User Information Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informations personnelles
                    </CardTitle>
                    <CardDescription>Vos informations personnelles et de contact</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nom" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nom
                        </Label>
                        <Input
                          id="nom"
                          value={profileData.nom_utilisateur}
                          onChange={(e) => handleInputChange('nom_utilisateur', e.target.value)}
                          placeholder="Entrez votre nom"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prenom" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Prénom
                        </Label>
                        <Input
                          id="prenom"
                          value={profileData.prenom_utilisateur}
                          onChange={(e) => handleInputChange('prenom_utilisateur', e.target.value)}
                          placeholder="Entrez votre prénom"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Adresse e-mail
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email_utilisateur}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">
                        L'adresse e-mail ne peut pas être modifiée. Contactez l'administrateur si nécessaire.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cin" className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          CIN
                        </Label>
                        <Input
                          id="cin"
                          value={profileData.CIN_utilisateur}
                          onChange={(e) => handleInputChange('CIN_utilisateur', e.target.value)}
                          placeholder="Numéro CIN"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telephone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Téléphone
                        </Label>
                        <Input
                          id="telephone"
                          value={profileData.Ntele_utilisateur}
                          onChange={(e) => handleInputChange('Ntele_utilisateur', e.target.value)}
                          placeholder="Numéro de téléphone"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adresse" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Adresse
                      </Label>
                      <Input
                        id="adresse"
                        value={profileData.adresse_utilisateur}
                        onChange={(e) => handleInputChange('adresse_utilisateur', e.target.value)}
                        placeholder="Votre adresse complète"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date d'inscription
                        </Label>
                        <Input
                          value={user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : ''}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Dernière activité
                        </Label>
                        <Input
                          value={user?.last_active ? new Date(user.last_active).toLocaleDateString('fr-FR') : 'Jamais'}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Completion Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Achèvement du profil</CardTitle>
                    <CardDescription>
                      Complétez votre profil pour une meilleure expérience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progression</span>
                        <span className="text-sm text-gray-600">{completionPercentage}%</span>
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
                    className="flex items-center gap-2"
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
                    onClick={resetChanges}
                    disabled={!hasUnsavedChanges}
                  >
                    Annuler
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Sécurité du compte
                    </CardTitle>
                    <CardDescription>Gérez la sécurité de votre compte</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Mot de passe</h4>
                        <p className="text-sm text-gray-600">Dernière modification: Il y a quelques jours</p>
                      </div>
                      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">Changer le mot de passe</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Changer le mot de passe</DialogTitle>
                            <DialogDescription>
                              Entrez votre mot de passe actuel et votre nouveau mot de passe
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="current_password">Mot de passe actuel</Label>
                              <div className="relative">
                                <Input
                                  id="current_password"
                                  type={passwordVisibility.current_password ? "text" : "password"}
                                  value={passwordData.current_password}
                                  onChange={(e) => setPasswordData(prev => ({
                                    ...prev,
                                    current_password: e.target.value
                                  }))}
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => togglePasswordVisibility('current_password')}
                                >
                                  {passwordVisibility.current_password ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new_password">Nouveau mot de passe</Label>
                              <div className="relative">
                                <Input
                                  id="new_password"
                                  type={passwordVisibility.new_password ? "text" : "password"}
                                  value={passwordData.new_password}
                                  onChange={(e) => setPasswordData(prev => ({
                                    ...prev,
                                    new_password: e.target.value
                                  }))}
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => togglePasswordVisibility('new_password')}
                                >
                                  {passwordVisibility.new_password ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm_password">Confirmer le nouveau mot de passe</Label>
                              <div className="relative">
                                <Input
                                  id="confirm_password"
                                  type={passwordVisibility.new_password_confirmation ? "text" : "password"}
                                  value={passwordData.new_password_confirmation}
                                  onChange={(e) => setPasswordData(prev => ({
                                    ...prev,
                                    new_password_confirmation: e.target.value
                                  }))}
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => togglePasswordVisibility('new_password_confirmation')}
                                >
                                  {passwordVisibility.new_password_confirmation ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                              Annuler
                            </Button>
                            <Button onClick={handleChangePassword} disabled={loading}>
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : null}
                              Changer le mot de passe
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Trash2 className="w-5 h-5" />
                      Zone de danger
                    </CardTitle>
                    <CardDescription>
                      Actions irréversibles pour votre compte
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full flex items-center gap-2">
                          <Trash2 className="w-4 h-4" />
                          Supprimer le compte
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous absolument sûr?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action ne peut pas être annulée. Cela supprimera définitivement votre compte
                            et toutes vos données associées.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="delete_password">Mot de passe</Label>
                            <div className="relative">
                              <Input
                                id="delete_password"
                                type={passwordVisibility.delete_password ? "text" : "password"}
                                value={deleteData.password}
                                onChange={(e) => setDeleteData(prev => ({
                                  ...prev,
                                  password: e.target.value
                                }))}
                                placeholder="Entrez votre mot de passe"
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => togglePasswordVisibility('delete_password')}
                              >
                                {passwordVisibility.delete_password ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="delete_confirmation">
                              Tapez "DELETE_MY_ACCOUNT" pour confirmer
                            </Label>
                            <Input
                              id="delete_confirmation"
                              value={deleteData.confirmation}
                              onChange={(e) => setDeleteData(prev => ({
                                ...prev,
                                confirmation: e.target.value
                              }))}
                              placeholder="DELETE_MY_ACCOUNT"
                            />
                          </div>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Supprimer le compte
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Profile Summary & Tasks */}
          <div className="space-y-6">
            
            {/* Profile Summary Card */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Profil Personnel</CardTitle>
                <CardDescription>Informations du profil personnel de base</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src="/api/placeholder/150/150" />
                    <AvatarFallback className="text-xl">
                      {getInitials(profileData.nom_utilisateur, profileData.prenom_utilisateur)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                    <Settings className="w-3 h-3 text-gray-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {profileData.nom_utilisateur} {profileData.prenom_utilisateur}
                  </h3>
                  <p className="text-sm text-gray-600">{profileData.email_utilisateur}</p>
                  <Badge variant="outline" className="mt-2">
                    {user?.role_utilisateur}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Tâches importantes</CardTitle>
                <CardDescription>Complétez ces étapes pour optimiser votre profil</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasksList.map((task) => (
                    <div key={task.id} className="flex items-center gap-3">
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${task.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Warning Card */}
            {completionPercentage < 100 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-orange-900">Attention</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Votre profil n'est pas complet. Complétez les informations manquantes pour une meilleure expérience.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations du compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut:</span>
                  <Badge variant={user?.statut_utilisateur === 'actif' ? 'default' : 'secondary'}>
                    {user?.statut_utilisateur}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rôle:</span>
                  <span className="font-medium">{user?.role_utilisateur}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Membre depuis:</span>
                  <span className="font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}