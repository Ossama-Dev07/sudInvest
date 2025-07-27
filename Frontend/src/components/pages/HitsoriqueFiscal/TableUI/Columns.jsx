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
  MoreVertical,
  Trash2,
  ArrowUpDown,
  CheckCircle,
  Clock,
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
import ViewHistoriqueFiscal from "../Actions/ViewHistoriqueFiscal";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "COMPLETE":
        return {
          text: "Terminé",
          className: "bg-green-100 flex justify-center text-green-800 hover:bg-green-200",
          icon: <CheckCircle className="w-3 h-3" />,
        };
      case "EN_COURS":
        return {
          text: "En Cours",
          className: "bg-blue-100 flex justify-center text-blue-800 hover:bg-blue-200",
          icon: <Clock className="w-3 h-3" />,
        };
      case "EN_RETARD":
        return {
          text: "En Retard",
          className: "bg-red-100 flex justify-center text-red-800 hover:bg-red-200",
          icon: <AlertTriangle className="w-3 h-3" />,
        };
      default:
        return {
          text: status,
          className: "bg-gray-100 flex justify-center text-gray-800",
          icon: <Clock className="w-3 h-3" />,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      className={`font-medium flex items-center gap-1 ${config.className}`}
    >
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
        type === "pm"
          ? "border-purple-300 text-purple-700 bg-purple-50"
          : "border-blue-300 text-blue-700 bg-blue-50"
      }`}
    >
      {type === "pm" ? (
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
            <div className="text-xs text-gray-500">ICE: {clientICE}</div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "client_type",
    header: <div className="ml-2">Type</div>,
    cell: ({ row }) => (
      <div className="">
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
        <Calendar className="w-4 h-4 " />
        Année
        <ArrowUpDown className=" h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const annee = row.getValue("annee_fiscal");
      return (
        <div className=" ml-5">
          <Badge
            variant="outline"
            className="font-bold text-blue-700 border-blue-300"
          >
            {annee}
          </Badge>
        </div>
      );
    },
  },

  {
    accessorKey: "statut_global",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} 
        className="ml-5"
      >
        Statut
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <StatusBadge status={row.getValue("statut_global")} />,
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
        return date.toLocaleDateString("fr-FR");
      };
      return (
        <div className="text-sm ml-8 text-gray-600">
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
      
      const { id } = historique;

      const { deleteHistorique } = useHistoriqueFiscalStore();

      const size = useResizeDisplay();
      const isMobile = size <= 768;

      const handleView = (data) => {
        navigate(`/historique_fiscal/voir-details/${data.id}`);
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
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-blue-500 hover:text-blue-700 px-4"
                    onClick={() => handleView(historique)}
                  >
                    <Eye className=" h-4 w-4" />
                    Voir détails
                  </Button>
                </DropdownMenuItem>

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
              
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              {/* View */}
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-400 hover:text-blue-600"
                onClick={() => handleView(historique)}
              >
                <Eye className="h-5 w-5" />
              </Button>

              {/* Delete */}
             
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
                        Cette action ne peut pas être annulée. L'historique
                        fiscal sera définitivement supprimé avec tous ses
                        versements et déclarations.
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
            
            </div>
          )}
        </div>
      );
    },
  },
];
