import React, { useState, useEffect } from 'react';
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
  Target,
  Timer,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Euro
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  // Sample data - in real app, this would come from your stores/API
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
    monthlyData: [
      { month: 'Jan', clients: 12, agos: 8, revenue: 150000 },
      { month: 'Fév', clients: 15, agos: 12, revenue: 180000 },
      { month: 'Mar', clients: 18, agos: 15, revenue: 220000 },
      { month: 'Avr', clients: 22, agos: 18, revenue: 250000 },
      { month: 'Mai', clients: 25, agos: 20, revenue: 285000 },
      { month: 'Jun', clients: 28, agos: 25, revenue: 320000 }
    ],
    taskDistribution: [
      { name: 'Terminées', value: 234, color: '#22c55e' },
      { name: 'En cours', value: 45, color: '#f59e0b' },
      { name: 'En retard', value: 12, color: '#ef4444' },
      { name: 'Planifiées', value: 28, color: '#6366f1' }
    ],
    quickStats: [
      { title: 'Clients Actifs', value: '156', change: '+12%', trend: 'up', icon: Users, color: 'blue' },
      { title: 'AGO du Mois', value: '25', change: '+8%', trend: 'up', icon: Building2, color: 'green' },
      { title: 'Revenus (MAD)', value: '2.45M', change: '+15%', trend: 'up', icon: DollarSign, color: 'purple' },
      { title: 'Taux Complétion', value: '78%', change: '-2%', trend: 'down', icon: Target, color: 'orange' }
    ]
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(amount);
  };

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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardData.quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
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
                  <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Évolution Mensuelle
              </CardTitle>
              <CardDescription>Clients, AGO et revenus sur les 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'revenue') return [formatCurrency(value), 'Revenus'];
                        return [value, name === 'clients' ? 'Clients' : 'AGO'];
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="clients" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="agos" stackId="3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
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
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">Clients</h3>
                    </div>
                    <Badge variant="secondary">156 Total</Badge>
                  </div>
                  <Progress value={85} className="mb-2" />
                  <p className="text-sm text-muted-foreground">85% de taux de satisfaction</p>
                </div>

                {/* Legal History Module */}
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold">Historique Juridique</h3>
                    </div>
                    <Badge variant="secondary">89 Dossiers</Badge>
                  </div>
                  <Progress value={72} className="mb-2" />
                  <p className="text-sm text-muted-foreground">72% de dossiers traités</p>
                </div>

                {/* Tax History Module */}
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-orange-600" />
                      <h3 className="font-semibold">Historique Fiscal</h3>
                    </div>
                    <Badge variant="secondary">134 Déclarations</Badge>
                  </div>
                  <Progress value={91} className="mb-2" />
                  <p className="text-sm text-muted-foreground">91% de conformité</p>
                </div>

                {/* AGO Module */}
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">AGO</h3>
                    </div>
                    <Badge variant="secondary">45 Cette Année</Badge>
                  </div>
                  <Progress value={78} className="mb-2" />
                  <p className="text-sm text-muted-foreground">78% d'AGO terminées</p>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Task Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Répartition des Tâches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.taskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dashboardData.taskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {dashboardData.taskDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                    <div className={`p-1 rounded-full ${getStatusColor(activity.status)}`}>
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
                <Button variant="outline" size="sm" className="justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Ajouter Client
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Building2 className="w-4 h-4 mr-2" />
                  Nouvelle AGO
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Dossier Juridique
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Receipt className="w-4 h-4 mr-2" />
                  Déclaration Fiscale
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
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
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <Timer className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">12 AGO à finaliser</p>
                <p className="text-xs text-muted-foreground">Échéance dans 15 jours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">5 déclarations en retard</p>
                <p className="text-xs text-muted-foreground">Action requise</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
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