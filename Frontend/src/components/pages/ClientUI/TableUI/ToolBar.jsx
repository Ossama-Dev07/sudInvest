import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  FileText,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EnhancedToolbar({ table }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate=useNavigate();
  
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    // Appliquer la recherche sur toutes les colonnes filtrables
    table.getAllColumns().forEach(column => {
      if (column.getCanFilter()) {
        column.setFilterValue(value);
      }
    });
  };
  
  const clearSearch = () => {
    setSearchTerm("");
    table.getAllColumns().forEach(column => {
      if (column.getCanFilter()) {
        column.setFilterValue("");
      }
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    table.resetColumnFilters();
  };

  const handleExport = (format) => {
    // Logique d'exportation selon le format choisi
    console.log(`Exporter au format ${format}`);
    // Implémenter la logique d'exportation réelle ici
  };
  
  return (
    <div className="bg-white rounded-md border border-gray-200">
      {/* Titre et sous-titre */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Clients</h2>
        <p className="text-sm text-gray-500 mt-1">Gérez et suivez tous vos clients en un seul endroit</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-3">
        {/* Section Recherche & Filtres */}
        <div className="flex items-center w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des clients..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 pr-8 py-2 w-full"
            />
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="absolute right-2 top-2.5"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-gray-100" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem>
                Grouper par
              </DropdownMenuItem>
              <DropdownMenuItem>
                Trier par
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Enregistrer la vue
              </DropdownMenuItem>
              <DropdownMenuItem>
                Charger une vue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Section Actions */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="mr-2 h-4 w-4" />
                Exporter
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileText className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex"
            onClick={() => console.log("Importer des clients")}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex">
                Colonnes
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  // Mapping pour les noms de colonnes en français
                  const columnLabels = {
                    id_client: "ID Client",
                    id_fiscal: "ID Fiscal",
                    nom_client: "Nom",
                    prenom_client: "Prénom",
                    raisonSociale: "Raison Sociale",
                    CIN_client: "CIN",
                    rc: "RC",
                    telephone: "Téléphone",
                    type: "Type",
                    email: "Email",
                    adresse: "Adresse",
                    datecreation: "Date de création",
                    date_collaboration: "Date de collaboration",
                    ice: "ICE",
                    taxe_profes: "Taxe professionnelle",
                    activite: "Activité",
                    statut_client: "Statut",
                    id_utilisateur: "ID Utilisateur",
                    created_at: "Créé le",
                    updated_at: "Mis à jour le"
                  };
                  
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {columnLabels[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={()=>navigate("/clients/ajouter")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter Client
          </Button>
        </div>
      </div>
      
      {/* Section Filtres étendue */}
      {showFilters && (
        <div className="px-4 pb-4 border-t border-gray-200 pt-3">
          <div className="flex flex-wrap gap-3">
            {/* Filtre de statut */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 text-gray-700">Statut</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-40">
                    Tous les statuts
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuCheckboxItem checked>
                    Actif
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked>
                    Inactif
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked>
                    En attente
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Filtre de date */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 text-gray-700">Période</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-40">
                    Toutes les périodes
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Aujourd'hui</DropdownMenuItem>
                  <DropdownMenuItem>7 derniers jours</DropdownMenuItem>
                  <DropdownMenuItem>30 derniers jours</DropdownMenuItem>
                  <DropdownMenuItem>Ce mois-ci</DropdownMenuItem>
                  <DropdownMenuItem>Mois dernier</DropdownMenuItem>
                  <DropdownMenuItem>Période personnalisée</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Filtre de type */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 text-gray-700">Type</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-40">
                    Tous les types
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuCheckboxItem checked>
                    Entreprise
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked>
                    Particulier
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked>
                    Professionnel
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-end ml-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-2"
                onClick={clearAllFilters}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Effacer filtres
              </Button>
              <Button 
                size="sm"
                onClick={() => console.log("Appliquer les filtres")}
              >
                Appliquer filtres
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}