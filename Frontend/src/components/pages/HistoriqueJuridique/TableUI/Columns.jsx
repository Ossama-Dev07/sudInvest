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
  Users,
  Building2,
} from "lucide-react";
import useResizeDisplay from "@/hooks/useResizeDisplay";
import useUtilisateurStore from "@/store/useUtilisateurStore";
import useHistoriqueJuridiqueStore from "@/store/HistoriqueJuridiqueStore";
import UpdatHistorique from "../Actions/UpdatHistorique";
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
import ViewHistoriuqe from "../Actions/ViewHistoriuqe";
import useAuthStore from "@/store/AuthStore";

// Progress Component
const ProgressBar = ({ percentage, completedSteps, totalSteps }) => {
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
            className={`h-full rounded-full  transition-all duration-500 ease-out ${getProgressColor(
              percentage
            )}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {completedSteps}/{totalSteps} étapes
          </span>
          {percentage === 100 && (
            <Badge
              variant="secondary"
              className="text-xs bg-green-100 text-green-800 px-2 py-0 "
            >
              ✓ Complet
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
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
      
  
      const clientICE = row.original.ice;

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
    accessorKey: "type",
    header: <div className="ml-2">Type</div>,
    cell: ({ row }) => (
      <div className="">
        <ClientTypeBadge type={row.getValue("type")} />
      </div>
    ),
  },
  {
    accessorKey: "objet",
    header: <div className="text center">Objet</div>,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("objet")}</div>
    ),
  },
  {
    accessorKey: "date_modification",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date-modification
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="px-7">{row.getValue("date_modification")}</div>
    ),
  },

  {
    accessorKey: "montant",
    header: () => <div className="ml-3">Montant</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("montant"));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "MAD",
      }).format(amount);

      return (
        <Badge className="font-medium w-[100px] h-7 bg-[#e68e09] hover:bg-[#fc9e12] dark:hover:bg-[#d78407]  text-black dark:text-white">
          {formatted}
        </Badge>
      );
    },
  },

  {
    accessorKey: "debours",
    header: () => <div className=" ml-3">Débours</div>,
    cell: ({ row }) => {
      const debours = row.getValue("debours");

      // Handle null, undefined, or empty debours
      if (
        !debours ||
        debours === "" ||
        debours === "0" ||
        parseFloat(debours) === 0
      ) {
        return (
          <Badge
            variant="outline"
            className="font-medium w-[100px] h-7 text-gray-500 border-gray-300"
          >
            Non défini
          </Badge>
        );
      }

      const amount = parseFloat(debours);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "MAD",
      }).format(amount);

      return (
        <Badge className="font-medium w-[100px] h-7 bg-[#059669] hover:bg-[#047857] text-white">
          {formatted}
        </Badge>
      );
    },
  },

  // New Progress Column
  {
    accessorKey: "etapes",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className=""
      >
        <TrendingUp className="w-4 h-4" />
        <span>Progression</span>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const etapes = row.getValue("etapes") || [];
      const totalSteps = etapes.length;
      const completedSteps = etapes.filter(
        (etape) => etape.statut === "oui"
      ).length;
      const percentage =
        totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      return (
        <ProgressBar
          percentage={percentage}
          completedSteps={completedSteps}
          totalSteps={totalSteps}
        />
      );
    },
    sortingFn: (rowA, rowB) => {
      const etapesA = rowA.getValue("etapes") || [];
      const etapesB = rowB.getValue("etapes") || [];

      const percentageA =
        etapesA.length > 0
          ? Math.round(
              (etapesA.filter((etape) => etape.statut === "oui").length /
                etapesA.length) *
                100
            )
          : 0;
      const percentageB =
        etapesB.length > 0
          ? Math.round(
              (etapesB.filter((etape) => etape.statut === "oui").length /
                etapesB.length) *
                100
            )
          : 0;

      return percentageA - percentageB;
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

      const { deleteHistorique } = useHistoriqueJuridiqueStore();

      const [historiquedata, setHistoriquedata] = useState();
      const size = useResizeDisplay();
      const isMobile = size <= 768;
      const handleView = (data) => {
        setHistoriquedata(data);
      };
      const handleupdate = (data) => {
        setHistoriquedata(data);
        navigate(`/historique_juridique/modifier/${data.id}`);
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
                    <ViewHistoriuqe data={historiquedata} />
                  </Dialog>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-yellow-500 hover:text-yellow-700 px-4"
                    onClick={() => handleupdate(historique)}
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
                <ViewHistoriuqe data={historiquedata} />
              </Dialog>

              {/* Edit */}

              <Button
                variant="ghost"
                className="text-yellow-500 hover:text-yellow-700 "
                onClick={() => handleupdate(historique)}
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
                        Cette action ne peut pas être annulée. L'utilisateur
                        sera déplacé dans les archives et ne sera plus actif.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button
                        variant="destructive"
                        onClick={() => deleteHistorique(id)}
                      >
                        Continue
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
