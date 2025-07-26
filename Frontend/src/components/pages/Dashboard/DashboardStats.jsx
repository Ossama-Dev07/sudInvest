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
  Users, 
  Building2, 
  DollarSign,
  Target,
  RefreshCw,
  Plus,
  Eye,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Receipt,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const DashboardStats = () => {
  const {
    clientsActifs,
    agoMois,
    revenus,
    tauxCompletion,
    loading,
    error,
    fetchDashboardStats,
    refreshDashboard,
    smartFetch
  } = useDashboardStore();

  // State to control visibility of completion details
  const [showCompletionDetails, setShowCompletionDetails] = useState(false);

  useEffect(() => {
    // Use smart fetch to avoid unnecessary API calls
    smartFetch();
  }, [smartFetch]);

  // Build quick stats from store data
  const quickStats = [
    {
      title: 'Clients Actifs',
      value: loading ? '...' : clientsActifs?.value?.toString() || '0',
      change: loading ? '...' : clientsActifs?.formatted_change || '0%',
      trend: clientsActifs?.trend || 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: agoMois?.label || 'AGO de l\'Année', // Updated title to reflect yearly data
      value: loading ? '...' : agoMois?.value?.toString() || '0',
      change: loading ? '...' : agoMois?.formatted_change || '0%',
      trend: agoMois?.trend || 'up',
      icon: Building2,
      color: 'green'
    },
    {
      title: 'Revenus (MAD)',
      value: loading ? '...' : revenus?.value || '0',
      change: loading ? '...' : revenus?.formatted_change || '0%',
      trend: revenus?.trend || 'up',
      icon: DollarSign,
      color: 'purple'
    },
    {
      title: 'Taux Complétion',
      value: loading ? '...' : tauxCompletion?.value || '0%',
      change: loading ? '...' : tauxCompletion?.formatted_change || '0%',
      trend: tauxCompletion?.trend || 'down',
      icon: Target,
      color: 'orange',
      hasDetails: !!tauxCompletion?.breakdown // Flag to show if details are available
    }
  ];

  // Error handling
  if (error && !loading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Erreur de chargement
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchDashboardStats} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité - SudInvest Consulting</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshDashboard}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Actions Rapides
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Rapports
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          const isTauxCompletion = stat.title === 'Taux Complétion';
          
          return (
            <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      {isTauxCompletion && stat.hasDetails && (
                        <button
                          onClick={() => setShowCompletionDetails(!showCompletionDetails)}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Voir les détails"
                        >
                          {showCompletionDetails ? (
                            <ChevronUp className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm ml-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
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

      {/* Task Completion Breakdown (Conditionally visible) */}
      {showCompletionDetails && tauxCompletion?.breakdown && (
        <Card className="animate-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Détail du Taux de Complétion</CardTitle>
                <CardDescription>Répartition par type de tâche</CardDescription>
              </div>
              <button
                onClick={() => setShowCompletionDetails(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Fermer les détails"
              >
                <ChevronUp className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Etapes AGO</h4>
                  <Building2 className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{tauxCompletion.breakdown.ago_etapes.terminees}/{tauxCompletion.breakdown.ago_etapes.total}</p>
                <p className="text-xs text-muted-foreground">
                  {tauxCompletion.breakdown.ago_etapes.total > 0 
                    ? Math.round((tauxCompletion.breakdown.ago_etapes.terminees / tauxCompletion.breakdown.ago_etapes.total) * 100)
                    : 0}% terminées
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Etapes Juridiques</h4>
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">{tauxCompletion.breakdown.juridique_etapes.terminees}/{tauxCompletion.breakdown.juridique_etapes.total}</p>
                <p className="text-xs text-muted-foreground">
                  {tauxCompletion.breakdown.juridique_etapes.total > 0 
                    ? Math.round((tauxCompletion.breakdown.juridique_etapes.terminees / tauxCompletion.breakdown.juridique_etapes.total) * 100)
                    : 0}% terminées
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Paiements Fiscaux</h4>
                  <DollarSign className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-2xl font-bold">{tauxCompletion.breakdown.fiscal_paiements.termines}/{tauxCompletion.breakdown.fiscal_paiements.total}</p>
                <p className="text-xs text-muted-foreground">
                  {tauxCompletion.breakdown.fiscal_paiements.total > 0 
                    ? Math.round((tauxCompletion.breakdown.fiscal_paiements.termines / tauxCompletion.breakdown.fiscal_paiements.total) * 100)
                    : 0}% payés
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Déclarations Fiscales</h4>
                  <Receipt className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{tauxCompletion.breakdown.fiscal_declarations.terminees}/{tauxCompletion.breakdown.fiscal_declarations.total}</p>
                <p className="text-xs text-muted-foreground">
                  {tauxCompletion.breakdown.fiscal_declarations.total > 0 
                    ? Math.round((tauxCompletion.breakdown.fiscal_declarations.terminees / tauxCompletion.breakdown.fiscal_declarations.total) * 100)
                    : 0}% déposées
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default DashboardStats;