import React, { useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Receipt, 
  Building2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import useDashboardStore from '@/store/useDashboardStore';

const ElementsEnRetard = () => {
  const {
    fetchElementsEnRetard,
    getHistoriqueJuridiqueRetard,
    getHistoriqueFiscalRetard,
    getAGORetard,
    getTotalElementsRetard,
    getElementsRetardByCategory,
    loadingElementsRetard,
    refreshElementsEnRetard
  } = useDashboardStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchElementsEnRetard();
  }, [fetchElementsEnRetard]);

  // Get data from store
  const juridiqueRetard = getHistoriqueJuridiqueRetard();
  const fiscalRetard = getHistoriqueFiscalRetard();
  const agoRetard = getAGORetard();
  const totalRetard = getTotalElementsRetard();
  const categoryCount = getElementsRetardByCategory();

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="flex-1">
              <Skeleton className="h-3 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-1 w-full mt-1" />
            </div>
            <Skeleton className="h-5 w-12 ml-2" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between h-full" >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <CardTitle>Éléments en Retard</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshElementsEnRetard}
            disabled={loadingElementsRetard}
          >
            <RefreshCw className={`w-4 h-4 ${loadingElementsRetard ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          {totalRetard > 0 
            ? `${totalRetard} dossiers nécessitant une attention immédiate`
            : 'Aucun élément en retard actuellement'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingElementsRetard ? (
          <div className="space-y-6">
            <LoadingSkeleton />
            <Separator />
            <LoadingSkeleton />
            <Separator />
            <LoadingSkeleton />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Historique Juridique - Dossiers Incomplets */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <h4 className="font-semibold text-sm">Dossiers Juridiques Incomplets</h4>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {categoryCount.juridique} en cours
                </Badge>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {juridiqueRetard.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun dossier juridique en retard
                  </p>
                ) : (
                  juridiqueRetard.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.client}</p>
                        <p className="text-gray-600 dark:text-gray-400 truncate">{item.objet}</p>
                        <div className="mt-1">
                          <Progress value={item.progression} className="h-1.5 w-full" />
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <Badge variant="outline" className="text-blue-600 border-blue-300">
                          {item.progression}%
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Separator />

            {/* Historique Fiscal Retards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-orange-600" />
                  <h4 className="font-semibold text-sm">Historique Fiscal</h4>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {categoryCount.fiscal} en retard
                </Badge>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {fiscalRetard.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun historique fiscal en retard
                  </p>
                ) : (
                  fiscalRetard.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-md text-xs">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.client}</p>
                        <p className="text-gray-600 dark:text-gray-400 truncate">{item.objet}</p>
                        {item.annees_retard && (
                          <p className="text-red-600 text-xs mt-1">
                            {item.annees_retard} année(s) de retard
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-2">
                        <Badge variant="outline" className="text-red-600 border-red-300">
                          {item.statut || 'En retard'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Separator />

            {/* AGO Retards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-sm">AGO</h4>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {categoryCount.ago} en retard
                </Badge>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {agoRetard.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune AGO en retard
                  </p>
                ) : (
                  agoRetard.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-md text-xs">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.client}</p>
                        <p className="text-gray-600 dark:text-gray-400 truncate">{item.objet}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={item.progression} className="h-1.5 flex-1" />
                          {item.annees_retard && (
                            <span className="text-red-600 text-xs">
                              {item.annees_retard} an(s)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <Badge variant="outline" className="text-red-600 border-red-300">
                          {item.progression}%
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Button */}
            {totalRetard > 0 && (
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => {
                    // Add navigation logic here if needed
                    console.log('Navigate to detailed overdue items view');
                  }}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Voir tous les retards ({totalRetard})
                </Button>
              </div>
            )}

          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ElementsEnRetard;