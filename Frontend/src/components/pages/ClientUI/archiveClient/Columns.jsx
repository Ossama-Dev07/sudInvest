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

import useResizeDisplay from "@/hooks/useResizeDisplay";
import useAuthStore from "@/store/AuthStore";
import useClientStore from "@/store/useClientStore";

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
    accessorKey: "statut_client",
    header: "",
    cell: ({ row }) => {
      const status = row.getValue("statut_client");

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
      const nom = row.getValue("nom_client");
      const prenom = row.getValue("prenom_client");
      const r = row.getValue("raisonSociale");
      if (nom && prenom) {
        const initials = useInitials(prenom, nom);
        return (
          <Avatar className=" flex items-center justify-center bg-gray-600 text-white rounded-full overflow-hidden dark:bg-gray-500 ">
            <div>{initials}</div>
          </Avatar>
        );
      } else if (r) {
        const initials = useInitials(r, r);
        return (
          <Avatar className=" flex items-center justify-center bg-gray-600 text-white rounded-full overflow-hidden dark:bg-gray-500 ">
            <div>{initials}</div>
          </Avatar>
        );
      }
    },
  },
  {
    accessorKey: "nom_client",
    header: "Nom",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("nom_client") ? (
          row.getValue("nom_client")
        ) : (
          <div className="px-2">_____</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "prenom_client",
    header: "Prénom",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("prenom_client") ? (
          row.getValue("prenom_client")
        ) : (
          <div className="px-2">_____</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "raisonSociale",
    header: <div className="text center">Raison Sociale</div>,
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("raisonSociale") ? (
          row.getValue("raisonSociale")
        ) : (
          <div className="px-2">_____</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-center"
      >
        E-mail
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },

  {
    accessorKey: "telephone",
    header: "Numero de telephone",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("telephone")}</div>
    ),
  },

  {
    accessorKey: "archived_at",
    header: "Date d'achèvement",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("archived_at")}</div>
    ),
  },
  {
    accessorKey: "date_collaboration",
    header: "date d'collaboration",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("date_collaboration")}</div>
    ),
  },
  {
    id: "actions",

    cell: ({ row }) => {
      const role_utilisateur = useAuthStore(
        (state) => state.user?.role_utilisateur
      );
      const isAdmin = role_utilisateur === "admin";
      const client = row.original;
      const { deleteClient, restoreClient } = useClientStore();

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
                    onClick={() => restoreClient(client.id_client)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restore
                  </Button>
                </DropdownMenuItem>

                {/* Delete Permanent */}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Permanently
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Êtes-vous absolument sûr de vouloir supprimer cet
                            client ?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Le client sera
                            supprimé de manière permanente, ainsi que tout son
                            historique juridique
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>

                          <Button
                            variant="destructive"
                            onClick={() => deleteClient(client.id_client)}
                          >
                            Continue
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Restore */}
              <Button
                variant="ghost"
                size="icon"
                className="text-green-500 hover:text-green-700"
                onClick={() => restoreClient(client.id_client)}
              >
                <RefreshCw className="h-5 w-5" />
              </Button>

              {/* Delete Permanent */}
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
                        Êtes-vous absolument sûr de vouloir supprimer cet client
                        ?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Le client sera supprimé
                        de manière permanente, ainsi que tout son historique
                        juridique
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>

                      <Button
                        variant="destructive"
                        onClick={() => deleteClient(client.id_client)}
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
