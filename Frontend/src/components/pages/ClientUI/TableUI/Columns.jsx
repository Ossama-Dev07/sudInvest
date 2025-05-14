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
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Eye, Edit, MoreVertical, Trash2, ArrowUpDown } from "lucide-react";
import useResizeDisplay from "@/hooks/useResizeDisplay";
import useUtilisateurStore from "@/store/useUtilisateurStore";
import useClientStore from "@/store/useClientStore";
import { Badge } from "@/components/ui/badge";

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
    accessorKey: "rc",
    header: <div className="text center">RC</div>,
    cell: ({ row }) => <div className="capitalize">{row.getValue("rc")}</div>,
  },
  {
    accessorKey: "ice",
    header: <div className="text center">ICE</div>,
    cell: ({ row }) => <div className="capitalize">{row.getValue("ice")}</div>,
  },
  {
    accessorKey: "taxe_profes",
    header: <div className="text center">taxe_profes</div>,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("taxe_profes")}</div>
    ),
  },
  {
    accessorKey: "CIN_client",
    header: <div className="text center">CIN</div>,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("CIN_client")}</div>
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
    accessorKey: "adresse",
    header: "Adresse",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("adresse")}</div>
    ),
  },
  {
    accessorKey: "activite",
    header: <div className="px-7">Activite</div>,
    cell: ({ row }) =>
      row.getValue("activite") ? (
        <Badge className="capitalize w-[150px] break-words line-clamp-2 text-center">
          {row.getValue("activite")}
        </Badge>
      ) : null,
  },
  {
    accessorKey: "date_collaboration",
    header: "date d'collaboration",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("date_collaboration")}</div>
    ),
  },
  {
    accessorKey: "datecreation",
    header: "date d'creation",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("datecreation")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const client = row.original;
      const { id_client } = client;

      const navigate = useNavigate();
      const { deactivateClient } = useClientStore();
      const size = useResizeDisplay();
      const isMobile = size <= 768;
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
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-blue-500 hover:text-blue-700"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom"></SheetContent>
                  </Sheet>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-yellow-500 hover:text-yellow-700 px-4"
                    onClick={() => navigate(`/clients/modifier/${id_client}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 text-red-600 hover:text-red-800"
                    
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                  </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Êtes-vous absolument sûr ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action ne peut pas être annulée. L'client sera
                      déplacé dans les archives et ne sera plus actif.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                    <Button
                      variant="destructive"
                      onClick={() => deactivateClient(id_client)}
                    >
                      Continue
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <SheetContent side="right"></SheetContent>
              </Sheet>

              {/* Edit */}
              <Button
                variant="ghost"
                size="icon"
                className="text-yellow-500 hover:text-yellow-700"
                onClick={() => {
                  navigate(`/clients/modifier/${id_client}`);
                }}
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
                      Cette action ne peut pas être annulée. L'client sera
                      déplacé dans les archives et ne sera plus actif.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                    <Button
                      variant="destructive"
                      onClick={() => deactivateClient(id_client)}
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
