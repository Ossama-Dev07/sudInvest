import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
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

export default function AddNewDeclaration({ 
  isOpen, 
  onClose, 
  currentHistorique,
  declarationDefinitions,
  onSelectType 
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Get client type from the correct property
  const clientType = currentHistorique?.client?.type || currentHistorique?.client_type;

  // Get existing declaration types in the current historique
  const existingDeclarationTypes = useMemo(() => {
    if (!currentHistorique?.declarations) return new Set();
    
    const types = new Set();
    currentHistorique.declarations.forEach(declaration => {
      // Find the key that matches this declaration type
      const typeKey = Object.keys(declarationDefinitions).find(
        key => declarationDefinitions[key].name === declaration.type_declaration || key === declaration.type_declaration
      );
      if (typeKey) {
        types.add(typeKey);
      }
    });
    
    return types;
  }, [currentHistorique?.declarations, declarationDefinitions]);

  // Filter available types (not yet added) and handle automatic État selection
  const availableTypes = useMemo(() => {
    return Object.entries(declarationDefinitions)
      .filter(([key, def]) => {
        // Check if type is already added
        if (existingDeclarationTypes.has(key)) return false;
        
        // Automatically filter États based on client type
        if (key === 'ETAT_9000' && clientType !== 'pp') return false; // État 9000 only for PP
        if (key === 'ETAT_9421' && clientType !== 'pm') return false; // État 9421 only for PM
        
        // Check client type compatibility for other declarations
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
  }, [declarationDefinitions, existingDeclarationTypes, clientType, searchTerm]);

  const handleSelectType = (typeKey, typeDef) => {
    onSelectType(typeKey, true); // true = is declaration
    onClose();
  };

  const getTypeCategory = (key, def) => {
    if (key.includes('9421') || key.includes('9000')) {
      return { label: 'États Fiscaux', color: 'bg-blue-100 text-blue-800' };
    }
    if (key.includes('SYNTHESE')) {
      return { label: 'États Financiers', color: 'bg-green-100 text-green-800' };
    }
    if (def.optional) {
      return { label: 'Optionnelles', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'Déclarations', color: 'bg-purple-100 text-purple-800' };
  };

  const getClientTypeDisplay = (type) => {
    return type === 'pp' ? 'Personne Physique' : 'Personne Morale';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-600" />
            Ajouter un Nouveau Type de Déclaration
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un type de déclaration à ajouter pour {currentHistorique?.client_display} - 
            Année {currentHistorique?.annee_fiscal}
            {clientType && (
              <span className="block mt-1 text-sm">
                Type de client: <span className="font-medium">{getClientTypeDisplay(clientType)}</span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 min-h-0 px-1">
          {/* Search */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher un type de déclaration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {existingDeclarationTypes.size > 0 && (
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  <strong>{existingDeclarationTypes.size}</strong> type(s) de déclaration déjà ajouté(s) pour cet historique.
                  Seuls les types non ajoutés sont affichés ci-dessous.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Available Types Grid */}
          {availableTypes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? "Aucun type trouvé" : "Tous les types sont déjà ajoutés"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? "Essayez de modifier votre recherche" 
                  : "Tous les types de déclarations compatibles sont déjà présents dans cet historique"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTypes.map(([key, def]) => {
                const category = getTypeCategory(key, def);
                
                return (
                  <Card 
                    key={key} 
                    className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-purple-200"
                    onClick={() => handleSelectType(key, def)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{def.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {def.name}
                            </h3>
                            <p className="text-sm text-gray-600">{def.description}</p>
                          </div>
                        </div>
                        <Plus className="w-5 h-5 text-purple-600" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={category.color}>
                            {category.label}
                          </Badge>
                          {def.mandatory && (
                            <Badge variant="destructive">Obligatoire</Badge>
                          )}
                          {def.optional && (
                            <Badge variant="secondary">Optionnel</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FileText className="w-3 h-3" />
                          Déclaration annuelle
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