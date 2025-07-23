import { useEffect, useState, useMemo } from "react";
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
import {
  ChevronDown,
  PlusCircle,
  Search,
  Filter,
  Building2,
  Calendar,
  TrendingUp,
} from "lucide-react";
import useClientStore from "@/store/useClientStore";
import { useNavigate } from "react-router-dom";

export default function ToolBar({ table, data }) {
  const [decisionTypeFilter, setDecisionTypeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [progressionFilter, setProgressionFilter] = useState("all");
  const navigate = useNavigate();

  // Get current year
  const currentYear = new Date().getFullYear();

  // Extract unique years from data and sort them in descending order
  const availableYears = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const years = data
      .map((item) => item.annee)
      .filter((year) => year && !isNaN(year))
      .map((year) => parseInt(year))
      .filter((year, index, arr) => arr.indexOf(year) === index) // Remove duplicates
      .sort((a, b) => b - a); // Sort descending (newest first)

    return years;
  }, [data]);

  // Set default year filter to current year on component mount
  useEffect(() => {
    if (availableYears.length > 0) {
      const currentYearExists = availableYears.includes(currentYear);
      if (currentYearExists) {
        setYearFilter(currentYear.toString());
        const anneeColumn = table.getColumn("annee");
        if (anneeColumn) {
          anneeColumn.setFilterValue(currentYear.toString());
        }
      } else {
        // If current year doesn't exist, show all years by default
        setYearFilter("all");
      }
    }
  }, [availableYears, currentYear, table]);

  // Apply custom progression filter when progressionFilter changes
  useEffect(() => {
    const column = table.getColumn("etapes");
    if (column) {
      if (progressionFilter === "all") {
        column.setFilterValue(undefined);
      } else {
        column.setFilterValue(progressionFilter);
      }
    }
  }, [progressionFilter, table]);

  // Register custom filter function for progression
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

  const handleResetAllFilters = () => {
    // Reset client display filter
    if (table.getColumn("client_display")) {
      table.getColumn("client_display").setFilterValue("");
    }
    // Reset decision type filter
    if (table.getColumn("decision_type")) {
      table.getColumn("decision_type").setFilterValue("");
    }
    setDecisionTypeFilter("all");
    
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
            Gestion des Assemblées Générales Ordinaires
          </h2>
          <p className="text-muted-foreground mt-2">
            Recherchez, filtrez et gérez vos Assemblées Générales Ordinaires
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => navigate("/Assemblee_Generale_ordinaire/ajouter")}
        >
          <PlusCircle className="h-4 w-4" /> Ajouter AGO
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 py-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                Recherche Avancée <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {table.getColumn("client_display") && (
                <div className="px-2 py-1.5">
                  <Input
                    id="nom-filter"
                    placeholder="Nom et prénom ou raison sociale..."
                    value={
                      table.getColumn("client_display")?.getFilterValue() ?? ""
                    }
                    onChange={(event) =>
                      table
                        .getColumn("client_display")
                        ?.setFilterValue(event.target.value)
                    }
                    className="w-full h-8"
                  />
                </div>
              )}

              {table.getColumn("decision_type") && (
                <div className="px-2 py-1.5">
                  <Label className="text-sm font-medium mb-1.5 block">
                    Type de décision
                  </Label>
                  <Select
                    value={decisionTypeFilter}
                    onValueChange={(value) => {
                      setDecisionTypeFilter(value);
                      table
                        .getColumn("decision_type")
                        ?.setFilterValue(value === "all" ? "" : value);
                    }}
                  >
                    <SelectTrigger className="w-full h-8">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="RAN">
                        Report à Nouveau (RAN)
                      </SelectItem>
                      <SelectItem value="DISTRIBUTION">Distribution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="px-2 py-2 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetAllFilters}
                >
                  Réinitialiser tout
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Separate Year Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Année:
          </Label>
          <Select
            value={yearFilter}
            onValueChange={(value) => {
              setYearFilter(value);
              const anneeColumn = table.getColumn("annee");
              if (anneeColumn) {
                anneeColumn.setFilterValue(value === "all" ? "" : value);
              }
            }}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  Toutes
                </div>
              </SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{year}</span>
                    {year === currentYear && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        Actuel
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Progression Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Progression:
          </Label>
          <Select value={progressionFilter} onValueChange={setProgressionFilter}>
            <SelectTrigger className="w-48 h-9">
              <SelectValue placeholder="Toutes les progressions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-gray-500" />
                  Toutes
                </div>
              </SelectItem>
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