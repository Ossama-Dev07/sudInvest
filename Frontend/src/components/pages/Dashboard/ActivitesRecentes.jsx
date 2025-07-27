import React, { useEffect, useState } from 'react';
import useDashboardStore from '@/store/useDashboardStore';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Users, 
  UserCog, 
  FileText, 
  Receipt, 
  Building2,
  AlertCircle, 
  Activity,
  Bell,
  Loader2,
  Eye
} from 'lucide-react';

const ActivitesRecentes = ({ 
  className = "", 
  maxHeight = "h-96", 
  showHeader = true,
  maxActivities = 5 // Default to 5 activities
}) => {
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Store hooks
  const {
    // Recent Activities data
    recentActivities,
    loadingActivities,
    
    // Actions
    fetchRecentActivities,
    
    // Helper methods
    getRecentActivities,
    getActivitiesSummary,
    hasRecentActivities,
    
    // General
    error,
    clearError
  } = useDashboardStore();

  // Fetch recent activities on component mount
  useEffect(() => {
    fetchRecentActivities();
  }, [fetchRecentActivities]);

  // Get activities data
  const activities = getRecentActivities();
  const activitiesSummary = getActivitiesSummary();
  
  // Always limit to maxActivities for the main view
  const displayActivities = activities.slice(0, maxActivities);

  // Helper functions
  const getActivityIcon = (type) => {
    switch (type) {
      case 'client': return <Users className="w-4 h-4" />;
      case 'ago': return <Building2 className="w-4 h-4" />;
      case 'fiscal': return <Receipt className="w-4 h-4" />;
      case 'juridique': return <FileText className="w-4 h-4" />;
      case 'user': return <UserCog className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'warning': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusBadgeText = (status) => {
    switch (status) {
      case 'success': return 'Terminé';
      case 'pending': return 'En cours';
      case 'warning': return 'Attention';
      case 'info': return 'Info';
      default: return 'Inconnu';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'success': return 'border-green-300 text-green-700';
      case 'pending': return 'border-yellow-300 text-yellow-700';
      case 'warning': return 'border-orange-300 text-orange-700';
      case 'info': return 'border-blue-300 text-blue-700';
      default: return 'border-gray-300 text-gray-700';
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return null;
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleRetry = () => {
    clearError();
    fetchRecentActivities();
  };

  // Handle view all button click
  const handleViewAll = () => {
    setIsDialogOpen(true);
  };

  // Activity item component for reusability
  const ActivityItem = ({ activity, showBorder = true }) => (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${
        showBorder ? 'border border-transparent hover:border-border' : ''
      }`}
    >
      {/* Activity Icon */}
      <div className={`p-1.5 rounded-full ${getStatusColor(activity.status)} flex-shrink-0`}>
        {getActivityIcon(activity.type)}
      </div>
      
      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Main Action and Name */}
            <p className="text-sm font-medium text-foreground">{activity.action}</p>
            <p className="text-sm text-muted-foreground truncate">{activity.name}</p>
            
            {/* Additional Details */}
            {activity.details && (
              <div className="mt-1 space-y-1">
                {/* AGO Details */}
                {activity.type === 'ago' && (
                  <>
                    {activity.details.completion_rate !== undefined && (
                      <div className="text-xs text-muted-foreground">
                        <span>Progression: {activity.details.completion_rate}%</span>
                      </div>
                    )}
                    {activity.details.etape_nom && (
                      <div className="text-xs text-muted-foreground">
                        <span>Étape: {activity.details.etape_nom}</span>
                      </div>
                    )}
                    {activity.details.annee && (
                      <div className="text-xs text-muted-foreground">
                        <span>Année: {activity.details.annee}</span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Fiscal Details */}
                {activity.type === 'fiscal' && (
                  <>
                    {activity.details.montant && (
                      <div className="text-xs text-muted-foreground">
                        <span>Montant: {formatAmount(activity.details.montant)}</span>
                      </div>
                    )}
                    {activity.details.type_declaration && (
                      <div className="text-xs text-muted-foreground">
                        <span>Type: {activity.details.type_declaration}</span>
                      </div>
                    )}
                    {activity.details.type_impot && (
                      <div className="text-xs text-muted-foreground">
                        <span>Impôt: {activity.details.type_impot}</span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Juridical Details */}
                {activity.type === 'juridique' && (
                  <>
                    {activity.details.objet_principal && (
                      <div className="text-xs text-muted-foreground">
                        <span>Objet: {activity.details.objet_principal}</span>
                      </div>
                    )}
                    {activity.details.type_dossier && (
                      <div className="text-xs text-muted-foreground">
                        <span>Type: {activity.details.type_dossier}</span>
                      </div>
                    )}
                    {activity.details.nom_etape && (
                      <div className="text-xs text-muted-foreground">
                        <span>Étape: {activity.details.nom_etape}</span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Client Details */}
                {activity.type === 'client' && (
                  <>
                    {activity.details.client_type && (
                      <div className="text-xs text-muted-foreground">
                        <span>Type: {activity.details.client_type}</span>
                      </div>
                    )}
                    {activity.details.ice && (
                      <div className="text-xs text-muted-foreground">
                        <span>ICE: {activity.details.ice}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Time and Status */}
          <div className="text-right flex-shrink-0 ml-2">
            <p className="text-xs text-muted-foreground">{activity.time}</p>
            <Badge 
              variant="outline" 
              className={`text-xs mt-1 ${getStatusBadgeColor(activity.status)}`}
            >
              {getStatusBadgeText(activity.status)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Activités Récentes
                {activitiesSummary && (
                  <Badge variant="secondary" className="ml-2">
                    {activitiesSummary.total}
                  </Badge>
                )}
              </CardTitle>
            </div>
            <CardDescription>
              Dernières actions dans le système (7 derniers jours)
              {activitiesSummary && (
                <span className="block mt-1 text-xs">
                  {activitiesSummary.completed} terminées • {activitiesSummary.pending} en cours • {activitiesSummary.todayCount} aujourd'hui
                </span>
              )}
            </CardDescription>
          </CardHeader>
        )}
        
        <CardContent>
          {/* Loading State */}
          {loadingActivities && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">Chargement des activités...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loadingActivities && (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 font-medium">Erreur lors du chargement</p>
              <p className="text-muted-foreground text-sm mb-3">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
              >
                Réessayer
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loadingActivities && !error && !hasRecentActivities() && (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Aucune activité récente</p>
              <p className="text-muted-foreground text-sm">Les nouvelles activités apparaîtront ici</p>
            </div>
          )}

          {/* Activities List - Show only first 5 */}
          {!loadingActivities && !error && hasRecentActivities() && (
            <div className="space-y-3">
              <div className={`space-y-3 overflow-y-auto ${maxHeight}`}>
                {displayActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
              
              {/* View All Button - Show if there are more activities than displayed */}
              {activities.length > maxActivities && (
                <>
                  <Separator className="my-4" />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleViewAll}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir toutes les activités
                    <Badge variant="secondary" className="ml-2">
                      +{activities.length - maxActivities}
                    </Badge>
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for All Activities */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Toutes les Activités Récentes
              {activitiesSummary && (
                <Badge variant="secondary" className="ml-2">
                  {activitiesSummary.total} activités
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Historique complet des activités des 7 derniers jours
              {activitiesSummary && (
                <span className="block mt-1">
                  {activitiesSummary.completed} terminées • {activitiesSummary.pending} en cours • {activitiesSummary.todayCount} aujourd'hui
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {/* Dialog Loading State */}
            {loadingActivities && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
                <span className="text-muted-foreground">Chargement des activités...</span>
              </div>
            )}

            {/* Dialog Error State */}
            {error && !loadingActivities && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-2">Erreur lors du chargement</p>
                <p className="text-muted-foreground text-sm mb-4">{error}</p>
                <Button onClick={handleRetry}>
                  Réessayer
                </Button>
              </div>
            )}

            {/* Dialog Empty State */}
            {!loadingActivities && !error && !hasRecentActivities() && (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg font-medium">Aucune activité récente</p>
                <p className="text-muted-foreground">Les nouvelles activités apparaîtront ici</p>
              </div>
            )}

            {/* All Activities List in Dialog */}
            {!loadingActivities && !error && hasRecentActivities() && (
              <div className="pr-2"> {/* Add padding for scrollbar */}
                <div className="max-h-[60vh] overflow-y-auto space-y-2">
                  {activities.map((activity, index) => (
                    <div key={activity.id}>
                      <ActivityItem activity={activity} showBorder={false} />
                      {index < activities.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Dialog Footer with Stats */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Total: {activities.length} activités</span>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {activitiesSummary?.completed || 0} terminées
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        {activitiesSummary?.pending || 0} en cours
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {activitiesSummary?.todayCount || 0} aujourd'hui
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActivitesRecentes;