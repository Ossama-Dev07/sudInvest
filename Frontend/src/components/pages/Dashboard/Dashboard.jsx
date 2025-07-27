import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardStats from './DashboardStats'; 
import TaskDistributionComponent from './TaskDistributionComponent';
import AcquisitionClients from './AcquisitionClients';
import ActivitesRecentes from './ActivitesRecentes';
import ElementsEnRetard from './ElementsEnRetard'; // ✅ Import the new component
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
import { 
  Users, 
  UserCog, 
  FileText, 
  Receipt, 
  Building2, 
  Calendar, 
  AlertCircle, 
  Plus, 
  Eye,
  Activity,
  Timer
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
   

      {/* Dashboard Stats Component */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6 ">
          
          {/* Client Acquisition Component */}
          <div className=''>
          <AcquisitionClients />
          </div>
          {/* ✅ REPLACED: Overdue Items Section with new component */}
          <ElementsEnRetard />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Task Distribution Component */}
          <TaskDistributionComponent />

          {/* Recent Activities Component */}
          <ActivitesRecentes 
            maxHeight="h-96"
            showHeader={true}
            showViewAllButton={true}
            maxActivities={5}
          />

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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  onClick={() => navigate('/clients/ajouter')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Ajouter Client
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start hover:bg-green-50 hover:text-green-700 transition-colors"
                  onClick={() => navigate('/Assemblee_Generale_ordinaire/ajouter')}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Nouvelle AGO
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  onClick={() => navigate('/historique_juridique/ajouter')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Dossier Juridique
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start hover:bg-orange-50 hover:text-orange-700 transition-colors"
                  onClick={() => navigate('/historique_fiscal/ajouter')}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Déclaration Fiscale
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start hover:bg-gray-50 hover:text-gray-700 transition-colors"
                  onClick={() => navigate('/utilisateurs/ajouter')}
                >
                  <UserCog className="w-4 h-4 mr-2" />
                  Nouvel Utilisateur
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;