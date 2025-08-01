import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import useInitials from "@/hooks/useInitials";
import { ArrowUpDown, Edit, Eye, MoreVertical, Trash2 } from "lucide-react";
import Veiw from "../Actions/Veiw";
import useResizeDisplay from "@/hooks/useResizeDisplay";
import useUtilisateurStore from "@/store/useUtilisateurStore";
import { useNavigate } from "react-router-dom";
import MobileActions from "../Actions/MobileActions";

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
    accessorKey: "statut_utilisateur",
    header: "",
    cell: ({ row }) => {
      const status = row.getValue("statut_utilisateur");

      const statusColor = status === "actif" ? "bg-green-500" : "bg-[#fb8500]";

      return (
        <div className="flex items-center  justify-center ">
          <span className={`h-2 w-2 rounded-full ${statusColor}`}></span>
        </div>
      );
    },
  },
  {
    accessorKey: "profile",
    header: "",
    cell: ({ row }) => {
      const nom = row.getValue("nom_utilisateur");
      const prenom = row.getValue("prenom_utilisateur");

      const initials = useInitials(prenom, nom);

      return (
        <Avatar className=" flex items-center justify-center bg-gray-600 text-white rounded-full overflow-hidden dark:bg-gray-500 ">
          <div>{initials}</div>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "nom_utilisateur",
    header: "Nom",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("nom_utilisateur")}</div>
    ),
  },
  {
    accessorKey: "prenom_utilisateur",
    header: "Prénom",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("prenom_utilisateur")}</div>
    ),
  },
  {
    accessorKey: "CIN_utilisateur",
    header: "CIN",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("CIN_utilisateur")}</div>
    ),
  },
  {
    accessorKey: "email_utilisateur",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("email_utilisateur")}</div>
    ),
  },
  {
    accessorKey: "dateIntri_utilisateur",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date d'intégration
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue("dateIntri_utilisateur");
      
      // Format the date to show only YYYY-MM-DD
      const formatDate = (dateString) => {
        if (!dateString) return "";
        return dateString.split('T')[0];
      };

      return (
        <div className="lowercase pl-7">
          {formatDate(dateValue)}
        </div>
      );
    },
  },
  {
    accessorKey: "Ntele_utilisateur",
    header: <div className="">Numéro de téléphone</div>,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("Ntele_utilisateur")}</div>
    ),
  },
  {
    accessorKey: "role_utilisateur",
    header: <div className="text-center">Role</div>,
    cell: ({ row }) => (
      <Badge className="capitalize  w-full  flex justify-center">
        <span>{row.getValue("role_utilisateur")}</span>
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const utilisateur = row.original;
      const { id_utilisateur } = utilisateur;

      const navigate = useNavigate();
      const { deactivateUtilisateur } = useUtilisateurStore();

      const size = useResizeDisplay();

      const isMobile = size <= 768;

      return (
        <div className="flex items-center justify-center">
          {isMobile ? (
            <MobileActions utilisateur={utilisateur} />
          ) : (
            <div className="flex items-center space-x-2">
              {/* View */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <Veiw utilisateur={utilisateur} />
                </SheetContent>
              </Sheet>

              {/* Edit */}

              <Button
                variant="ghost"
                size="icon"
                className="text-yellow-500 hover:text-yellow-700"
                onClick={() =>
                  navigate(`/utilisateurs/modifier/${id_utilisateur}`)
                }
              >
                <Edit className="h-5 w-5" />
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
                      Cette action ne peut pas être annulée. L'utilisateur ne
                      sera pas supprimé définitivement, mais sera déplacé dans
                      les archives et ne sera plus actif.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                    <Button
                      variant="destructive"
                      onClick={() =>
                        deactivateUtilisateur(utilisateur.id_utilisateur)
                      }
                    >
                      Continue
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