import React from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Edit, Eye, MoreVertical, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Veiw from './Veiw';
import useUtilisateurStore from '@/store/useUtilisateurStore';
import { useNavigate } from 'react-router-dom';
export default function MobileActions({utilisateur}) {
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
                  onClick={() => console.log("View utilisateur", utilisateur)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom">
                <Veiw utilisateur={utilisateur}/>
              </SheetContent>
            </Sheet>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-yellow-500 hover:text-yellow-700 px-4"
              onClick={() =>
                navigate(`/utilisateur/modifier/${id_utilisateur}`)
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 text-red-600 hover:text-red-800"
              onClick={() => deactivateUtilisateur(utilisateur.id_utilisateur)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
