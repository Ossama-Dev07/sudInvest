import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Function to download PDF for specific tax type details
export const downloadSpecificTaxTypePDF = async (
  taxCode,
  isDeclaration,
  currentHistorique,
  versementDefinitions,
  declarationDefinitions
) => {
  if (!taxCode || !currentHistorique) return;

  try {
    const doc = new jsPDF();
    
    // Configure fonts and colors
    const primaryColor = [51, 51, 51]; // Dark gray
    const accentColor = [59, 130, 246]; // Blue
    const backgroundColor = [248, 250, 252]; // Light gray
    
    // Page margins
    const leftMargin = 20;
    const rightMargin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - leftMargin - rightMargin;
    
    let currentY = 20;

    // Generate detailed data using the same logic as ViewSpecificTaxTypeDetails
    const detailData = generateDetailedData(
      taxCode, 
      isDeclaration, 
      currentHistorique, 
      versementDefinitions, 
      declarationDefinitions
    );

    // Header Section
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(detailData.title.toUpperCase(), leftMargin, currentY);
    currentY += 15;
    
    // Client Information Section
    doc.setFontSize(14);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text('INFORMATIONS CLIENT', leftMargin, currentY);
    currentY += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    
    const clientName = currentHistorique.client.raisonSociale 
      ? currentHistorique.client.raisonSociale 
      : `${currentHistorique.client.prenom_client} ${currentHistorique.client.nom_client}`;
    
    const clientInfo = [
      ['Client:', clientName],
      ['Type:', currentHistorique.client_type === "pm" ? "Personne Morale" : "Personne Physique"],
      ['Année Fiscale:', currentHistorique.annee_fiscal],
      ['Type d\'impôt:', detailData.title],
      ['Fréquence:', detailData.frequency],
      ['Nombre d\'éléments:', detailData.data.length.toString()]
    ];
    
    if (currentHistorique.client_ice) {
      clientInfo.splice(2, 0, ['ICE:', currentHistorique.client_ice]);
    }
    
    clientInfo.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, leftMargin, currentY);
      doc.setFont(undefined, 'normal');
      doc.text(value, leftMargin + 35, currentY);
      currentY += 7;
    });
    
    currentY += 15;

    // Summary Section (only for versements)
    if (!isDeclaration && detailData.data.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('RÉSUMÉ FINANCIER', leftMargin, currentY);
      currentY += 10;

      const totalAmount = detailData.data.reduce(
        (sum, item) => sum + parseFloat(item.amount || 0),
        0
      );

      const paidCount = detailData.data.filter(item => item.status === 'Payé').length;
      const unpaidCount = detailData.data.filter(item => item.status === 'Non payé').length;
      const overdueCount = detailData.data.filter(item => item.status === 'En retard').length;

      autoTable(doc, {
        startY: currentY,
        head: [['Indicateur', 'Valeur']],
        body: [
          ['Montant Total', `${totalAmount.toFixed(2)} MAD`],
          ['Éléments Payés', paidCount.toString()],
          ['Éléments Non Payés', unpaidCount.toString()],
          ['Éléments en Retard', overdueCount.toString()],
          ['Taux de Paiement', `${((paidCount / detailData.data.length) * 100).toFixed(1)}%`]
        ],
        theme: 'grid',
        headStyles: { fillColor: accentColor, textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        margin: { left: leftMargin, right: rightMargin },
        tableWidth: contentWidth / 2
      });
      
      currentY = doc.lastAutoTable.finalY + 20;
    }

    // Check if we need a new page
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    // Detailed Table
    doc.setFontSize(14);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text('DÉTAIL DES PÉRIODES', leftMargin, currentY);
    currentY += 10;

    if (detailData.data.length > 0) {
      // Prepare table data
      const tableData = detailData.data.map(item => {
        const row = [
          item.period || '-',
          item.depositDate ? new Date(item.depositDate).toLocaleDateString('fr-FR') : '-',
          item.status
        ];

        // Add amount column only for versements
        if (!isDeclaration) {
          row.splice(2, 0, item.amount > 0 ? `${item.amount.toFixed(2)} MAD` : '-');
          row.splice(4, 0, item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '-');
        }

        return row;
      });

      // Table headers
      const headers = isDeclaration 
        ? ['Période', 'Date de Dépôt', 'Statut']
        : ['Période', 'Date de Dépôt', 'Montant', 'Statut', 'Date d\'Échéance'];

      autoTable(doc, {
        startY: currentY,
        head: [headers],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: accentColor, 
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 9,
          textColor: primaryColor
        },
        alternateRowStyles: { 
          fillColor: backgroundColor 
        },
        margin: { left: leftMargin, right: rightMargin },
        tableWidth: contentWidth,
        columnStyles: isDeclaration ? {
          0: { cellWidth: 60 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30, halign: 'center' }
        } : {
          0: { cellWidth: 40 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 35 }
        }
      });

      currentY = doc.lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(12);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Aucune donnée trouvée pour ce type d\'impôt.', leftMargin, currentY);
      currentY += 20;
    }

    // Additional Info Section
    if (currentY < 250) {
      doc.setFontSize(12);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('INFORMATIONS COMPLÉMENTAIRES', leftMargin, currentY);
      currentY += 10;

      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

      const definition = isDeclaration 
        ? declarationDefinitions[taxCode] 
        : versementDefinitions[taxCode];

      if (definition) {
        doc.text(`Description: ${definition.description || 'N/A'}`, leftMargin, currentY);
        currentY += 7;
      }
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        pageWidth - rightMargin - 30,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
        leftMargin,
        doc.internal.pageSize.height - 10
      );
    }

    // Save the PDF
    const definition = isDeclaration 
      ? declarationDefinitions[taxCode] 
      : versementDefinitions[taxCode];
    const typeName = definition ? definition.name : taxCode;
    const fileName = `${typeName.replace(/\s+/g, '_')}_${clientName.replace(/\s+/g, '_')}_${currentHistorique.annee_fiscal}.pdf`;
    
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
  }
};

