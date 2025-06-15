import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

export default function ProfileHeader({ user }) {
  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="text-foreground hover:bg-muted">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Profil Personnel</h1>
              <p className="text-sm text-muted-foreground">Gérer les paramètres et informations de votre compte électronique</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={user?.statut_utilisateur === 'actif' ? 'default' : 'secondary'} className="bg-primary text-primary-foreground">
              {user?.statut_utilisateur || 'Unknown'}
            </Badge>
            <Badge variant="outline" className="border-border text-foreground">
              {user?.role_utilisateur || 'User'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
