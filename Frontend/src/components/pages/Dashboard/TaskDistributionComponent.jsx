import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, FileText, Building2, BarChart3, RefreshCw } from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import useDashboardStore from '@/store/useDashboardStore'; // Adjust path as needed

const TaskDistributionComponent = () => {
  const [selectedModule, setSelectedModule] = useState('combined');
  
  // Get data and actions from store
  const {
    taskDistribution,
    loading,
    error,
    fetchTaskDistribution,
    refreshTaskDistribution,
    getTaskDistributionByModule,
    clearError
  } = useDashboardStore();

  // Fetch data on component mount
  useEffect(() => {
    if (!taskDistribution) {
      fetchTaskDistribution();
    }
  }, [taskDistribution, fetchTaskDistribution]);

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground">{data.name}</p>
          <p className="text-sm" style={{ color: data.payload.color }}>
            {`${data.value} tâches (${data.payload.percentage}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get current module data
  const getCurrentData = () => {
    const moduleData = getTaskDistributionByModule(selectedModule);
    return moduleData || { data: [], total: 0, name: '' };
  };

  const currentData = getCurrentData();

  // Handle refresh
  const handleRefresh = () => {
    clearError();
    refreshTaskDistribution();
  };

  if (loading && !taskDistribution) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Répartition des Tâches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Répartition des Tâches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 p-8">
            <p>Erreur: {error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Réessayer
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!taskDistribution) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Répartition des Tâches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p>Aucune donnée disponible</p>
            <button 
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Charger les données
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Répartition des Tâches
          {loading && (
            <RefreshCw className="w-4 h-4 animate-spin text-purple-600 ml-auto" />
          )}
        </CardTitle>
        
        {/* Module selector */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setSelectedModule('combined')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedModule === 'combined' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" />
            Global
          </button>
          <button
            onClick={() => setSelectedModule('historique_fiscal')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedModule === 'historique_fiscal' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1" />
            Fiscal
          </button>
          <button
            onClick={() => setSelectedModule('ago')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedModule === 'ago' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-1" />
            AGO
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Pie Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={currentData.data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {currentData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Statistics */}
        <div className="space-y-3 mt-4">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-lg">{currentData.name}</h3>
            <Badge variant="outline" className="mt-1">
              Total: {currentData.total} tâches
            </Badge>
          </div>
          
          {currentData.data.map((item, index) => (
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
                  {item.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary for combined view */}
        {selectedModule === 'combined' && taskDistribution && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3">Détails par module</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <span>Historique Fiscal</span>
                </div>
                <Badge variant="secondary">{taskDistribution.historique_fiscal?.total || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-green-600" />
                  <span>AGO</span>
                </div>
                <Badge variant="secondary">{taskDistribution.ago?.total || 0}</Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskDistributionComponent;