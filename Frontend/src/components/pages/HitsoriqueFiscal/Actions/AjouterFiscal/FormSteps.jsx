import React from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Info,
  Building2,
  Users,
  Receipt,
  ClipboardList
} from "lucide-react";
// Import the card components directly here since FormSteps uses them
import VersementCard from "./VersementCard";
import DeclarationCard from "./DeclarationCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FormSteps = ({
  currentStep,
  formData,
  clients,
  errors,
  selectedVersements,
  versementConfig,
  selectedDeclarations,
  groupedVersements,
  groupedDeclarations,
  versementDefinitions,
  declarationDefinitions,
  selectedClient,
  handleInputChange,
  handleVersementToggle,
  updateVersementConfig,
  handleDeclarationToggle,
  formatClientName,
  getSelectedClient,
  nextStep,
  prevStep,
  onSubmit
}) => {
  
  // Step 1: Basic Information
  const BasicInfoStep = () => (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-lg font-semibold mb-2">Informations de Base</h3>
        <p className="text-gray-600 mb-6">
          Renseignez les informations principales de l'historique fiscal
        </p>
      </div>

      {/* Client Selection */}
      <div className="space-y-2">
        <Label htmlFor="id_client">
          Client <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.id_client || ""}
          onValueChange={(value) => handleInputChange("id_client", value)}
        >
          <SelectTrigger className={errors.id_client ? "border-red-500" : ""}>
            <SelectValue placeholder="Sélectionnez un client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id_client} value={client.id_client}>
                {formatClientName(client)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Selected client display */}
        {formData.id_client && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-medium text-blue-800">
                  Client sélectionné:
                </span>
                <p className="text-sm text-blue-700 mt-1">
                  {formatClientName(getSelectedClient())}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Type: {getSelectedClient()?.type} • ID: {formData.id_client}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange("id_client", "")}
                className="text-blue-600 hover:text-blue-800 text-xs underline"
              >
                Effacer
              </button>
            </div>
          </div>
        )}

        {errors.id_client && (
          <span className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.id_client}
          </span>
        )}
      </div>

      {/* Année fiscale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="annee_fiscal">
            Année Fiscale <span className="text-red-500">*</span>
          </Label>
          <Input
            id="annee_fiscal"
            type="number"
            min="2000"
            max="2050"
            value={formData.annee_fiscal || ''}
            onChange={(e) => handleInputChange("annee_fiscal", e.target.value)}
            className={errors.annee_fiscal ? "border-red-500" : ""}
            placeholder="2025"
          />
          {errors.annee_fiscal && (
            <span className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.annee_fiscal}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className={errors.description ? "border-red-500" : ""}
          rows={4}
          placeholder="Description de l'historique fiscal..."
        />
        {errors.description && (
          <span className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.description}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="commentaire_general">Commentaire Général</Label>
        <Textarea
          id="commentaire_general"
          value={formData.commentaire_general || ''}
          onChange={(e) => handleInputChange("commentaire_general", e.target.value)}
          rows={3}
          placeholder="Commentaire général sur l'historique fiscal..."
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={nextStep} className="flex items-center gap-2">
          Suivant <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // Step 2: Versements
  const VersementsStep = () => (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-lg font-semibold mb-2">Versements (Paiements)</h3>
        <p className="text-gray-600 mb-6">
          Sélectionnez les versements et indiquez les montants correspondants.
        </p>
      </div>

      {errors.versements && (
        <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border-l-4 border-red-400">
          <p className="text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.versements}
          </p>
        </div>
      )}

      {/* Versement Categories */}
      {Object.entries(groupedVersements).map(([category, versements]) => (
        <VersementCard
          key={category}
          category={category}
          versements={versements}
          selectedVersements={selectedVersements}
          versementConfig={versementConfig}
          onVersementToggle={handleVersementToggle}
          updateVersementConfig={updateVersementConfig}
        />
      ))}

      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
        <Button
          onClick={prevStep}
          variant="secondary"
          className="flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Précédent
        </Button>
        <Button
          onClick={nextStep}
          className="flex items-center justify-center gap-2"
        >
          Suivant <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // Step 3: Declarations
  const DeclarationsStep = () => (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-lg font-semibold mb-2">Déclarations</h3>
        <p className="text-gray-600 mb-6">
          Sélectionnez les déclarations applicables. Le statut (fait/non fait) sera géré dans les détails.
        </p>
      </div>

      {errors.declarations && (
        <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border-l-4 border-red-400">
          <p className="text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.declarations}
          </p>
        </div>
      )}

      {/* Declaration Categories */}
      {Object.entries(groupedDeclarations).map(([category, declarations]) => (
        <DeclarationCard
          key={category}
          category={category}
          declarations={declarations}
          selectedDeclarations={selectedDeclarations}
          onDeclarationToggle={handleDeclarationToggle}
        />
      ))}

      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
        <Button
          onClick={prevStep}
          variant="secondary"
          className="flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Précédent
        </Button>
        <Button
          onClick={nextStep}
          className="flex items-center justify-center gap-2"
        >
          Suivant <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // Step 4: Review
  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-lg font-semibold mb-2">
          Révision de vos informations
        </h3>
        <p className="text-gray-600">
          Veuillez vérifier vos détails avant de créer l'historique fiscal.
        </p>
      </div>

      <div className="space-y-4">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Informations de Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600">Client:</span>
                <span className="font-medium text-gray-900 flex items-center gap-2">
                  {selectedClient?.type === "PM" ? (
                    <Building2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Users className="w-4 h-4 text-green-600" />
                  )}
                  {getSelectedClient() ? formatClientName(getSelectedClient()) : formData.id_client}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600">Année Fiscale:</span>
                <span className="font-medium text-gray-900">
                  {formData.annee_fiscal}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-600">Description:</span>
                <p className="font-medium text-gray-900 mt-1">
                  {formData.description}
                </p>
              </div>
              {formData.commentaire_general && (
                <div className="sm:col-span-2">
                  <span className="text-gray-600">Commentaire Général:</span>
                  <p className="font-medium text-gray-900 mt-1">
                    {formData.commentaire_general}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Versements sélectionnés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Versements Sélectionnés
              <Badge variant="default">
                {selectedVersements.size} élément{selectedVersements.size > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from(selectedVersements).map(versementKey => {
              const versement = versementDefinitions[versementKey];
              const config = versementConfig[versementKey];
              return (
                <div key={versementKey} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 flex items-center gap-2">
                      <span className="text-lg">{versement.icon}</span>
                      {versement.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {versement.category}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="space-y-1">
                      <div>Période: {config?.periode || versement.periods?.[0] || "Annuel"}</div>
                      {config?.montant && (
                        <div>Montant: {config.montant} MAD</div>
                      )}
                      {config?.amounts && Object.keys(config.amounts).length > 0 && (
                        <div>Montants détaillés: {Object.keys(config.amounts).length} période(s)</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Déclarations sélectionnées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Déclarations Sélectionnées
              <Badge variant="default">
                {selectedDeclarations.size} élément{selectedDeclarations.size > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from(selectedDeclarations).map(declarationKey => {
              const declaration = declarationDefinitions[declarationKey];
              return (
                <div key={declarationKey} className="border-l-4 border-green-200 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 flex items-center gap-2">
                      <span className="text-lg">{declaration.icon}</span>
                      {declaration.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {declaration.category}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Déclaration sélectionnée - Statut à définir dans les détails
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
        <Button
          onClick={prevStep}
          variant="secondary"
          className="flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Retour
        </Button>
        <Button
          onClick={onSubmit}
          className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 text-white"
        >
          <Check className="w-4 h-4" /> Créer l'Historique Fiscal
        </Button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep />;
      case 1:
        return <VersementsStep />;
      case 2:
        return <DeclarationsStep />;
      case 3:
        return <ReviewStep />;
      default:
        return <BasicInfoStep />;
    }
  };

  return renderStep();
};

export default FormSteps;