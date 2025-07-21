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
  Users,
  FileText,
  TrendingUp
} from "lucide-react";
import useHistoriqueFiscalStore from "@/store/HistoriqueFiscalStore";
import { useNavigate } from "react-router-dom";

export default function ToolBar({ table, data }) {
  const [clientTypeFilter, setClientTypeFilter] = useState("all");
  const [statutFilter, setStatutFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const navigate = useNavigate();

  // Get current year
  const currentYear = new Date().getFullYear();

  // Extract unique years from data and sort them in descending order
  const availableYears = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    const years = data
      .map(item => item.annee_fiscal)
      .filter(year => year && !isNaN(year))
      .map(year => parseInt(year))
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
        const anneeColumn = table.getColumn("annee_fiscal");
        if (anneeColumn) {
          anneeColumn.setFilterValue(currentYear.toString());
        }
      } else {
        // If current year doesn't exist, show all years by default
        setYearFilter("all");
      }
    }
  }, [availableYears, currentYear, table]);

  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestion des Historiques Fiscaux
          </h2>
          <p className="text-muted-foreground mt-2">
            Recherchez, filtrez et gérez vos historiques fiscaux avec versements et déclarations
          </p>
        </div>
        <Button 
          className="gap-2" 
          onClick={() => navigate("/historique_fiscal/ajouter")}
        >
          <PlusCircle className="h-4 w-4" /> Ajouter Historique Fiscal
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
                  <Label
                    htmlFor="client-filter"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Nom du client
                  </Label>
                  <Input
                    id="client-filter"
                    placeholder="Filtrer par nom du client..."
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

              {table.getColumn("client_type") && (
                <div className="px-2 py-1.5">
                  <Label className="text-sm font-medium mb-1.5 block">
                    Type de client
                  </Label>
                  <Select
                    value={clientTypeFilter}
                    onValueChange={(value) => {
                      setClientTypeFilter(value);
                      table
                        .getColumn("client_type")
                        ?.setFilterValue(value === "all" ? "" : value);
                    }}
                  >
                    <SelectTrigger className="w-full h-8">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          Tous les types
                        </div>
                      </SelectItem>
                      <SelectItem value="PM">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3" />
                          Personne Morale (PM)
                        </div>
                      </SelectItem>
                      <SelectItem value="PP">
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          Personne Physique (PP)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {table.getColumn("statut_global") && (
                <div className="px-2 py-1.5">
                  <Label className="text-sm font-medium mb-1.5 block">
                    Statut global
                  </Label>
                  <Select
                    value={statutFilter}
                    onValueChange={(value) => {
                      setStatutFilter(value);
                      table
                        .getColumn("statut_global")
                        ?.setFilterValue(value === "all" ? "" : value);
                    }}
                  >
                    <SelectTrigger className="w-full h-8">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3 h-3" />
                          Tous les statuts
                        </div>
                      </SelectItem>
                      <SelectItem value="EN_COURS">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          En Cours
                        </div>
                      </SelectItem>
                      <SelectItem value="COMPLETE">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Terminé
                        </div>
                      </SelectItem>
                      <SelectItem value="EN_RETARD">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          En Retard
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="px-2 py-2 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (table.getColumn("client_display"))
                      table.getColumn("client_display").setFilterValue("");
                    if (table.getColumn("client_type"))
                      table.getColumn("client_type").setFilterValue("");
                    if (table.getColumn("statut_global"))
                      table.getColumn("statut_global").setFilterValue("");
                    setClientTypeFilter("all");
                    setStatutFilter("all");
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Separate Year Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Année fiscale:
          </Label>
          <Select
            value={yearFilter}
            onValueChange={(value) => {
              setYearFilter(value);
              const anneeColumn = table.getColumn("annee_fiscal");
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

        {/* Progress Filter */}
      

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
                  {column.id === "client_display" && "Client"}
                  {column.id === "client_type" && "Type Client"}
                  {column.id === "annee_fiscal" && "Année Fiscale"}
                  {column.id === "progress_percentage" && "Progression"}
                  {column.id === "statut_global" && "Statut"}
                  {column.id === "datecreation" && "Date Création"}
                  {!["client_display", "client_type", "annee_fiscal", "progress_percentage", "statut_global", "datecreation"].includes(column.id) && column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}