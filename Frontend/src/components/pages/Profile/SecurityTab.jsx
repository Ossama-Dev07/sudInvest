import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '@/store/AuthStore';

export default function SecurityTab() {
  const { changePassword, loading } = useAuthStore();
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    current_password: false,
    new_password: false,
    new_password_confirmation: false
  });

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
        new_password_confirmation: false
      });
      setIsPasswordDialogOpen(false);
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Lock className="w-5 h-5" />
            Sécurité du compte
          </CardTitle>
          <CardDescription className="text-muted-foreground">Gérez la sécurité de votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Mot de passe</h4>
              <p className="text-sm text-muted-foreground">Dernière modification: Il y a quelques jours</p>
            </div>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-border text-foreground hover:bg-muted">Changer le mot de passe</Button>
              </DialogTrigger>
              <DialogContent className="bg-background border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Changer le mot de passe</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Entrez votre mot de passe actuel et votre nouveau mot de passe
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password" className="text-foreground">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={passwordVisibility.current_password ? "text" : "password"}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData(prev => ({
                          ...prev,
                          current_password: e.target.value
                        }))}
                        className="pr-10 bg-background text-foreground border-border"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('current_password')}
                      >
                        {passwordVisibility.current_password ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password" className="text-foreground">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={passwordVisibility.new_password ? "text" : "password"}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData(prev => ({
                          ...prev,
                          new_password: e.target.value
                        }))}
                        className="pr-10 bg-background text-foreground border-border"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('new_password')}
                      >
                        {passwordVisibility.new_password ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password" className="text-foreground">Confirmer le nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={passwordVisibility.new_password_confirmation ? "text" : "password"}
                        value={passwordData.new_password_confirmation}
                        onChange={(e) => setPasswordData(prev => ({
                          ...prev,
                          new_password_confirmation: e.target.value
                        }))}
                        className="pr-10 bg-background text-foreground border-border"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('new_password_confirmation')}
                      >
                        {passwordVisibility.new_password_confirmation ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)} className="border-border text-foreground hover:bg-muted">
                    Annuler
                  </Button>
                  <Button onClick={handleChangePassword} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
    </div>
  );
}