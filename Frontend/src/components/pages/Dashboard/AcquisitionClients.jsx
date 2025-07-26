import React, { useState, useEffect } from 'react';
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
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const AcquisitionClients = () => {
  const {
    acquisitionClients,
    loadingAcquisition,
    error,
    fetchAcquisitionClients,
    refreshAcquisition,
    getAcquisitionChartData,
    getAcquisitionSummary,
    getCurrentMonthAcquisition,
    getPeakAcquisitionMonth,
    getAcquisitionTrend,
    hasAcquisitionData
  } = useDashboardStore();

  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'

  // Fetch data on component mount
  useEffect(() => {
    if (!hasAcquisitionData()) {
      fetchAcquisitionClients();
    }
  }, []);

  // Get processed data
  const chartData = getAcquisitionChartData();
  const summary = getAcquisitionSummary();
  const currentMonth = getCurrentMonthAcquisition();
  const peakMonth = getPeakAcquisitionMonth();
  const trend = getAcquisitionTrend();

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground mb-1">{label} 2025</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value} ${entry.value === 1 ? 'client' : 'clients'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Handle refresh
  const handleRefresh = async () => {
    await refreshAcquisition();
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    if (!trend) return null;
    return trend === 'up' ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    );
  };

  // Get trend color
  const getTrendColor = (trend) => {
    if (!trend) return 'text-gray-600';
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  // Loading state
  if (loadingAcquisition) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Acquisition de Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-80">
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Chargement des données d'acquisition...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Users className="w-5 h-5" />
            Acquisition de Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!hasAcquisitionData()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Acquisition de Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Aucune donnée d'acquisition disponible</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Chart Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Acquisition de Clients
              </CardTitle>
              <CardDescription>
                Nouveaux clients par mois en {new Date().getFullYear()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Chart Type Toggle */}
              <div className="flex border rounded-lg p-1">
                <Button
                  variant={chartType === 'bar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className="h-8 px-2"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={chartType === 'line' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('line')}
                  className="h-8 px-2"
                >
                  <TrendingUp className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Chart */}
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    domain={[0, 'dataMax + 5']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="clients"
                    fill="#3b82f6"
                    name="Nouveaux Clients"
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    domain={[0, 'dataMax + 5']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="clients"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Nouveaux Clients"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg border bg-card">
              <p className="text-2xl font-bold text-blue-600">{summary?.totalThisYear || 0}</p>
              <p className="text-sm text-muted-foreground">Total cette année</p>
            </div>
            <div className="text-center p-3 rounded-lg border bg-card">
              <p className="text-2xl font-bold text-green-600">{summary?.averagePerMonth || 0}</p>
              <p className="text-sm text-muted-foreground">Moyenne/mois</p>
            </div>
            <div className="text-center p-3 rounded-lg border bg-card">
              <p className="text-2xl font-bold text-purple-600">{currentMonth?.count || 0}</p>
              <p className="text-sm text-muted-foreground">Ce mois ({currentMonth?.month})</p>
            </div>
            <div className="text-center p-3 rounded-lg border bg-card">
              <p className="text-2xl font-bold text-orange-600">{peakMonth?.count || 0}</p>
              <p className="text-sm text-muted-foreground">Record ({peakMonth?.month})</p>
            </div>
          </div>

          {/* Trend Information */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total: {summary?.totalThisYear || 0} nouveaux clients cette année</span>
       
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default AcquisitionClients;