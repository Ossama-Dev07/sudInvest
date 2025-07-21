import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Info
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AddNewPaiement({ 
  isOpen, 
  onClose, 
  currentHistorique,
  versementDefinitions,
  onSelectType 
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Get client type from the correct property
  const clientType = currentHistorique?.client?.type || currentHistorique?.client_type;

  // Get existing payment types in the current historique
  const existingPaymentTypes = useMemo(() => {
    if (!currentHistorique?.paiements) return new Set();
    
    const types = new Set();
    currentHistorique.paiements.forEach(paiement => {
      // Find the key that matches this payment type
      const typeKey = Object.keys(versementDefinitions).find(
        key => versementDefinitions[key].name === paiement.type_impot || key === paiement.type_impot
      );
      if (typeKey) {
        types.add(typeKey);
      }
    });
    return types;
  }, [currentHistorique?.paiements, versementDefinitions]);

  // Filter available types (not yet added)
  const availableTypes = useMemo(() => {
    return Object.entries(versementDefinitions)
      .filter(([key, def]) => {
        // Check if type is already added
        if (existingPaymentTypes.has(key)) return false;
        
        // Check client type compatibility
        if (clientType === 'pp' && def.pmOnly) return false;
        if (clientType === 'pm' && def.ppOnly) return false;
        
        return true;
      })
      .filter(([key, def]) => {
        // Apply search filter
        if (!searchTerm) return true;
        return (
          def.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          def.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          key.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
  }, [versementDefinitions, existingPaymentTypes, clientType, searchTerm]);

  const handleSelectType = (typeKey, typeDef) => {
    onSelectType(typeKey, false); // false = not declaration
    onClose();
  };

  const getTypeCategory = (key) => {
    if (key.includes('TVA') || key.includes('TS') || key.includes('TH') || key.includes('TPT') || key.includes('TDB')) {
      return { label: 'Taxes', color: 'bg-blue-100 text-blue-800' };
    }
    if (key.includes('IS') || key.includes('IR') || key.includes('CM')) {
      return { label: 'Impôts', color: 'bg-red-100 text-red-800' };
    }
    if (key.includes('CPU') || key.includes('CSS')) {
      return { label: 'Contributions', color: 'bg-green-100 text-green-800' };
    }
    return { label: 'Autres', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Ajouter un Nouveau Type de Versement 
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un type de versement à ajouter pour {currentHistorique?.client_display} - 
            Année {currentHistorique?.annee_fiscal}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 min-h-0 px-1">
          {/* Search */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher un type de versement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {existingPaymentTypes.size > 0 && (
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  <strong>{existingPaymentTypes.size}</strong> type(s) de versement déjà ajouté(s) pour cet historique.
                  Seuls les types non ajoutés sont affichés ci-dessous.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Available Types Grid */}
          {availableTypes.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? "Aucun type trouvé" : "Tous les types sont déjà ajoutés"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? "Essayez de modifier votre recherche" 
                  : "Tous les types de versement compatibles sont déjà présents dans cet historique"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTypes.map(([key, def]) => {
                const category = getTypeCategory(key);
                return (
                  <Card 
                    key={key} 
                    className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-blue-200"
                    onClick={() => handleSelectType(key, def)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{def.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{def.name}</h3>
                            <p className="text-sm text-gray-600">{def.description}</p>
                          </div>
                        </div>
                        <Plus className="w-5 h-5 text-blue-600" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={category.color}>
                            {category.label}
                          </Badge>
                          {def.optional && (
                            <Badge variant="secondary">Optionnel</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          Périodes: {def.periods?.join(', ') || 'Non défini'}
                        </div>

                        {def.ppOnly && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Info className="w-3 h-3" />
                            Personnes Physiques uniquement
                          </div>
                        )}

                        {def.pmOnly && (
                          <div className="flex items-center gap-1 text-xs text-purple-600">
                            <Info className="w-3 h-3" />
                            Personnes Morales uniquement
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 -m-6 mt-0 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}