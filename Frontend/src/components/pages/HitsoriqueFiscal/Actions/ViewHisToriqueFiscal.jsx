import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Calendar,
  TrendingUp,
  FileText,
  Eye,
  X,
  Building2,
  Users,
  Home,
  Loader2,
  ArrowLeft,
  Edit,
  Settings,
  Plus,
  DollarSign,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import useHistoriqueFiscalStore from "@/store/HistoriqueFiscalStore";
import UpdateSpecificTaxType from "./UpdateSpecificTaxType";
import ViewSpecificTaxTypeDetails from "./ViewSpecificTaxTypeDetails";
import AddNewPaiement from "./AddNewPaiement";
import AddNewDeclaration from "./AddNewDeclaration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ViewHisToriqueFiscal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for the detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTaxCode, setDetailTaxCode] = useState("");
  const [detailIsDeclaration, setDetailIsDeclaration] = useState(false);

  // State for the edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTaxCode, setEditTaxCode] = useState("");
  const [editIsDeclaration, setEditIsDeclaration] = useState(false);

  // State for add new modals
  const [showAddPaiementModal, setShowAddPaiementModal] = useState(false);
  const [showAddDeclarationModal, setShowAddDeclarationModal] = useState(false);

  // Store hooks
  const { currentHistorique, loading, error, fetchHistoriqueById } =
    useHistoriqueFiscalStore();

  // Fetch specific historique on component mount
  useEffect(() => {
    if (id) {
      fetchHistoriqueById(id);
    }
  }, [id, fetchHistoriqueById]);

  // Updated definitions without categories
  const versementDefinitions = {
    TVA: { name: "TVA", periods: ["MENSUEL", "TRIMESTRIEL", "ANNUEL"], description: "Taxe sur la Valeur Ajoutée", icon: "💰", mandatory: true },
    IS: { name: "Impôt sur les Sociétés (IS)", periods: ["TRIMESTRIEL"], description: "4 acomptes trimestriels", icon: "🏢", mandatory: true },
    CM: { name: "Cotisation Minimale", periods: ["ANNUEL"], description: "Alternative à l'IS", icon: "📊" },
    DT: { name: "Droits de Timbre", periods: ["MENSUEL"], description: "Droits de timbre mensuels", icon: "📋" },
    IR_SALAIRES: { name: "IR sur Salaires", periods: ["MENSUEL"], description: "Retenue à la source mensuelle", icon: "👥", mandatory: true },
    IR_PROF: { name: "IR Professionnel", periods: ["ANNUEL"], description: "Pour les personnes physiques", icon: "👤", ppOnly: true },
    IR_RAS_LOYER: { name: "IR-RAS/Loyer", periods: ["MENSUEL"], description: "Retenue à la source sur loyers", icon: "🏠" },
    IS_RAS_HONORAIRES: { name: "IS-RAS/Honoraires", periods: ["MENSUEL", "TRIMESTRIEL"], description: "Retenue à la source sur honoraires (PM)", icon: "💼", pmOnly: true },
    IR_RAS_HONORAIRES: { name: "IR-RAS/Honoraires", periods: ["MENSUEL", "TRIMESTRIEL"], description: "Retenue à la source sur honoraires (PP)", icon: "💼", ppOnly: true },
    CPU: { name: "CPU", periods: ["MENSUEL"], description: "Contribution Professionnelle Unique", icon: "⚡" },
    CSS: { name: "CSS", periods: ["MENSUEL"], description: "Contribution Sociale de Solidarité", icon: "🤝" },
    TDB: { name: "Taxe sur Débits de Boissons", periods: ["TRIMESTRIEL"], description: "Pour les débits de boissons", icon: "🍺", optional: true },
    TS: { name: "Taxe de Séjour", periods: ["TRIMESTRIEL"], description: "Taxe trimestrielle de séjour", icon: "🏨" },
    TPT: { name: "Taxe de Promotion Touristique", periods: ["TRIMESTRIEL"], description: "Taxe trimestrielle de promotion touristique", icon: "🏝️", optional: true },
    TH: { name: "Taxe d'Habitation", periods: ["ANNUEL"], description: "Taxe annuelle d'habitation", icon: "🏠" },
    T_PROF: { name: "Taxe Professionnelle (Patente)", periods: ["ANNUEL"], description: "Patente annuelle", icon: "🏪" }
  };

  const declarationDefinitions = {
    ETAT_9421: {
      name: "État 9421",
      pmOnly: true,
      mandatory: true,
      description: "Obligatoire pour PM",
      icon: "📊",
    },
    ETAT_9000: {
      name: "État 9000",
      ppOnly: true,
      mandatory: true,
      description: "Obligatoire pour PP",
      icon: "👤",
    },
    ETAT_SYNTHESE: {
      name: "État de Synthèse",
      mandatory: true,
      description: "État financier annuel",
      icon: "📈",
    },
    DECL_TP: {
      name: "Déclaration TP Optionnelle",
      optional: true,
      description: "Déclaration optionnelle",
      icon: "📝",
    },
  };

  // Function to get display status from database status
  const getDisplayStatus = (dbStatus) => {
    switch (dbStatus) {
      case "PAYE":
        return "Payé";
      case "NON_PAYE":
        return "Non payé";
      case "EN_RETARD":
        return "En retard";
      case "PARTIEL":
        return "Partiel";
      default:
        return dbStatus || "Inconnu";
    }
  };

  // Function to get display status for declarations
  const getDeclarationDisplayStatus = (dbStatus) => {
    switch (dbStatus) {
      case "DEPOSEE":
        return "Déposée";
      case "NON_DEPOSEE":
        return "Non déposée";
      case "EN_RETARD":
        return "En retard";
      default:
        return dbStatus || "Inconnu";
    }
  };

  // Function to open detail modal
  const openDetailModal = (code, isDeclaration = false) => {
    setDetailTaxCode(code);
    setDetailIsDeclaration(isDeclaration);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailTaxCode("");
    setDetailIsDeclaration(false);
  };

  // Function to open edit modal
  const openEditModal = (code, isDeclaration = false) => {
    setEditTaxCode(code);
    setEditIsDeclaration(isDeclaration);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditTaxCode("");
    setEditIsDeclaration(false);
  };

  // Handle adding new type selection
  const handleSelectNewType = (typeCode, isDeclaration) => {
    // Close add modals
    setShowAddPaiementModal(false);
    setShowAddDeclarationModal(false);
    
    // Open edit modal for the selected type
    openEditModal(typeCode, isDeclaration);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement des détails...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">Erreur de chargement</div>
          <div className="text-gray-600">{error}</div>
          <Button
            onClick={() => navigate("/historique_fiscal")}
            className="mt-4"
          >
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  if (!currentHistorique) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-2">Historique fiscal non trouvé</div>
          <Button
            onClick={() => navigate("/historique_fiscal")}
            className="mt-4"
          >
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  // Transform historique data to grouped structure for table
  const transformHistoriqueToTableData = () => {
    const tableData = [];
    const versementGroups = {};

    // Group paiements by type
    if (currentHistorique.paiements && currentHistorique.paiements.length > 0) {
      currentHistorique.paiements.forEach((paiement) => {
        const typeKey =
          Object.keys(versementDefinitions).find(
            (key) =>
              versementDefinitions[key].name === paiement.type_impot ||
              key === paiement.type_impot
          ) || paiement.type_impot;

        if (!versementGroups[typeKey]) {
          versementGroups[typeKey] = {
            code: typeKey,
            type: paiement.type_impot,
            definition: versementDefinitions[typeKey],
            items: [],
            totalAmount: 0,
            allPaid: true,
            hasPartial: false,
            hasOverdue: false,
            latestDate: null,
            category: "versement",
          };
        }

        const amount = parseFloat(
          paiement.montant_paye || paiement.montant_du || 0
        );
        const isPaid = paiement.statut === "PAYE";
        const isPartial = paiement.statut === "PARTIEL";
        const isOverdue = paiement.statut === "EN_RETARD";
        const date =
          paiement.date_echeance ||
          paiement.date_paiement ||
          paiement.created_at;

        const displayStatus = getDisplayStatus(paiement.statut);

        versementGroups[typeKey].items.push({
          id: paiement.id,
          periode_numero: paiement.periode_numero,
          amount: amount,
          status: displayStatus,
          dbStatus: paiement.statut,
          date: date,
          periode: paiement.periode,
          commentaire: paiement.commentaire,
        });

        versementGroups[typeKey].totalAmount += amount;
        if (!isPaid) versementGroups[typeKey].allPaid = false;
        if (isPartial) versementGroups[typeKey].hasPartial = true;
        if (isOverdue) versementGroups[typeKey].hasOverdue = true;

        if (
          !versementGroups[typeKey].latestDate ||
          new Date(date) > new Date(versementGroups[typeKey].latestDate)
        ) {
          versementGroups[typeKey].latestDate = date;
        }
      });
    }

    // Convert grouped versements to table format
    Object.values(versementGroups).forEach((group) => {
      const definition = group.definition;
      let overallStatus = "Non payé";

      if (group.allPaid) {
        overallStatus = "Payé";
      } else if (group.hasOverdue) {
        overallStatus = "En retard";
      } else if (group.hasPartial) {
        overallStatus = "Partiel";
      } else {
        overallStatus = "Non payé";
      }

      // Determine the actual period being used for this group
      const actualPeriod =
        group.items.length > 0
          ? group.items[0].periode
          : definition?.periods?.[0] || "N/A";

      tableData.push({
        id: `versement_group_${group.code}`,
        date: group.latestDate,
        type: group.type,
        code: group.code,
        period: actualPeriod,
        amount: group.totalAmount,
        status: overallStatus,
        description: definition?.description || group.type,
        category: "versement",
        itemsCount: group.items.length,
        items: group.items,
      });
    });

    // Add individual declarations (not grouped)
    if (
      currentHistorique.declarations &&
      currentHistorique.declarations.length > 0
    ) {
      currentHistorique.declarations.forEach((declaration) => {
        const typeKey = Object.keys(declarationDefinitions).find(
          (key) =>
            declarationDefinitions[key].name === declaration.type_declaration ||
            key === declaration.type_declaration
        );

        const displayStatus = getDeclarationDisplayStatus(
          declaration.statut_declaration
        );

        tableData.push({
          id: `declaration_${declaration.id}`,
          date: declaration.dateDeclaration || declaration.created_at,
          type: declaration.type_declaration,
          code: typeKey || declaration.type_declaration,
          period: declaration.annee_declaration,
          amount: parseFloat(declaration.montant_declare || 0),
          status: displayStatus,
          description:
            declarationDefinitions[typeKey]?.description ||
            declaration.commentaire ||
            declaration.type_declaration,
          category: "declaration",
        });
      });
    }

    return tableData;
  };

  const fiscalData = transformHistoriqueToTableData();

  const getStatusVariant = (status) => {
    switch (status) {
      case "Déposée":
      case "Payé":
        return "default";
      case "Non payé":
      case "Non déposée":
        return "secondary";
      case "En retard":
        return "destructive";
      case "Partiel":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Simplified getTypeIcon function without category-based logic
  const getTypeIcon = (code, category) => {
    if (category === "declaration") {
      return <FileText className="w-4 h-4 text-purple-600" />;
    }

    // Simple icon assignment based on code patterns instead of categories
    if (code.includes("TVA") || code.includes("TS") || code.includes("TH") || code.includes("TPT") || code.includes("TDB")) {
      return <TrendingUp className="w-4 h-4 text-blue-600" />;
    }
    if (code.includes("IS") || code.includes("IR") || code.includes("CM")) {
      return <Building2 className="w-4 h-4 text-red-600" />;
    }
    if (code.includes("CPU") || code.includes("CSS")) {
      return <Users className="w-4 h-4 text-green-600" />;
    }
    return <Calendar className="w-4 h-4 text-gray-600" />;
  };

  // Simplified filtering - only search term
  const filteredData = fiscalData.filter((item) => {
    const definition =
      item.category === "versement"
        ? versementDefinitions[item.code]
        : declarationDefinitions[item.code];
    const displayName = definition ? definition.name : item.type;

    const matchesSearch =
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const totalAmount = filteredData
    .filter((item) => item.amount > 0)
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/historique_fiscal")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Détails Historique Fiscal - {currentHistorique.client_display}
              </h1>
              <p className="text-gray-600">
                Année fiscale {currentHistorique.annee_fiscal} •{" "}
                {currentHistorique.description}
              </p>
            </div>
          </div>
          
          {/* Add New Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddPaiementModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <DollarSign className="w-4 h-4" />
              Ajouter Paiement
            </Button>
            <Button
              onClick={() => setShowAddDeclarationModal(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              <FileText className="w-4 h-4" />
              Ajouter Déclaration
            </Button>
          </div>
        </div>

        {/* Header Info */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Client</h3>
                <p className="text-lg font-medium">
                  {currentHistorique.client_display}
                </p>
                <p className="text-sm text-gray-600">
                  {currentHistorique.client_type === "pm"
                    ? "Personne Morale"
                    : "Personne Physique"}
                </p>
                {currentHistorique.client_ice && (
                  <p className="text-xs text-gray-500">
                    ICE: {currentHistorique.client_ice}
                  </p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Année Fiscale
                </h3>
                <p className="text-lg font-medium">
                  {currentHistorique.annee_fiscal}
                </p>
                <p className="text-sm text-gray-600">
                  {currentHistorique.description}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Progression</h3>
                <p className="text-lg font-medium">
                  {currentHistorique.progress_percentage || 0}%
                </p>
                <p className="text-sm text-gray-600">
                  {currentHistorique.completed_elements || 0}/
                  {currentHistorique.total_elements || 0} éléments
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Statut</h3>
                <p className="text-lg font-medium">
                  {currentHistorique.statut_global === "COMPLETE"
                    ? "Terminé"
                    : currentHistorique.statut_global === "EN_COURS"
                    ? "En Cours"
                    : currentHistorique.statut_global === "EN_RETARD"
                    ? "En Retard"
                    : currentHistorique.statut_global}
                </p>
                <p className="text-sm text-gray-600">
                  Créé le{" "}
                  {new Date(currentHistorique.datecreation).toLocaleDateString(
                    "fr-FR"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total versements
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalAmount.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "MAD",
                    })}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total éléments
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredData.length}
                  </p>
                </div>
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Non payés/déposés
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      filteredData.filter(
                        (item) =>
                          item.status === "Non payé" ||
                          item.status === "Non déposée"
                      ).length
                    }
                  </p>
                </div>
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Payés/Déposés
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      filteredData.filter(
                        (item) =>
                          item.status === "Déposée" ||
                          item.status === "Payé" ||
                          item.status === "Partiel"
                      ).length
                    }
                  </p>
                </div>
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simplified Filters - Only Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Type, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex justify-end items-end">
                <Button className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Exporter</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Versements et Déclarations</CardTitle>
            <p className="text-sm text-gray-600">
              {filteredData.length} élément(s)
            </p>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Aucun élément trouvé
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aucun versement ou déclaration pour cet historique.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => {
                    const definition =
                      item.category === "versement"
                        ? versementDefinitions[item.code]
                        : declarationDefinitions[item.code];
                    const displayName = definition ? definition.name : item.type;
                    const displayIcon = definition ? definition.icon : "📄";

                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{displayIcon}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {displayName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                {item.description}
                                {item.category === "versement" &&
                                  item.itemsCount && (
                                    <Badge variant="secondary">
                                      {item.itemsCount} période(s)
                                    </Badge>
                                  )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {item.period}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {item.date
                              ? new Date(item.date).toLocaleDateString("fr-FR")
                              : "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-gray-900">
                            {item.amount > 0
                              ? parseFloat(item.amount).toLocaleString("fr-FR", {
                                  style: "currency",
                                  currency: "MAD",
                                })
                              : "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openDetailModal(
                                  item.code,
                                  item.category === "declaration"
                                )
                              }
                              title="Voir les détails du type"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openEditModal(
                                  item.code,
                                  item.category === "declaration"
                                )
                              }
                              title="Modifier ce type"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <ViewSpecificTaxTypeDetails
          isOpen={showDetailModal}
          onClose={closeDetailModal}
          taxCode={detailTaxCode}
          isDeclaration={detailIsDeclaration}
          currentHistorique={currentHistorique}
          versementDefinitions={versementDefinitions}
          declarationDefinitions={declarationDefinitions}
        />

        {/* Edit Specific Tax Type Modal */}
        <UpdateSpecificTaxType
          isOpen={showEditModal}
          onClose={closeEditModal}
          taxCode={editTaxCode}
          isDeclaration={editIsDeclaration}
          historiqueId={id}
        />

        {/* Add New Paiement Modal */}
        <AddNewPaiement
          isOpen={showAddPaiementModal}
          onClose={() => setShowAddPaiementModal(false)}
          currentHistorique={currentHistorique}
          versementDefinitions={versementDefinitions}
          onSelectType={handleSelectNewType}
        />

        {/* Add New Declaration Modal */}
        <AddNewDeclaration
          isOpen={showAddDeclarationModal}
          onClose={() => setShowAddDeclarationModal(false)}
          currentHistorique={currentHistorique}
          declarationDefinitions={declarationDefinitions}
          onSelectType={handleSelectNewType}
        />
      </div>
    </div>
  );
}