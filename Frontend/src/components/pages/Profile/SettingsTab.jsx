import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '@/store/AuthStore';

export default function SettingsTab() {
  const { deleteAccount, loading } = useAuthStore();
  
  const [deleteData, setDeleteData] = useState({
    password: '',
    confirmation: ''
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    delete_password: false
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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

  return (
    <div className="space-y-6">
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="w-5 h-5" />
            Zone de danger
          </CardTitle>
          <CardDescription className="text-muted-foreground">
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
            <AlertDialogContent className="bg-background border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Êtes-vous absolument sûr?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Cette action ne peut pas être annulée. Cela supprimera définitivement votre compte
                  et toutes vos données associées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="delete_password" className="text-foreground">Mot de passe</Label>
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
                      className="pr-10 bg-background text-foreground border-border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('delete_password')}
                    >
                      {passwordVisibility.delete_password ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delete_confirmation" className="text-foreground">
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
                    className="bg-background text-foreground border-border"
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border text-foreground hover:bg-muted">Annuler</AlertDialogCancel>
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
    </div>
  );
}
