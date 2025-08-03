import React, { useEffect, useState } from 'react';
import useDashboardStore from '@/store/useDashboardStore';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Users, 
  Building2, 
  FileCheck,
  Calendar,
  RefreshCw,
  Plus,
  Eye,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Receipt,
  Loader2,
  Scale, // Icon for legal formalities
  UserCog
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardStats = () => {
  const navigate = useNavigate();
  const [isActionsDialogOpen, setIsActionsDialogOpen] = useState(false);

  const {
    clientsActifs,
    agoMois,
    declarationsTerminees,
    elementsEnRetard, // ✅ NEW: Add this from your store
    loadingClients,
    loadingAgo,
    loadingDeclarations,
    loadingElementsEnRetard, // ✅ NEW: Add loading state for overdue elements
    error,
    refreshDashboard,
    smartFetch,
    isLoading,
    clearError,
    fetchAllDashboardStats,
    fetchElementsEnRetard, // ✅ NEW: Add fetch method
    // Declaration methods
    getDeclarationsTotal,
    getDeclarationsYearlyTrend,
    getPreviousYearDeclarations,
    getDeclarationsLabel
  } = useDashboardStore();

  useEffect(() => {
    // Use smart fetch to avoid unnecessary API calls
    smartFetch();
    // Also fetch overdue elements for legal formalities
    fetchElementsEnRetard();
  }, [smartFetch, fetchElementsEnRetard]);

  // Helper function to get loading state for each stat
  const getStatLoadingState = (statType) => {
    switch(statType) {
      case 'clients': return loadingClients;
      case 'ago': return loadingAgo;
      case 'declarations': return loadingDeclarations;
      case 'juridique': return loadingElementsEnRetard; // ✅ NEW
      default: return false;
    }
  };

  // Helper function to get value with proper formatting
  const getStatValue = (stat, loading) => {
    if (loading) return '...';
    if (!stat) return '0';
    
    // Handle different value formats
    if (stat.value !== undefined) return stat.value.toString();
    if (stat.total_display !== undefined) return stat.total_display;
    if (stat.taux !== undefined) return stat.taux + '%';
    
    return '0';
  };

  // Handle quick action navigation
  const handleQuickAction = (path) => {
    navigate(path);
    setIsActionsDialogOpen(false);
  };

  // Get declarations data
  const declarationsTotal = getDeclarationsTotal();
  const declarationsTrend = getDeclarationsYearlyTrend();
  const declarationsLabel = getDeclarationsLabel();

  // ✅ NEW: Get legal formalities data from elementsEnRetard
  const formalitesJuridiques = elementsEnRetard?.historique_juridique || [];
  const juridiqueCount = formalitesJuridiques.length;
  const juridiqueStats = elementsEnRetard?.statistics || {};
  
  // Calculate average progression for legal formalities
  const avgProgression = juridiqueCount > 0 
    ? Math.round(formalitesJuridiques.reduce((sum, item) => sum + (item.progression || 0), 0) / juridiqueCount)
    : 0;

  // Determine trend based on completion rate
  const juridiqueTrend = avgProgression >= 50 ? 'up' : 'down';
  const juridiqueTrendText = `${avgProgression}% moy.`;

  // Build quick stats from store data
  const quickStats = [
    {
      title: 'Clients Actifs',
      value: getStatValue(clientsActifs, loadingClients),
      change: loadingClients ? '...' : clientsActifs?.formatted_change || '0%',
      trend: clientsActifs?.trend || 'up',
      icon: Users,
      color: 'blue',
      loading: loadingClients,
      statType: 'clients'
    },
    {
      title: agoMois?.label || 'AGO de l\'Année',
      value: getStatValue(agoMois, loadingAgo),
      change: loadingAgo ? '...' : agoMois?.formatted_change || '0%',
      trend: agoMois?.trend || 'up',
      icon: Building2,
      color: 'green',
      loading: loadingAgo,
      statType: 'ago'
    },
    {
      title: 'Déclarations Terminées',
      value: loadingDeclarations ? '...' : declarationsTotal.toString(),
      change: loadingDeclarations ? '...' : (declarationsTrend?.formatted || '0%'),
      trend: declarationsTrend?.trend || 'up',
      icon: FileCheck,
      color: 'purple',
      loading: loadingDeclarations,
      statType: 'declarations'
    },
    // ✅ REPLACED: "Année Précédente" with "Formalités juridiques en cours"
    {
      title: 'Formalités Juridiques',
      value: loadingElementsEnRetard ? '...' : juridiqueCount.toString(),
      change: loadingElementsEnRetard ? '...' : juridiqueTrendText,
      trend: juridiqueTrend,
      icon: Scale, // Legal scale icon
      color: 'orange',
      loading: loadingElementsEnRetard,
      statType: 'juridique',
      subtitle: 'en cours' // Additional context
    }
  ];

  // Error handling
  if (error && !isLoading()) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Erreur de chargement
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2">
            <Button onClick={fetchAllDashboardStats} variant="outline">
              Réessayer
            </Button>
            <Button onClick={clearError} variant="secondary">
              Effacer l'erreur
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité - SudInvest Consulting</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshDashboard}
            disabled={isLoading()}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading() ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          {/* Actions Rapides Dialog */}
          <Dialog open={isActionsDialogOpen} onOpenChange={setIsActionsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="default">
                <Plus className="w-4 h-4 mr-2" />
                Actions Rapides
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Actions Rapides
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  onClick={() => handleQuickAction('/clients/ajouter')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Ajouter Client
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start hover:bg-green-50 hover:text-green-700 transition-colors"
                  onClick={() => handleQuickAction('/Assemblee_Generale_ordinaire/ajouter')}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Nouvelle AGO
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  onClick={() => handleQuickAction('/historique_juridique/ajouter')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Dossier Juridique
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start hover:bg-orange-50 hover:text-orange-700 transition-colors"
                  onClick={() => handleQuickAction('/historique_fiscal/ajouter')}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Déclaration Fiscale
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start hover:bg-gray-50 hover:text-gray-700 transition-colors"
                  onClick={() => handleQuickAction('/utilisateurs/ajouter')}
                >
                  <UserCog className="w-4 h-4 mr-2" />
                  Nouvel Utilisateur
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                        {stat.subtitle && (
                          <span className="ml-1 text-xs text-muted-foreground/80">
                            {stat.subtitle}
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      {stat.loading && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center mt-1">
                      {!stat.loading && (
                        <>
                          {stat.trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm ml-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardStats;