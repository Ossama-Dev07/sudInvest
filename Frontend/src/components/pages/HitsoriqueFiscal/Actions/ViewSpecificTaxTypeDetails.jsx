import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ViewSpecificTaxTypeDetails({
  isOpen,
  onClose,
  taxCode,
  isDeclaration,
  currentHistorique,
  versementDefinitions,
  declarationDefinitions,
}) {
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
            latestDepositDate: null,
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
        const depositDate = paiement.date_paiement; // Date de dépôt

        const displayStatus = getDisplayStatus(paiement.statut);

        versementGroups[typeKey].items.push({
          id: paiement.id,
          periode_numero: paiement.periode_numero,
          amount: amount,
          status: displayStatus,
          dbStatus: paiement.statut,
          date: date,
          depositDate: depositDate,
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

        if (
          depositDate && (
            !versementGroups[typeKey].latestDepositDate ||
            new Date(depositDate) > new Date(versementGroups[typeKey].latestDepositDate)
          )
        ) {
          versementGroups[typeKey].latestDepositDate = depositDate;
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
        depositDate: group.latestDepositDate,
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
          depositDate: declaration.dateDeclaration, // Use dateDeclaration as deposit date for declarations
          type: declaration.type_declaration,
          code: typeKey || declaration.type_declaration,
          period: declaration.annee_declaration,
          amount: null, // No amount display for declarations
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

  const generateDetailedData = (code, isDeclaration) => {
    const fiscalData = transformHistoriqueToTableData();

    if (isDeclaration) {
      const relatedData = fiscalData.filter(
        (item) => item.code === code && item.category === "declaration"
      );
      const definition = declarationDefinitions[code];

      return {
        title: `Détail ${definition?.name || code}`,
        frequency: "Annuelle",
        data: relatedData.map((item) => ({
          period: item.period,
          amount: null, // No amount for declarations
          status: item.status,
          date: item.date,
          depositDate: item.depositDate,
          reference: `${code}-${item.period || "N/A"}`,
        })),
      };
    } else {
      // For versements, get the grouped item
      const groupedItem = fiscalData.find(
        (item) => item.code === code && item.category === "versement"
      );

      if (!groupedItem || !groupedItem.items) {
        return { title: `Détail ${code}`, frequency: "N/A", data: [] };
      }

      const definition = versementDefinitions[code];

      return {
        title: `Détail ${definition?.name || code}`,
        frequency: definition?.periods?.[0] || "N/A",
        data: groupedItem.items.map((item) => ({
          period: item.periode_numero
            ? `Période ${item.periode_numero}`
            : item.periode || "N/A",
          amount: item.amount,
          status: item.status,
          date: item.date,
          depositDate: item.depositDate,
          reference: `${code}-${currentHistorique.annee_fiscal}-${
            item.periode_numero || "001"
          }`,
        })),
      };
    }
  };

  if (!taxCode || !currentHistorique) {
    return null;
  }

  const detailData = generateDetailedData(taxCode, isDeclaration);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{detailData.title}</DialogTitle>
          <p className="text-sm text-gray-600">
            Dans cet historique: {detailData.data.length} élément(s)
          </p>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Période</TableHead>
                <TableHead>Date de Dépôt</TableHead>
                {!isDeclaration && <TableHead>Montant</TableHead>}
                <TableHead>Statut</TableHead>
                {!isDeclaration && <TableHead>Date</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailData.data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {item.period}
                  </TableCell>
                  <TableCell>
                    {item.depositDate
                      ? new Date(item.depositDate).toLocaleDateString("fr-FR")
                      : "-"}
                  </TableCell>
                  {!isDeclaration && (
                    <TableCell>
                      {item.amount > 0
                        ? parseFloat(item.amount).toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "MAD",
                          })
                        : "-"}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  {!isDeclaration && (
                    <TableCell>
                      {item.date
                        ? new Date(item.date).toLocaleDateString("fr-FR")
                        : "-"}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isDeclaration && detailData.data.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Total pour ce type:
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {detailData.data
                    .reduce(
                      (sum, item) => sum + parseFloat(item.amount || 0),
                      0
                    )
                    .toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "MAD",
                    })}
                </span>
              </div>
            </div>
          )}
          {isDeclaration && detailData.data.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Type de déclaration:
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {declarationDefinitions[taxCode]?.name || taxCode}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium text-gray-700">
                  Dernière date de dépôt:
                </span>
                <span className="text-sm text-gray-900">
                  {detailData.data.some(item => item.depositDate) 
                    ? detailData.data
                        .filter(item => item.depositDate)
                        .map(item => new Date(item.depositDate))
                        .reduce((latest, current) => current > latest ? current : latest)
                        .toLocaleDateString("fr-FR")
                    : "Aucun dépôt enregistré"
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}