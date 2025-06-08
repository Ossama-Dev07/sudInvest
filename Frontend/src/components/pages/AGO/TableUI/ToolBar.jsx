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
import { ChevronDown, PlusCircle, Search, Filter, Building2 } from "lucide-react";
import useClientStore from "@/store/useClientStore";
import { useNavigate } from "react-router-dom";

export default function ToolBar({ table }) {
  const [decisionTypeFilter, setDecisionTypeFilter] = useState("all");
  const navigate = useNavigate();

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
        <Button className="gap-2" onClick={() => navigate("/Assemblee_Generale_ordinaire/ajouter")}>
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

              {table.getColumn("client_nom") && (
                <div className="px-2 py-1.5">
                  <Label
                    htmlFor="nom-filter"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Nom du client
                  </Label>
                  <Input
                    id="nom-filter"
                    placeholder="Filtrer par nom..."
                    value={
                      table.getColumn("client_nom")?.getFilterValue() ?? ""
                    }
                    onChange={(event) =>
                      table
                        .getColumn("client_nom")
                        ?.setFilterValue(event.target.value)
                    }
                    className="w-full h-8"
                  />
                </div>
              )}

              {table.getColumn("raisonSociale") && (
                <div className="px-2 py-1.5">
                  <Label
                    htmlFor="societe-filter"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Raison sociale
                  </Label>
                  <Input
                    id="societe-filter"
                    placeholder="Filtrer par société..."
                    value={
                      table.getColumn("raisonSociale")?.getFilterValue() ?? ""
                    }
                    onChange={(event) =>
                      table
                        .getColumn("raisonSociale")
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
                      <SelectItem value="RAN">Report à Nouveau (RAN)</SelectItem>
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
                  onClick={() => {
                    if (table.getColumn("client_nom"))
                      table.getColumn("client_nom").setFilterValue("");
                    if (table.getColumn("raisonSociale"))
                      table.getColumn("raisonSociale").setFilterValue("");
                    if (table.getColumn("decision_type"))
                      table.getColumn("decision_type").setFilterValue("");
                    setDecisionTypeFilter("all");
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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