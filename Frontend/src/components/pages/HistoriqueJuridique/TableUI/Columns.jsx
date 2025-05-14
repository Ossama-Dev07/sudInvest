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
import { Eye, Edit, MoreVertical, Trash2, ArrowUpDown } from "lucide-react";
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
    accessorKey: "client_nom",
    header: "Nom",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("client_nom") ? (
          row.getValue("client_nom")
        ) : (
          <div className="px-2">_____</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "client_prenom",
    header: "Prénom",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("client_prenom") ? (
          row.getValue("client_prenom")
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
    header: () => <div className="">Montant</div>,
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
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const historique = row.original;

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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-yellow-500 hover:text-yellow-700 px-4"
                        onClick={() => handleupdate(historique)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <UpdatHistorique data={historiquedata} />
                  </Dialog>
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-yellow-500 hover:text-yellow-700 "
                    onClick={() => handleupdate(historique)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <UpdatHistorique data={historiquedata} />
              </Dialog>

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
                      Cette action ne peut pas être annulée. L'utilisateur sera
                      déplacé dans les archives et ne sera plus actif.
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
            </div>
          )}
        </div>
      );
    },
  },
];
