import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, Eye, MoreVertical, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Veiw from "./Veiw";
import useUtilisateurStore from "@/store/useUtilisateurStore";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
export default function MobileActions({ utilisateur }) {
  const { deactivateUtilisateur } = useUtilisateurStore();
  const navigate = useNavigate();
  const { id_utilisateur } = utilisateur;

  return (
    <div>
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
              <SheetContent side="bottom">
                <Veiw utilisateur={utilisateur} />
              </SheetContent>
            </Sheet>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-yellow-500 hover:text-yellow-700 px-4"
              onClick={() =>
                navigate(`/utilisateurs/modifier/${id_utilisateur}`)
              }
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
                    Cette action ne peut pas être annulée. L'utilisateur ne sera
                    pas supprimé définitivement, mais sera déplacé dans les
                    archives et ne sera plus actif.
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
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
