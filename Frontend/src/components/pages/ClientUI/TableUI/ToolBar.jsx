import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Download,
  Upload,
  Plus,
  Search,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";

export default function ToolBar({ table }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("email"); // default
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    table.getAllColumns().forEach((column) => {
      if (column.id === searchField && column.getCanFilter()) {
        column.setFilterValue(value);
      } else {
        column.setFilterValue(undefined);
      }
    });
  };

  const handleExport = (format) => {
    const allData = table.getCoreRowModel().rows.map((row) => row.original);
    const headers = Object.keys(allData[0] || {});

    if (format === "csv") {
      const csvContent = [
        headers.join(","),
        ...allData.map((row) =>
          headers.map((key) => JSON.stringify(row[key] ?? "")).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "clients.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    console.log(`Exported in ${format} format`);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedClients = results.data;
        console.log("Imported Clients:", importedClients);
        // ➕ You can now POST this to your backend or update local state
      },
      error: (error) => {
        console.error("CSV Parsing Error:", error);
      },
    });

    event.target.value = ""; // allow re-selection of same file
  };

  return (
    <div className=" rounded-md">
      {/* Header */}
      <div className="p-4 ">
        <h2 className="text-3xl font-bold text-gray-800 pb-2 dark:text-gray-200">
          Gestion des Clients
        </h2>
        <p className="text-gray-500  mt-1 ">
          Gérez et suivez tous vos clients en un seul endroit
        </p>
      </div>

      {/* Toolbar Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-3">
        {/* Search */}
        <div className="flex items-center w-full sm:w-auto gap-2">
        <div className="relative w-full sm:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Rechercher par ${
                searchField === "email"
                  ? "Email"
                  : searchField === "nom_client"
                  ? "Nom"
                  : "Prénom"
              }`}
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 pr-8 py-2 w-full"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {searchField === "email"
                  ? "Email"
                  : searchField === "nom_client"
                  ? "Nom"
                  : "Prénom"}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setSearchField("email")}>
                Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchField("nom_client")}>
                Nom
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchField("prenom_client")}>
                Prénom
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

         
        </div>

        {/* Buttons: Export, Import, Columns, Add */}
        <div className="flex items-center gap-2">
          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className=" sm:flex">
                <Download className="mr-2 h-4 w-4" />
                Exporter
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <FileText className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Import */}
          <>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="sm:flex"
              onClick={triggerFileInput}
            >
              <Upload className="mr-2 h-4 w-4" />
              Importer
            </Button>
          </>

          {/* Column Toggle */}
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
                    updated_at: "Mis à jour le",
                  };

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnLabels[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Client */}
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/clients/ajouter")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter Client
          </Button>
        </div>
      </div>
    </div>
  );
}
