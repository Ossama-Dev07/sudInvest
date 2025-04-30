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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import useInitials from "@/hooks/useInitials";
import {
  ArrowUpDown,
  Edit,
  Eye,
  MoreVertical,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Veiw from "../Veiw";

import useResizeDisplay from "@/hooks/useResizeDisplay";
import useUtilisateurStore from "@/store/useUtilisateurStore";

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
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nom
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize px-5">{row.getValue("nom_utilisateur")}</div>
    ),
  },
  {
    accessorKey: "prenom_utilisateur",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Prénom
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize px-5">
        {row.getValue("prenom_utilisateur")}
      </div>
    ),
  },

  {
    accessorKey: "Ntele_utilisateur",
    header: <div className="">Numéro de téléphone</div>,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("Ntele_utilisateur")}</div>
    ),
  },
  {
    accessorKey: "archived_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date d'achèvement
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="lowercase pl-7">
        {new Date(row.getValue("archived_at")).toISOString().split("T")[0]}
      </div>
    ),
  },

  {
    id: "actions",
    header: <div>Actionnés</div>,
    cell: ({ row }) => {
      const utilisateur = row.original;
      const { restoreUtilisateur, deleteArchivedUtilisateur } = useUtilisateurStore();
      const size = useResizeDisplay();
      const isMobile = size <= 768;

      return (
        <div className="flex ">
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Restore */}
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-green-500 hover:text-green-700"
                    onClick={() =>
                      restoreUtilisateur(utilisateur.id_utilisateur)
                    }
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restore
                  </Button>
                </DropdownMenuItem>

                {/* Delete Permanent */}
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-800"
                    onClick={() =>
                      deleteArchivedUtilisateur(utilisateur.id_utilisateur)
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Permanently
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Restore */}
              <Button
                variant="ghost"
                size="icon"
                className="text-green-500 hover:text-green-700"
                onClick={() => restoreUtilisateur(utilisateur.id_utilisateur)}
              >
                <RefreshCw className="h-5 w-5" />
              </Button>

              {/* Delete Permanent */}
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
                      Êtes-vous absolument sûr de vouloir supprimer cet
                      utilisateur ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Le utilisateur sera
                      supprimé de manière permanente, ainsi que toutes ses
                      données.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                    <Button
                      variant="destructive"
                      onClick={() =>
                        deleteArchivedUtilisateur(utilisateur.id_utilisateur)
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