// Helper function to generate detailed data (same logic as ViewSpecificTaxTypeDetails)
const generateDetailedData = (taxCode, isDeclaration, currentHistorique, versementDefinitions, declarationDefinitions) => {
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
        const depositDate = paiement.date_paiement;

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

    // Add individual declarations
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
          depositDate: declaration.dateDeclaration,
          type: declaration.type_declaration,
          code: typeKey || declaration.type_declaration,
          period: declaration.annee_declaration,
          amount: null,
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

  if (isDeclaration) {
    const relatedData = fiscalData.filter(
      (item) => item.code === taxCode && item.category === "declaration"
    );
    const definition = declarationDefinitions[taxCode];

    return {
      title: `Détail ${definition?.name || taxCode}`,
      frequency: "Annuelle",
      data: relatedData.map((item) => ({
        period: item.period,
        amount: null,
        status: item.status,
        date: item.date,
        depositDate: item.depositDate,
        reference: `${taxCode}-${item.period || "N/A"}`,
      })),
    };
  } else {
    const groupedItem = fiscalData.find(
      (item) => item.code === taxCode && item.category === "versement"
    );

    if (!groupedItem || !groupedItem.items) {
      return { title: `Détail ${taxCode}`, frequency: "N/A", data: [] };
    }

    const definition = versementDefinitions[taxCode];

    return {
      title: `Détail ${definition?.name || taxCode}`,
      frequency: definition?.periods?.[0] || "N/A",
      data: groupedItem.items.map((item) => ({
        period: item.periode_numero
          ? `Période ${item.periode_numero}`
          : item.periode || "N/A",
        amount: item.amount,
        status: item.status,
        date: item.date,
        depositDate: item.depositDate,
        reference: `${taxCode}-${currentHistorique.annee_fiscal}-${
          item.periode_numero || "001"
        }`,
      })),
    };
  }
};

// Button handler function to call the PDF download
export const handleDownloadSpecificTaxType = (
  taxCode,
  isDeclaration,
  currentHistorique,
  versementDefinitions,
  declarationDefinitions
) => {
  downloadSpecificTaxTypePDF(
    taxCode,
    isDeclaration,
    currentHistorique,
    versementDefinitions,
    declarationDefinitions
  );
};