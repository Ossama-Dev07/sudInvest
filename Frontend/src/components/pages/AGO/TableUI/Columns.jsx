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
} from "lucide-react";
import useResizeDisplay from "@/hooks/useResizeDisplay";
import useAgoStore from "@/store/AgoStore";

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
import ViewAgo from "../Actions/ViewAgo";

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
// Financial Amount Component
const FinancialAmount = ({ amount, type = "default", label = "" }) => {
  if (!amount || parseFloat(amount) === 0) {
    return (
      <Badge
        variant="outline"
        className="font-medium w-[100px] h-7 text-gray-500 border-gray-300"
      >
        -
      </Badge>
    );
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MAD",
  }).format(parseFloat(amount));

  const getColorClass = (type) => {
    switch (type) {
      case "resultat":
        return "bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"; // Purple
      case "ran_anterieurs":
        return "bg-[#06b6d4] hover:bg-[#0891b2] text-white"; // Cyan
      case "reserve":
        return "bg-[#f97316] hover:bg-[#ea580c] text-white"; // Orange
      case "benefice":
        return "bg-[#10b981] hover:bg-[#059669] text-white"; // Emerald
      case "ran":
        return "bg-[#3b82f6] hover:bg-[#2563eb] text-white"; // Blue
      case "tpa":
        return "bg-[#f59e0b] hover:bg-[#d97706] text-white"; // Amber
      case "dividendes":
        return "bg-[#059669] hover:bg-[#047857] text-white"; // Green
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  };

  return (
    <Badge className={`font-medium w-[120px] h-7 ${getColorClass(type)}`}>
      {formatted}
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
    accessorKey: "ago_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date AGO
        <ArrowUpDown className=" h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toISOString().split("T")[0];
      };
      return <div className="ml-6">{formatDate(row.getValue("ago_date"))}</div>;
    },
  },
  {
    accessorKey: "decision_type",
    header: <div className="text-center">Type Décision</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.getValue("decision_type")}{" "}
      </div>
    ),
  },
  {
    accessorKey: "annee",
    header: "Annee",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("annee")}</div>
    ),
  },

  // Financial Fields - Following the order: resultat_comptable, ran_anterieurs, reserve_legale, benefice_distribue, tpa_amount, ran_amount
  {
    accessorKey: "resultat_comptable",
    header: () => <div className="ml-3">Résultat</div>,
    cell: ({ row }) => (
      <FinancialAmount
        amount={row.getValue("resultat_comptable")}
        type="resultat"
      />
    ),
  },

  {
    accessorKey: "ran_anterieurs",
    header: () => <div className="ml-3">RAN Ant.</div>,
    cell: ({ row }) => (
      <FinancialAmount
        amount={row.getValue("ran_anterieurs")}
        type="ran_anterieurs"
      />
    ),
  },

  {
    accessorKey: "reserve_legale",
    header: () => <div className="ml-3">Réserve</div>,
    cell: ({ row }) => (
      <FinancialAmount amount={row.getValue("reserve_legale")} type="reserve" />
    ),
  },

  {
    accessorKey: "benefice_distribue",
    header: () => <div className="ml-3">Bénéfice</div>,
    cell: ({ row }) => (
      <FinancialAmount
        amount={row.getValue("benefice_distribue")}
        type="benefice"
      />
    ),
  },

  {
    accessorKey: "tpa_amount",
    header: () => <div className="ml-3">TPA</div>,
    cell: ({ row }) => (
      <FinancialAmount amount={row.getValue("tpa_amount")} type="tpa" />
    ),
  },

  {
    accessorKey: "ran_amount",
    header: () => <div className="ml-3">RAN</div>,
    cell: ({ row }) => (
      <FinancialAmount amount={row.getValue("ran_amount")} type="ran" />
    ),
  },

  {
    accessorKey: "dividendes_nets",
    header: () => <div className="ml-3">Dividendes</div>,
    cell: ({ row }) => (
      <FinancialAmount
        amount={row.getValue("dividendes_nets")}
        type="dividendes"
      />
    ),
  },

  // Progress Column
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
      const ago = row.original;

      const { id } = ago;

      const { deleteAgo } = useAgoStore();

      const [agoData, setAgoData] = useState();
      const size = useResizeDisplay();
      const isMobile = size <= 768;

      const handleView = (data) => {
        setAgoData(data);
      };

      const handleUpdate = (data) => {
        setAgoData(data);
        navigate(`/Assemblee_Generale_ordinaire/modifier/${data.id}`);
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
                        onClick={() => handleView(ago)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir détails
                      </Button>
                    </DialogTrigger>
                    <ViewAgo data={agoData} />
                  </Dialog>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-yellow-500 hover:text-yellow-700 px-4"
                    onClick={() => handleUpdate(ago)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 text-red-600 hover:text-red-800"
                    onClick={() => deleteAgo(id)}
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-400 hover:text-blue-600"
                    onClick={() => handleView(ago)}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <ViewAgo data={agoData} />
              </Dialog>

              {/* Edit */}
              <Button
                variant="ghost"
                className="text-yellow-500 hover:text-yellow-700 "
                onClick={() => handleUpdate(ago)}
              >
                <Edit className="h-4 w-4" />
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
                      Cette action ne peut pas être annulée. L'AGO sera
                      définitivement supprimée avec toutes ses étapes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <Button variant="destructive" onClick={() => deleteAgo(id)}>
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
