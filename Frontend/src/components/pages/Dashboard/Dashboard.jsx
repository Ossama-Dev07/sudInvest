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
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

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
    },
    taskDistribution: [
      { name: 'Terminées', value: 234, color: '#22c55e' },
      { name: 'En cours', value: 45, color: '#f59e0b' },
      { name: 'En retard', value: 12, color: '#ef4444' }
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label, type }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${type === 'currency' ? formatCurrency(entry.value) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
            <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
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
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
          
          {/* Revenue Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Évolution des Revenus
              </CardTitle>
              <CardDescription>Revenus mensuels sur les 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      className="text-sm fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      className="text-sm fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<CustomTooltip type="currency" />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                      name="Revenus"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

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

          {/* Weekly Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Performance Hebdomadaire
              </CardTitle>
              <CardDescription>Évolution des tâches et completion cette semaine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.weeklyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="day" 
                      className="text-sm fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      className="text-sm fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="tasks" fill="#6366f1" radius={[2, 2, 0, 0]} name="Tâches Assignées" />
                    <Bar dataKey="completed" fill="#22c55e" radius={[2, 2, 0, 0]} name="Tâches Terminées" />
                  </BarChart>
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
          
          {/* Task Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Répartition des Tâches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.taskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dashboardData.taskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-4">
                {dashboardData.taskDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{item.value}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((item.value / 319) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Tasks Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Tâches Hebdomadaires
              </CardTitle>
              <CardDescription>Performance cette semaine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.weeklyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="day" 
                      className="text-xs fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      className="text-xs fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="tasks" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                      name="Tâches"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                      name="Terminées"
                    />
                  </LineChart>
                </ResponsiveContainer>
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