import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, PlusCircle, Search, Filter, TrendingUp } from "lucide-react";
import useClientStore from "@/store/useClientStore";
import AjouterHistorique from "../Actions/AjouterHistorique";
import { useNavigate } from "react-router-dom";

export default function ToolBar({ table }) {
  const [caseStatus, setCaseStatus] = useState("all");
  const [progressionFilter, setProgressionFilter] = useState("all");
  const navigate = useNavigate();

  // Custom progression filter function
  const applyProgressionFilter = (rows, columnId, filterValue) => {
    if (filterValue === "all") return rows;

    return rows.filter((row) => {
      const etapes = row.getValue("etapes") || [];
      const totalSteps = etapes.length;
      const completedSteps = etapes.filter((etape) => etape.statut === "oui").length;
      const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      switch (filterValue) {
        case "not_started":
          return percentage === 0;
        case "started":
          return percentage > 0 && percentage < 50;
        case "in_progress":
          return percentage >= 50 && percentage < 75;
        case "almost_done":
          return percentage >= 75 && percentage < 100;
        case "completed":
          return percentage === 100;
        default:
          return true;
      }
    });
  };

  // Apply custom filter when progressionFilter changes
  useEffect(() => {
    const column = table.getColumn("etapes");
    if (column) {
      if (progressionFilter === "all") {
        column.setFilterValue(undefined);
      } else {
        // Set a custom filter function
        column.setFilterValue(progressionFilter);
      }
    }
  }, [progressionFilter, table]);

  // Register custom filter function
  useEffect(() => {
    const column = table.getColumn("etapes");
    if (column) {
      // Override the column's filter function
      column.columnDef.filterFn = (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;

        const etapes = row.getValue("etapes") || [];
        const totalSteps = etapes.length;
        const completedSteps = etapes.filter((etape) => etape.statut === "oui").length;
        const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        switch (filterValue) {
          case "not_started":
            return percentage === 0;
          case "started":
            return percentage > 0 && percentage < 50;
          case "in_progress":
            return percentage >= 50 && percentage < 75;
          case "almost_done":
            return percentage >= 75 && percentage < 100;
          case "completed":
            return percentage === 100;
          default:
            return true;
        }
      };
    }
  }, [table]);

  const handleResetFilters = () => {
    // Reset client display filter
    if (table.getColumn("client_display")) {
      table.getColumn("client_display").setFilterValue("");
    }
    // Reset progression filter
    setProgressionFilter("all");
    if (table.getColumn("etapes")) {
      table.getColumn("etapes").setFilterValue(undefined);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestion des Dossiers Juridiques
          </h2>
          <p className="text-muted-foreground mt-2">
            Recherchez, filtrez et gérez vos dossiers clients et leur historique
            juridique
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/historique_juridique/ajouter")}>
          <PlusCircle className="h-4 w-4" /> Ajouter Historique
        </Button>
      </div>
     
      <div className="flex flex-wrap items-center gap-3 py-4">
        {/* Direct filter input */}
        <div className="flex items-center gap-2">
          {table.getColumn("client_display") && (
            <Input
              placeholder="Nom et prénom ou raison sociale..."
              value={
                table.getColumn("client_display")?.getFilterValue() ?? ""
              }
              onChange={(event) =>
                table
                  .getColumn("client_display")
                  ?.setFilterValue(event.target.value)
              }
              className="w-64"
            />
          )}
        </div>

        {/* Progression Filter */}
        <div className="flex items-center gap-2">
          <Select value={progressionFilter} onValueChange={setProgressionFilter}>
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <SelectValue placeholder="Filtrer par progression" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les progressions</SelectItem>
              <SelectItem value="not_started">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  Non démarré (0%)
                </div>
              </SelectItem>
              <SelectItem value="started">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  Démarré (1-49%)
                </div>
              </SelectItem>
              <SelectItem value="in_progress">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  En cours (50-74%)
                </div>
              </SelectItem>
              <SelectItem value="almost_done">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Presque fini (75-99%)
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Terminé (100%)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetFilters}
        >
          Réinitialiser filtres
        </Button>
       
        {/* Column visibility dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colonnes <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}