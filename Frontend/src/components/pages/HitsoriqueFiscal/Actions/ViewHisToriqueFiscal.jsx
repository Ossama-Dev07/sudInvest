import React, { useState, useEffect } from 'react'
import { Search, Download, Calendar, TrendingUp, FileText, Eye, X, Building2, Users, Home, Loader2, ArrowLeft, Edit, Settings } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import useHistoriqueFiscalStore from '@/store/HistoriqueFiscalStore'
import UpdateSpecificTaxType from './UpdateSpecificTaxType' // Import the new component

export default function ViewHisToriqueFiscal() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDetailType, setSelectedDetailType] = useState('')
  
  // New state for the edit modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editTaxCode, setEditTaxCode] = useState('')
  const [editIsDeclaration, setEditIsDeclaration] = useState(false)

  // Store hooks
  const {
    currentHistorique,
    loading,
    error,
    fetchHistoriqueById
  } = useHistoriqueFiscalStore()

  // Fetch specific historique on component mount
  useEffect(() => {
    if (id) {
      fetchHistoriqueById(id)
    }
  }, [id, fetchHistoriqueById])

  // Your actual definitions
  const versementDefinitions = {
    TVA: { name: "TVA", periods: ["MENSUEL", "TRIMESTRIEL", "ANNUEL"], category: "Taxes sur Chiffre d'Affaires", description: "Taxe sur la Valeur Ajoutée", icon: "💰", mandatory: true },
    IS: { name: "Impôt sur les Sociétés (IS)", periods: ["TRIMESTRIEL"], category: "Impôts sur Bénéfices", description: "4 acomptes trimestriels", icon: "🏢", mandatory: true },
    CM: { name: "Cotisation Minimale", periods: ["ANNUEL"], category: "Impôts sur Bénéfices", description: "Alternative à l'IS", icon: "📊" },
    DT: { name: "Droits de Timbre", periods: ["MENSUEL"], category: "Droits et Taxes", description: "Droits de timbre mensuels", icon: "📋" },
    IR_SALAIRES: { name: "IR sur Salaires", periods: ["MENSUEL"], category: "Impôts sur Revenus", description: "Retenue à la source mensuelle", icon: "👥", mandatory: true },
    IR_PROF: { name: "IR Professionnel", periods: ["ANNUEL"], category: "Impôts sur Revenus", description: "Pour les personnes physiques", icon: "👤", ppOnly: true },
    CPU: { name: "CPU", periods: ["MENSUEL"], category: "Contributions Spéciales", description: "Contribution Professionnelle Unique", icon: "⚡" },
    CSS: { name: "CSS", periods: ["MENSUEL"], category: "Contributions Sociales", description: "Contribution Sociale de Solidarité", icon: "🤝" },
    TDB: { name: "Taxe sur Débits de Boissons", periods: ["TRIMESTRIEL"], category: "Taxes Spécialisées", description: "Pour les débits de boissons", icon: "🍺", optional: true },
    TS: { name: "Taxe de Services", periods: ["TRIMESTRIEL"], category: "Taxes sur Services", description: "Taxe trimestrielle sur services", icon: "🛎️" },
    TPT: { name: "Taxe sur les Produits de Tabac", periods: ["TRIMESTRIEL"], category: "Taxes Spécialisées", description: "Pour les produits de tabac", icon: "🚬", optional: true },
    TH: { name: "Taxe d'Habitation", periods: ["ANNUEL"], category: "Taxes Locales", description: "Taxe annuelle d'habitation", icon: "🏠" },
    T_PROF: { name: "Taxe Professionnelle (Patente)", periods: ["ANNUEL"], category: "Taxes Locales", description: "Patente annuelle", icon: "🏪" }
  };

  const declarationDefinitions = {
    ETAT_9421: { name: "État 9421", pmOnly: true, mandatory: true, category: "Déclarations Obligatoires", description: "Obligatoire pour PM", icon: "📊" },
    ETAT_9000: { name: "État 9000", ppOnly: true, mandatory: true, category: "Déclarations Obligatoires", description: "Obligatoire pour PP", icon: "👤" },
    ETAT_SYNTHESE: { name: "État de Synthèse", mandatory: true, category: "Déclarations Obligatoires", description: "État financier annuel", icon: "📈" },
    DECL_TP: { name: "Déclaration TP Optionnelle", optional: true, category: "Déclarations Optionnelles", description: "Déclaration optionnelle", icon: "📝" }
  };

  // New function to open edit modal
  const openEditModal = (code, isDeclaration = false) => {
    setEditTaxCode(code)
    setEditIsDeclaration(isDeclaration)
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditTaxCode('')
    setEditIsDeclaration(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement des détails...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">Erreur de chargement</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => navigate('/historique_fiscal')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  if (!currentHistorique) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-2">Historique fiscal non trouvé</div>
          <button 
            onClick={() => navigate('/historique_fiscal')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  // Transform historique data to grouped structure for table
  const transformHistoriqueToTableData = () => {
    const tableData = []
    const versementGroups = {}
    
    // Group paiements by type
    if (currentHistorique.paiements && currentHistorique.paiements.length > 0) {
      currentHistorique.paiements.forEach(paiement => {
        const typeKey = Object.keys(versementDefinitions).find(key => 
          versementDefinitions[key].name === paiement.type_impot ||
          key === paiement.type_impot
        ) || paiement.type_impot

        if (!versementGroups[typeKey]) {
          versementGroups[typeKey] = {
            code: typeKey,
            type: paiement.type_impot,
            definition: versementDefinitions[typeKey],
            items: [],
            totalAmount: 0,
            allPaid: true,
            latestDate: null,
            category: 'versement'
          }
        }

        const amount = parseFloat(paiement.montant_paye || paiement.montant_du || 0)
        const isPaid = paiement.statut === 'PAYE'
        const date = paiement.date_echeance || paiement.date_paiement || paiement.created_at

        versementGroups[typeKey].items.push({
          id: paiement.id,
          periode_numero: paiement.periode_numero,
          amount: amount,
          status: paiement.statut === 'PAYE' ? 'Payé' : 
                 paiement.statut === 'NON_PAYE' ? 'En attente' : 
                 paiement.statut === 'EN_RETARD' ? 'En retard' : 'Validé',
          date: date,
          periode: paiement.periode,
          commentaire: paiement.commentaire
        })

        versementGroups[typeKey].totalAmount += amount
        if (!isPaid) versementGroups[typeKey].allPaid = false
        
        if (!versementGroups[typeKey].latestDate || new Date(date) > new Date(versementGroups[typeKey].latestDate)) {
          versementGroups[typeKey].latestDate = date
        }
      })
    }

    // Convert grouped versements to table format
    Object.values(versementGroups).forEach(group => {
      const definition = group.definition
      let overallStatus = 'En attente'
      
      if (group.allPaid) {
        overallStatus = 'Payé'
      } else {
        const hasPartialPayments = group.items.some(item => item.status === 'Payé')
        const hasOverdue = group.items.some(item => item.status === 'En retard')
        
        if (hasOverdue) overallStatus = 'En retard'
        else if (hasPartialPayments) overallStatus = 'Partiel'
        else overallStatus = 'En attente'
      }

      // Determine the actual period being used for this group
      const actualPeriod = group.items.length > 0 ? group.items[0].periode : (definition?.periods?.[0] || 'N/A')

      tableData.push({
        id: `versement_group_${group.code}`,
        date: group.latestDate,
        type: group.type,
        code: group.code,
        period: actualPeriod,
        amount: group.totalAmount,
        status: overallStatus,
        description: definition?.description || group.type,
        category: 'versement',
        itemsCount: group.items.length,
        items: group.items
      })
    })

    // Add individual declarations (not grouped)
    if (currentHistorique.declarations && currentHistorique.declarations.length > 0) {
      currentHistorique.declarations.forEach(declaration => {
        const typeKey = Object.keys(declarationDefinitions).find(key => 
          declarationDefinitions[key].name === declaration.type_declaration ||
          key === declaration.type_declaration
        )

        tableData.push({
          id: `declaration_${declaration.id}`,
          date: declaration.dateDeclaration || declaration.created_at,
          type: declaration.type_declaration,
          code: typeKey || declaration.type_declaration,
          period: declaration.annee_declaration,
          amount: parseFloat(declaration.montant_declare || 0),
          status: declaration.statut_declaration === 'DEPOSEE' ? 'Validé' : 
                 declaration.statut_declaration === 'NON_DEPOSEE' ? 'En attente' : 
                 declaration.statut_declaration === 'EN_RETARD' ? 'En retard' : 'Validé',
          description: declarationDefinitions[typeKey]?.description || declaration.commentaire || declaration.type_declaration,
          category: 'declaration'
        })
      })
    }

    return tableData
  }

  const fiscalData = transformHistoriqueToTableData()

  const getStatusColor = (status) => {
    switch (status) {
      case 'Validé': return 'bg-green-100 text-green-800 border-green-200'
      case 'Payé': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'En attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'En retard': return 'bg-red-100 text-red-800 border-red-200'
      case 'Partiel': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (code, category) => {
    if (category === 'declaration') {
      return <FileText className="w-4 h-4 text-purple-600" />
    }
    
    const definition = versementDefinitions[code]
    if (!definition) return <FileText className="w-4 h-4 text-gray-600" />
    
    if (definition.category.includes('Taxes')) return <TrendingUp className="w-4 h-4 text-blue-600" />
    if (definition.category.includes('Impôts')) return <Building2 className="w-4 h-4 text-red-600" />
    if (definition.category.includes('Contributions')) return <Users className="w-4 h-4 text-green-600" />
    return <Calendar className="w-4 h-4 text-gray-600" />
  }

  const filteredData = fiscalData.filter(item => {
    const definition = item.category === 'versement' ? versementDefinitions[item.code] : declarationDefinitions[item.code]
    const displayName = definition ? definition.name : item.type
    
    const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || (definition && definition.category === selectedCategory)
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalAmount = filteredData.filter(item => item.amount > 0).reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)

  const generateDetailedData = (code, isDeclaration) => {
    if (isDeclaration) {
      const relatedData = fiscalData.filter(item => 
        item.code === code && item.category === 'declaration'
      )
      const definition = declarationDefinitions[code]
      
      return {
        title: `Détail ${definition?.name || code}`,
        frequency: 'Annuelle',
        data: relatedData.map(item => ({
          period: item.period,
          amount: item.amount,
          status: item.status,
          date: item.date,
          reference: `${code}-${item.period || 'N/A'}`
        }))
      }
    } else {
      // For versements, get the grouped item
      const groupedItem = fiscalData.find(item => 
        item.code === code && item.category === 'versement'
      )
      
      if (!groupedItem || !groupedItem.items) {
        return { title: `Détail ${code}`, frequency: 'N/A', data: [] }
      }

      const definition = versementDefinitions[code]
      
      return {
        title: `Détail ${definition?.name || code}`,
        frequency: definition?.periods?.[0] || 'N/A',
        data: groupedItem.items.map(item => ({
          period: item.periode_numero ? `Période ${item.periode_numero}` : item.periode || 'N/A',
          amount: item.amount,
          status: item.status,
          date: item.date,
          reference: `${code}-${currentHistorique.annee_fiscal}-${item.periode_numero || '001'}`
        }))
      }
    }
  }

  const openDetailModal = (code, isDeclaration = false) => {
    setSelectedDetailType({ code, isDeclaration })
    setShowDetailModal(true)
  }

  const getAllCategories = () => {
    const categories = new Set()
    Object.values(versementDefinitions).forEach(def => categories.add(def.category))
    Object.values(declarationDefinitions).forEach(def => categories.add(def.category))
    return Array.from(categories)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/historique_fiscal')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Détails Historique Fiscal - {currentHistorique.client_display}
              </h1>
              <p className="text-gray-600">Année fiscale {currentHistorique.annee_fiscal} • {currentHistorique.description}</p>
            </div>
          </div>
          
          {/* Global Edit Button */}
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(`/historique_fiscal/edit/${id}`)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Modifier Tout</span>
            </button>
          </div>
        </div>

        {/* Header Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Client</h3>
              <p className="text-lg font-medium">{currentHistorique.client_display}</p>
              <p className="text-sm text-gray-600">{currentHistorique.client_type === 'pm' ? 'Personne Morale' : 'Personne Physique'}</p>
              {currentHistorique.client_ice && (
                <p className="text-xs text-gray-500">ICE: {currentHistorique.client_ice}</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Année Fiscale</h3>
              <p className="text-lg font-medium">{currentHistorique.annee_fiscal}</p>
              <p className="text-sm text-gray-600">{currentHistorique.description}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Progression</h3>
              <p className="text-lg font-medium">{currentHistorique.progress_percentage || 0}%</p>
              <p className="text-sm text-gray-600">
                {currentHistorique.completed_elements || 0}/{currentHistorique.total_elements || 0} éléments
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Statut</h3>
              <p className="text-lg font-medium">
                {currentHistorique.statut_global === 'COMPLETE' ? 'Terminé' :
                 currentHistorique.statut_global === 'EN_COURS' ? 'En Cours' :
                 currentHistorique.statut_global === 'EN_RETARD' ? 'En Retard' : currentHistorique.statut_global}
              </p>
              <p className="text-sm text-gray-600">
                Créé le {new Date(currentHistorique.datecreation).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total versements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total éléments</p>
                <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
              </div>
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredData.filter(item => item.status === 'En attente').length}
                </p>
              </div>
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Validés/Payés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredData.filter(item => item.status === 'Validé' || item.status === 'Payé' || item.status === 'Partiel').length}
                </p>
              </div>
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Type, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toutes les catégories</option>
                {getAllCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="Validé">Validé</option>
                <option value="Payé">Payé</option>
                <option value="Partiel">Partiel</option>
                <option value="En attente">En attente</option>
                <option value="En retard">En retard</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Versements et Déclarations</h2>
            <p className="text-sm text-gray-600">{filteredData.length} élément(s)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => {
                  const definition = item.category === 'versement' ? versementDefinitions[item.code] : declarationDefinitions[item.code]
                  const displayName = definition ? definition.name : item.type
                  const displayIcon = definition ? definition.icon : '📄'

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{displayIcon}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{displayName}</div>
                            <div className="text-sm text-gray-500">
                              {item.description}
                              {item.category === 'versement' && item.itemsCount && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {item.itemsCount} période(s)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.period}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.amount > 0 ? parseFloat(item.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' }) : '-'}
                        </div>
                      </td>
                    
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => openDetailModal(item.code, item.category === 'declaration')}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded"
                            title="Voir les détails du type"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(item.code, item.category === 'declaration')}
                            className="text-green-600 hover:text-green-800 transition-colors p-1 hover:bg-green-50 rounded"
                            title="Modifier ce type"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 transition-colors p-1 hover:bg-gray-50 rounded">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun élément trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">Aucun versement ou déclaration pour cet historique.</p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedDetailType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[80vh] overflow-hidden">
              {(() => {
                const detailData = generateDetailedData(selectedDetailType.code, selectedDetailType.isDeclaration)
                return (
                  <>
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{detailData.title}</h3>
                        <p className="text-sm text-gray-600">Dans cet historique: {detailData.data.length} élément(s)</p>
                      </div>
                      <button 
                        onClick={() => setShowDetailModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {detailData.data.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.period}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '-'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.amount > 0 ? parseFloat(item.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' }) : '-'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {!selectedDetailType.isDeclaration && detailData.data.length > 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Total pour ce type:</span>
                            <span className="text-lg font-bold text-gray-900">
                              {detailData.data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* Edit Specific Tax Type Modal */}
        <UpdateSpecificTaxType
          isOpen={showEditModal}
          onClose={closeEditModal}
          taxCode={editTaxCode}
          isDeclaration={editIsDeclaration}
          historiqueId={id}
        />
      </div>
    </div>
  )
}