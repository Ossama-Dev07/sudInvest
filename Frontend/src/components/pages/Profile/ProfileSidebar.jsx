import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, AlertCircle, Settings } from 'lucide-react';

export default function ProfileSidebar({ user, profileData }) {
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

  const completionPercentage = user?.completion_percentage || 0;

  return (
    <div className="space-y-6">
      {/* Profile Summary Card */}
      <Card className="border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-foreground">Profil Personnel</CardTitle>
          <CardDescription className="text-muted-foreground">Informations du profil personnel de base</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src="/api/placeholder/150/150" />
              <AvatarFallback className="text-xl bg-muted text-foreground">
                {getInitials(profileData.nom_utilisateur, profileData.prenom_utilisateur)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center border-2 border-border">
              <Settings className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {profileData.nom_utilisateur} {profileData.prenom_utilisateur}
            </h3>
            <p className="text-sm text-muted-foreground">{profileData.email_utilisateur}</p>
            <Badge variant="outline" className="mt-2 border-border text-foreground">
              {user?.role_utilisateur}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Checklist */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Tâches importantes</CardTitle>
          <CardDescription className="text-muted-foreground">Complétez ces étapes pour optimiser votre profil</CardDescription>
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
                <span className={`text-sm ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warning Card */}
      {completionPercentage < 100 && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-900 dark:text-orange-100">Attention</h4>
                <p className="text-sm text-orange-700 dark:text-orange-200 mt-1">
                  Votre profil n'est pas complet. Complétez les informations manquantes pour une meilleure expérience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Info */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Informations du compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Statut:</span>
            <Badge variant={user?.statut_utilisateur === 'actif' ? 'default' : 'secondary'} className="bg-primary text-primary-foreground">
              {user?.statut_utilisateur}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rôle:</span>
            <span className="font-medium text-foreground">{user?.role_utilisateur}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Membre depuis:</span>
            <span className="font-medium text-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
