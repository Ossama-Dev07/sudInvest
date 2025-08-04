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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  Download,
  Upload,
  Plus,
  Search,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import useClientStore from "@/store/useClientStore";
import { toast } from "react-toastify";

export default function ToolBar({ table }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("email");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Get import function from store
  const { importClients, isLoading } = useClientStore();

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

    if (format === "csv") {
      // Get all possible headers from the data, not just visible columns
      const allHeaders = new Set();
      allData.forEach((row) => {
        Object.keys(row).forEach((key) => allHeaders.add(key));
      });

      // Define preferred column order
      const preferredOrder = [
        "id_client",
        "nom_client",
        "prenom_client",
        "raisonSociale",
        "email",
        "email_2",
        "telephone",
        "telephone2",
        "adresse",
        "CIN_client",
        "rc",
        "ice",
        "taxe_profes",
        "activite",
        "statut_client",
        "type",
        "id_fiscal",
        "datecreation",
        "date_collaboration",
        "id_utilisateur",
        "created_at",
        "updated_at",
      ];

      // Order headers: preferred order first, then any remaining columns
      const headers = preferredOrder
        .filter((header) => allHeaders.has(header))
        .concat(
          Array.from(allHeaders).filter(
            (header) => !preferredOrder.includes(header)
          )
        );

      // Define column labels for CSV headers
      const columnLabels = {
        id_client: "ID Client",
        id_fiscal: "ID Fiscal",
        nom_client: "Nom",
        prenom_client: "Prénom",
        raisonSociale: "Raison Sociale",
        CIN_client: "CIN",
        rc: "RC",
        telephone: "Téléphone",
        telephone2: "Téléphone 2",
        type: "Type",
        email: "Email",
        email_2: "Email Secondaire",
        adresse: "Adresse",
        datecreation: "Date de Création",
        date_collaboration: "Date de Collaboration",
        ice: "ICE",
        taxe_profes: "Taxe Professionnelle",
        activite: "Activité",
        statut_client: "Statut Client",
        id_utilisateur: "ID Utilisateur",
        created_at: "Créé le",
        updated_at: "Mis à jour le",
      };

      // Convert headers to readable labels
      const readableHeaders = headers.map(
        (header) => columnLabels[header] || header
      );

      // Create CSV content with all columns
      const csvContent = [
        readableHeaders.join(","),
        ...allData.map((row) =>
          headers
            .map((key) => {
              const value = row[key] ?? "";
              // Properly escape values that contain commas, quotes, or newlines
              const stringValue = String(value);
              if (
                stringValue.includes(",") ||
                stringValue.includes('"') ||
                stringValue.includes("\n")
              ) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            })
            .join(",")
        ),
      ].join("\n");

      // Add UTF-8 BOM (Byte Order Mark) to ensure proper encoding
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "clients.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the URL object
    }

    console.log(`Exported in ${format} format`);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type - only accept Excel files
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
      event.target.value = "";
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 10MB");
      event.target.value = "";
      return;
    }

    // Store the file and show confirmation dialog
    setSelectedFile(file);
    setShowImportDialog(true);

    // Reset file input
    event.target.value = "";
  };

  const convertExcelToCSV = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];

          // Convert to CSV
          const csvContent = XLSX.utils.sheet_to_csv(worksheet);

          // Create a CSV blob
          const csvBlob = new Blob([csvContent], { type: "text/csv" });

          // Create a File object from the blob
          const csvFile = new File(
            [csvBlob],
            file.name.replace(/\.(xlsx|xls)$/, ".csv"),
            {
              type: "text/csv",
              lastModified: Date.now(),
            }
          );

          resolve(csvFile);
        } catch (error) {
          reject(
            new Error(
              "Erreur lors de la conversion Excel vers CSV: " + error.message
            )
          );
        }
      };

      reader.onerror = () => {
        reject(new Error("Erreur lors de la lecture du fichier Excel"));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const handleImportConfirm = async () => {
    if (!selectedFile) return;

    try {
      // Show loading state
      toast.info("Conversion du fichier Excel en cours...");

      // Convert Excel to CSV
      const csvFile = await convertExcelToCSV(selectedFile);

      // Send CSV to backend
      await importClients(csvFile);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error.message || "Erreur lors de l'importation");
    } finally {
      setShowImportDialog(false);
      setSelectedFile(null);
    }
  };

  const handleImportCancel = () => {
    setShowImportDialog(false);
    setSelectedFile(null);
  };

  return (
    <>
      <div className=" space-y-4 py-4">
        {/* Header */}
        <div className="p-4  flex items-center md:items-end justify-between flex-col sm:flex-row gap-2  ">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 pb-2 dark:text-gray-200">
              Gestion des Clients
            </h2>
            <p className="text-gray-500  mt-1 ">
              Gérez et suivez tous vos clients en un seul endroit
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
            onClick={() => navigate("/clients/ajouter")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter Client
          </Button>
        </div>

        {/* Toolbar Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-2 gap-3">
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
                <DropdownMenuItem
                  onClick={() => setSearchField("prenom_client")}
                >
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
                <Button variant="outline" size="sm" className=" sm:flex ">
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
                accept=".xlsx,.xls"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="sm:flex"
                onClick={triggerFileInput}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent mr-2"></div>
                    Importation...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importer Excel
                  </>
                )}
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
          </div>
        </div>
      </div>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Confirmer l'importation Excel
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedFile && (
                <div className="space-y-2">
                  <p>
                    Vous êtes sur le point d'importer le fichier Excel:{" "}
                    <span className="font-medium">{selectedFile.name}</span>
                  </p>
                  <p>
                    Taille: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p>Type: Excel (.xlsx/.xls)</p>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Colonnes supportées:</strong> Nom & prénom, Raison
                      sociale, Type, RC, IF, ICE, TP, Adresse, Activité, Date de
                      création, Téléphone, E-mail
                    </p>

                    <p className="text-sm text-green-600 mt-2">
                      <strong>📋 Processus:</strong> Le fichier Excel sera
                      converti en CSV automatiquement avant importation.
                    </p>
                  </div>
                </div>
              )}
              <p className="mt-3 text-sm">
                Voulez-vous continuer avec l'importation ?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleImportCancel}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleImportConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              Convertir et Importer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
