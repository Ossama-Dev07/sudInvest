import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import useInitials from "@/hooks/useInitials";

import { useNavigate } from "react-router-dom";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Eye,
  Edit,
  MoreVertical,
  Trash2,
  ArrowUpDown,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  DollarSign,
  Building2,
  Users,
  FileText,
  AlertTriangle,
} from "lucide-react";
import useResizeDisplay from "@/hooks/useResizeDisplay";
import useHistoriqueFiscalStore from "@/store/HistoriqueFiscalStore";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import useAuthStore from "@/store/AuthStore";
// import ViewHistoriqueFiscal from "../Actions/ViewHistoriqueFiscal";

// Progress Component for Fiscal History
const FiscalProgressBar = ({ percentage, completedElements, totalElements, statusDetails }) => {
  const getProgressColor = (percentage) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-gray-300";
  };

  const getStatusIcon = (percentage) => {
    if (percentage === 100)
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (percentage > 0) return <TrendingUp className="w-4 h-4 text-blue-600" />;
    return <Clock className="w-4 h-4 text-gray-500" />;
  };

  const getStatusText = (percentage) => {
    if (percentage === 100) return "Terminé";
    if (percentage >= 75) return "Presque fini";
    if (percentage >= 50) return "En cours";
    if (percentage >= 25) return "Démarré";
    return "Non démarré";
  };

  return (
    <div className="flex items-center space-x-3 min-w-[200px]">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            {getStatusIcon(percentage)}
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
              {getStatusText(percentage)}
            </span>
          </div>
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
            {percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden ">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(
              percentage
            )}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Status details */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{statusDetails?.paiements_payes || 0}/{statusDetails?.total_paiements || 0} Versements</span>
            <span>•</span>
            <span>{statusDetails?.declarations_deposees || 0}/{statusDetails?.total_declarations || 0} Déclarations</span>
          </div>
          {percentage === 100 && (
            <Badge
              variant="secondary"
              className="text-xs bg-green-100 text-green-800 px-2 py-0"
            >
              ✓ Complet
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'COMPLETE':
        return {
          text: 'Terminé',
          className: 'bg-green-100 text-green-800 hover:bg-green-200',
          icon: <CheckCircle className="w-3 h-3" />
        };
      case 'EN_COURS':
        return {
          text: 'En Cours',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
          icon: <Clock className="w-3 h-3" />
        };
      case 'EN_RETARD':
        return {
          text: 'En Retard',
          className: 'bg-red-100 text-red-800 hover:bg-red-200',
          icon: <AlertTriangle className="w-3 h-3" />
        };
      default:
        return {
          text: status,
          className: 'bg-gray-100 text-gray-800',
          icon: <Clock className="w-3 h-3" />
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={`font-medium flex items-center gap-1 ${config.className}`}>
      {config.icon}
      {config.text}
    </Badge>
  );
};

// Client Type Badge
const ClientTypeBadge = ({ type }) => {
  return (
    <Badge 
      variant="outline" 
      className={`font-medium ${
        type === 'pm' 
          ? 'border-purple-300 text-purple-700 bg-purple-50' 
          : 'border-blue-300 text-blue-700 bg-blue-50'
      }`}
    >
      {type === 'pm' ? (
        <>
          <Building2 className="w-3 h-3 mr-1" />
          PM
        </>
      ) : (
        <>
          <Users className="w-3 h-3 mr-1" />
          PP
        </>
      )}
    </Badge>
  );
};

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "client_display",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Client
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const clientDisplay = row.getValue("client_display");
      const clientType = row.original.client_type;
      const clientICE = row.original.client_ice;
      
      return (
        <div className="flex flex-col space-y-1">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {clientDisplay || "Client non défini"}
          </div>
          {clientICE && (
            <div className="text-xs text-gray-500">
              ICE: {clientICE}
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "client_type",
    header: <div className="text-center">Type</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ClientTypeBadge type={row.getValue("client_type")} />
      </div>
    ),
  },

  {
    accessorKey: "annee_fiscal",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <Calendar className="w-4 h-4 mr-2" />
        Année
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const annee = row.getValue("annee_fiscal");
      return (
        <Badge variant="outline" className="font-bold text-blue-700 border-blue-300">
          {annee}
        </Badge>
      );
    },
  },

  {
    accessorKey: "progress_percentage",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <TrendingUp className="w-4 h-4 mr-2" />
        Progression
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const percentage = row.getValue("progress_percentage") || 0;
      const statusDetails = {
        paiements_payes: row.original.paiements_payes,
        total_paiements: row.original.total_paiements,
        declarations_deposees: row.original.declarations_deposees,
        total_declarations: row.original.total_declarations,
      };
      const totalElements = row.original.total_elements || 0;
      const completedElements = row.original.completed_elements || 0;

      return (
        <FiscalProgressBar
          percentage={percentage}
          completedElements={completedElements}
          totalElements={totalElements}
          statusDetails={statusDetails}
        />
      );
    },
    sortingFn: (rowA, rowB) => {
      const percentageA = rowA.getValue("progress_percentage") || 0;
      const percentageB = rowB.getValue("progress_percentage") || 0;
      return percentageA - percentageB;
    },
  },

  {
    accessorKey: "statut_global",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Statut
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <StatusBadge status={row.getValue("statut_global")} />
    ),
  },

  {
    accessorKey: "datecreation",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date Création
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('fr-FR');
      };
      return (
        <div className="text-sm text-gray-600">
          {formatDate(row.getValue("datecreation"))}
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const historique = row.original;
      const role_utilisateur = useAuthStore(
        (state) => state.user?.role_utilisateur
      );
      const isAdmin = role_utilisateur === "admin";
      const { id } = historique;

      const { deleteHistorique } = useHistoriqueFiscalStore();

      const [historiqueData, setHistoriqueData] = useState();
      const size = useResizeDisplay();
      const isMobile = size <= 768;

      const handleView = (data) => {
        setHistoriqueData(data);
      };

      const handleUpdate = (data) => {
        setHistoriqueData(data);
        navigate(`/historique-fiscal/modifier/${data.id}`);
      };

      return (
        <div className="flex items-center justify-center">
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-blue-500 hover:text-blue-700 px-4"
                        onClick={() => handleView(historique)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir détails
                      </Button>
                    </DialogTrigger>
                    {/* <ViewHistoriqueFiscal data={historiqueData} /> */}
                  </Dialog>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-yellow-500 hover:text-yellow-700 px-4"
                    onClick={() => handleUpdate(historique)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 text-red-600 hover:text-red-800"
                      onClick={() => deleteHistorique(id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </Button>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              {/* View */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-400 hover:text-blue-600"
                    onClick={() => handleView(historique)}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                {/* <ViewHistoriqueFiscal data={historiqueData} /> */}
              </Dialog>

              {/* Edit */}
              <Button
                variant="ghost"
                className="text-yellow-500 hover:text-yellow-700"
                onClick={() => handleUpdate(historique)}
              >
                <Edit className="h-4 w-4" />
              </Button>

              {/* Delete */}
              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Êtes-vous absolument sûr ?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action ne peut pas être annulée. L'historique fiscal sera
                        définitivement supprimé avec tous ses versements et déclarations.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <Button
                        variant="destructive"
                        onClick={() => deleteHistorique(id)}
                      >
                        Supprimer
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      );
    },
  },
];