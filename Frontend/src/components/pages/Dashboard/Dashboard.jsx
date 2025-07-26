import React, { useState, useEffect } from 'react';
import DashboardStats from './DashboardStats'; // Import the DashboardStats component
import TaskDistributionComponent from './TaskDistributionComponent'; // Import the TaskDistributionComponent
import AcquisitionClients from './AcquisitionClients'; // Import the AcquisitionClients component
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
import { 
  Users, 
  UserCog, 
  FileText, 
  Receipt, 
  Building2, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Plus, 
  Eye,
  DollarSign,
  BarChart3,
  Activity,
  Timer,
  Bell,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
  // Sample data - removed quickStats, taskDistribution, and monthlyData since we're using dynamic components
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalClients: 156,
      activeUsers: 12,
      totalAGO: 89,
      completedTasks: 234,
      pendingTasks: 45,
      totalRevenue: 2450000,
      monthlyRevenue: 185000,
      completionRate: 78
    },
    recentActivities: [
      { id: 1, type: 'client', action: 'Nouveau client ajouté', name: 'STE MAROC TELECOM', time: '2 min', status: 'success' },
      { id: 2, type: 'ago', action: 'AGO terminée', name: 'Client ABC SARL', time: '15 min', status: 'success' },
      { id: 3, type: 'fiscal', action: 'Déclaration fiscale', name: 'XYZ Corporation', time: '1h', status: 'pending' },
      { id: 4, type: 'juridique', action: 'Dossier juridique mis à jour', name: 'DEF Entreprise', time: '2h', status: 'info' },
      { id: 5, type: 'user', action: 'Nouvel utilisateur', name: 'Mohamed Alami', time: '3h', status: 'success' }
    ],
    weeklyData: [
      { day: 'Lun', tasks: 12, completed: 8 },
      { day: 'Mar', tasks: 15, completed: 12 },
      { day: 'Mer', tasks: 18, completed: 16 },
      { day: 'Jeu', tasks: 22, completed: 18 },
      { day: 'Ven', tasks: 20, completed: 19 },
      { day: 'Sam', tasks: 8, completed: 7 },
      { day: 'Dim', tasks: 5, completed: 5 }
    ],
    overdueItems: {
      historiqueJuridique: [
        { id: 1, client: 'STE MAROC TELECOM', objet: 'Modification statuts', progression: 60 },
        { id: 2, client: 'ABC SARL', objet: 'Dossier contentieux', progression: 30 },
        { id: 3, client: 'XYZ Corp', objet: 'Contrat commercial', progression: 45 },
        { id: 4, client: 'DEF Industries', objet: 'Création filiale', progression: 20 },
        { id: 5, client: 'GHI Trading', objet: 'Restructuration', progression: 75 }
      ],
      historiqueFiscal: [
        { id: 1, client: 'DEF Entreprise', objet: 'Déclaration TVA Q2', dateEcheance: '2024-06-20' },
        { id: 2, client: 'GHI Industries', objet: 'IS 2023', dateEcheance: '2024-06-12' },
        { id: 3, client: 'JKL Trading', objet: 'Déclaration mensuelle', dateEcheance: '2024-06-19' },
        { id: 4, client: 'MNO Services', objet: 'TVA Avril 2024', dateEcheance: '2024-06-08' },
        { id: 5, client: 'PQR Holdings', objet: 'Régularisation IR', dateEcheance: '2024-06-16' }
      ],
      ago: [
        { id: 1, client: 'STU Corporation', objet: 'AGO 2023', dateEcheance: '2024-06-25' },
        { id: 2, client: 'VWX Holding', objet: 'AGO 2023', dateEcheance: '2024-06-14' },
        { id: 3, client: 'YZA Consulting', objet: 'AGO 2023', dateEcheance: '2024-06-11' }
      ]
    }
  });

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
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité - SudInvest Consulting</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Dashboard Stats Component - Replaces static quick stats */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Client Acquisition Component - Replaces static bar chart */}
          <AcquisitionClients />

          {/* Overdue Items Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Éléments en Retard
              </CardTitle>
              <CardDescription>Dossiers nécessitant une attention immédiate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                
                {/* Historique Juridique - Dossiers Incomplets */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <h4 className="font-semibold text-sm">Dossiers Juridiques Incomplets</h4>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {dashboardData.overdueItems.historiqueJuridique.length} en cours
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {dashboardData.overdueItems.historiqueJuridique.map((item) => (
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
                    ))}
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
                      {dashboardData.overdueItems.historiqueFiscal.length} en retard
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {dashboardData.overdueItems.historiqueFiscal.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-md text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.client}</p>
                          <p className="text-gray-600 dark:text-gray-400 truncate">{item.objet}</p>
                        </div>
                        <div className="text-right ml-2">
                          <Badge variant="outline" className="text-red-600 border-red-300">
                            En retard
                          </Badge>
                        </div>
                      </div>
                    ))}
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
                      {dashboardData.overdueItems.ago.length} en retard
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {dashboardData.overdueItems.ago.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-md text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.client}</p>
                          <p className="text-gray-600 dark:text-gray-400 truncate">{item.objet}</p>
                        </div>
                        <div className="text-right ml-2">
                          <Badge variant="outline" className="text-red-600 border-red-300">
                            En retard
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Voir tous les retards
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Module Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Aperçu des Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Clients Module */}
                <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">Clients</h3>
                    </div>
                    <Badge variant="secondary">156 Total</Badge>
                  </div>
                  <Progress value={85} className="mb-2 h-2" />
                  <p className="text-sm text-muted-foreground">85% de taux de satisfaction</p>
                </div>

                {/* Legal History Module */}
                <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold">Historique Juridique</h3>
                    </div>
                    <Badge variant="secondary">89 Dossiers</Badge>
                  </div>
                  <Progress value={72} className="mb-2 h-2" />
                  <p className="text-sm text-muted-foreground">72% de dossiers traités</p>
                </div>

                {/* Tax History Module */}
                <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-orange-600" />
                      <h3 className="font-semibold">Historique Fiscal</h3>
                    </div>
                    <Badge variant="secondary">134 Déclarations</Badge>
                  </div>
                  <Progress value={91} className="mb-2 h-2" />
                  <p className="text-sm text-muted-foreground">91% de conformité</p>
                </div>

                {/* AGO Module */}
                <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">AGO</h3>
                    </div>
                    <Badge variant="secondary">45 Cette Année</Badge>
                  </div>
                  <Progress value={78} className="mb-2 h-2" />
                  <p className="text-sm text-muted-foreground">78% d'AGO terminées</p>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Task Distribution Component - Replaces static pie chart */}
          <TaskDistributionComponent />

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Activités Récentes
              </CardTitle>
              <CardDescription>Dernières actions dans le système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`p-1.5 rounded-full ${getStatusColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.name}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <Button variant="outline" size="sm" className="w-full">
                Voir toutes les activités
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" size="sm" className="justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <Users className="w-4 h-4 mr-2" />
                  Ajouter Client
                </Button>
                <Button variant="outline" size="sm" className="justify-start hover:bg-green-50 hover:text-green-700 transition-colors">
                  <Building2 className="w-4 h-4 mr-2" />
                  Nouvelle AGO
                </Button>
                <Button variant="outline" size="sm" className="justify-start hover:bg-purple-50 hover:text-purple-700 transition-colors">
                  <FileText className="w-4 h-4 mr-2" />
                  Dossier Juridique
                </Button>
                <Button variant="outline" size="sm" className="justify-start hover:bg-orange-50 hover:text-orange-700 transition-colors">
                  <Receipt className="w-4 h-4 mr-2" />
                  Déclaration Fiscale
                </Button>
                <Button variant="outline" size="sm" className="justify-start hover:bg-gray-50 hover:text-gray-700 transition-colors">
                  <UserCog className="w-4 h-4 mr-2" />
                  Nouvel Utilisateur
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section - Important Alerts */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Alertes Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 hover:shadow-md transition-shadow">
              <Timer className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">12 AGO à finaliser</p>
                <p className="text-xs text-muted-foreground">Échéance dans 15 jours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 hover:shadow-md transition-shadow">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">5 déclarations en retard</p>
                <p className="text-xs text-muted-foreground">Action requise</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:shadow-md transition-shadow">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">8 RDV cette semaine</p>
                <p className="text-xs text-muted-foreground">Vérifier le calendrier</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;