// Main Profile Component
// Profile.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Shield, Settings, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '@/store/AuthStore';

// Import our new components
import ProfileForm from './ProfileForm';
import SecurityTab from './SecurityTab';
import SettingsTab from './SettingsTab';
import ProfileSidebar from './ProfileSidebar';
import ProfileHeader from './ProfileHeader';

export default function Profile() {
  const { user, loading, getProfile } = useAuthStore();
  

  const [profileData, setProfileData] = useState({
    nom_utilisateur: '',
    prenom_utilisateur: '',
    email_utilisateur: '',
    CIN_utilisateur: '',
    Ntele_utilisateur: '',
    adresse_utilisateur: ''
  });

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

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-foreground">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader user={user} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted border-border">
                <TabsTrigger value="profile" className="flex items-center gap-2 text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
                  <User className="w-4 h-4" />
                  Profil
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2 text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
                  <Shield className="w-4 h-4" />
                  Sécurité
                </TabsTrigger>
                
                <TabsTrigger value="settings" className="flex items-center gap-2 text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
                  <Settings className="w-4 h-4" />
                  Paramètres
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileForm
                  user={user}
                  profileData={profileData}
                  hasUnsavedChanges={hasUnsavedChanges}
                  onInputChange={handleInputChange}
                  onResetChanges={resetChanges}
                  setHasUnsavedChanges={setHasUnsavedChanges}
                />
              </TabsContent>

              <TabsContent value="security">
                <SecurityTab />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsTab />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Profile Summary & Tasks */}
          <ProfileSidebar user={user} profileData={profileData} />
        </div>
      </div>
    </div>
  );
}