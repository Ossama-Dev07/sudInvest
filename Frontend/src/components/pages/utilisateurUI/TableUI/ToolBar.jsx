import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, UserPlus, Filter } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ToolBar({ table }) {
  const navigate = useNavigate();
  const exportToCSV = () => {
    // Get visible columns
    const visibleColumns = table
      .getAllColumns()
      .filter((column) => column.getIsVisible());

    // Get headers
    const headers = visibleColumns.map((column) => column.id);

    // Get data from rows

    const data = table.getFilteredRowModel().rows.map((row) => {
      return visibleColumns.map((column) => row.getValue(column.id));
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.join(",")),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "utilisateurs.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-lg p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-300 ">
            La liste des utilisateurs
          </h2>
          <p className="text-gray-600 mt-1">
            Gestion des comptes utilisateurs et des permissions d'accès
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 "
            onClick={() => navigate("/utilisateur/ajouter")}
          >
            <UserPlus className="h-4 w-4" />
            Ajouter Utilisateur
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
        <div className="flex flex-1">
          <Input
            placeholder="Filtrer par email..."
            value={table.getColumn("email_utilisateur")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table
                .getColumn("email_utilisateur")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-[#e08907db] hover:bg-[#e08907] flex items-center gap-2 dark:text-white"
            onClick={exportToCSV}
          >
            <Download className="h-4 w-4 " />
            Télécharger CSV
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Colonnes
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Afficher/Masquer</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id.replace("_", " ")}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
