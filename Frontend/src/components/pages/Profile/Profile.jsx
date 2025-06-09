import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

export default function Profile() {
  const [profileData, setProfileData] = useState({
    nom: 'Jean Dupont',
    email: 'utilisateur@example.fr',
    dateNaissance: '1990-05-15',
    dateInscription: '10 février 2025'
  });

  const [completionPercentage] = useState(75);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const tasksList = [
    { id: 1, text: "Ajouter une photo de profil", completed: true },
    { id: 2, text: "Vérifier l'adresse e-mail", completed: true },
    { id: 3, text: "Compléter les informations personnelles", completed: false },
    { id: 4, text: "Ajouter une date de naissance", completed: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profil Personnel</h1>
                <p className="text-sm text-gray-600">Gérer les paramètres et informations de votre compte électronique</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Info className="w-4 h-4 mr-2" />
                Informations générales
              </Button>
              <Button variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Sécurité
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Apparence
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* User Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations de l'utilisateur
                </CardTitle>
                <CardDescription>Vos informations personnelles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nom
                  </Label>
                  <Input
                    id="nom"
                    value={profileData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder="Entrez votre nom ici"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Adresse e-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Il n'est pas possible de modifier l'adresse e-mail
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateNaissance" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date de naissance
                  </Label>
                  <Input
                    id="dateNaissance"
                    type="date"
                    value={profileData.dateNaissance}
                    onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date d'inscription
                  </Label>
                  <Input
                    value={profileData.dateInscription}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion Section */}
            <Card>
              <CardHeader>
                <CardTitle>Achèvement du profil personnel</CardTitle>
                <CardDescription>
                  Achever le profil personnel. Cela vous aide à obtenir plus de détails
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
              <Button className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Sauvegarder les modifications
              </Button>
              <Button variant="outline">
                Annuler
              </Button>
            </div>
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
                    <AvatarFallback className="text-xl">JD</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                    <Settings className="w-3 h-3 text-gray-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{profileData.nom}</h3>
                  <p className="text-sm text-gray-600">{profileData.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Tâches importantes</CardTitle>
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
                      <span className={`text-sm ${task.completed ? 'text-gray-600' : 'text-gray-900'}`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Warning Card */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-orange-900">Attention</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Certains éléments nécessitent votre attention pour compléter votre profil.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <Button variant="destructive" className="w-full flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Supprimer le compte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}