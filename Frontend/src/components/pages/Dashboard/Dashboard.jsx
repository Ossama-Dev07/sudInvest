// import React from 'react'

// export default function Dashboard() {
//   return (
//     <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
//       <div className="grid auto-rows-min gap-4 md:grid-cols-3">
//         <div className="aspect-video rounded-xl bg-muted/50" />
//         <div className="aspect-video rounded-xl bg-muted/50" />
//         <div className="aspect-video rounded-xl bg-muted/50" />
//       </div>
//       <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
//     </div>
//   );
// }
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, FileText, Users, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function HistoriqueJuridiqueMultiStep() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Informations de base
    date_modification: '',
    objet: '',
    montant: '',
    id_client: '',
    description: '',
    
    // Étapes de suivi
    etape_enregistrement: 'non',
    commentaire_enregistrement: '',
    etape_taxe_professionnelle: 'non',
    commentaire_taxe_professionnelle: '',
    etape_step3: 'non',
    commentaire_step3: '',
    etape_step4: 'non',
    commentaire_step4: '',
    statut_global: 'en_cours'
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { id: "basic", title: "Informations de Base", icon: FileText },
    { id: "client", title: "Client & Description", icon: Users },
    { id: "tracking", title: "Étapes de Suivi", icon: ClipboardList },
    { id: "review", title: "Révision", icon: Check }
  ];

  const validateStep = (stepIndex) => {
    const newErrors = {};
    
    if (stepIndex === 0) {
      if (!formData.date_modification) newErrors.date_modification = 'Date de modification requise';
      if (!formData.objet) newErrors.objet = 'Objet requis';
      if (!formData.montant) newErrors.montant = 'Montant requis';
    } else if (stepIndex === 1) {
      if (!formData.id_client) newErrors.id_client = 'Client requis';
      if (!formData.description) newErrors.description = 'Description requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Données du formulaire:", formData);
    alert("Historique juridique créé avec succès!");
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                  index < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : index === currentStep
                    ? "border-primary text-primary bg-primary/10"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <div className="mt-3 text-center">
                <div
                  className={`text-sm font-medium ${
                    index <= currentStep ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-20 h-0.5 mx-4 ${
                  index < currentStep ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full mx-auto h-full">
      <Card className="shadow-lg">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-3xl font-bold">
            Créer un Nouvel Historique Juridique
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Suivez les étapes ci-dessous pour créer un historique juridique complet
          </p>
        </CardHeader>
        
        <CardContent className="p-8">
          <StepIndicator />
          
          <div className="space-y-6">
            {/* Étape 1: Informations de Base */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date_modification">
                      Date de Modification <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="date_modification"
                      type="date"
                      value={formData.date_modification}
                      onChange={(e) => handleInputChange('date_modification', e.target.value)}
                      className={errors.date_modification ? 'border-destructive' : ''}
                    />
                    {errors.date_modification && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.date_modification}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="objet">
                      Objet <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.objet} onValueChange={(value) => handleInputChange('objet', value)}>
                      <SelectTrigger className={errors.objet ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Sélectionner un objet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Conseil stratégique">Conseil stratégique</SelectItem>
                        <SelectItem value="Rédaction de contrat">Rédaction de contrat</SelectItem>
                        <SelectItem value="Procédure judiciaire">Procédure judiciaire</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.objet && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.objet}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="montant">
                    Montant <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="montant"
                    type="number"
                    step="0.01"
                    value={formData.montant}
                    onChange={(e) => handleInputChange('montant', e.target.value)}
                    className={errors.montant ? 'border-destructive' : ''}
                    placeholder="0.00"
                  />
                  {errors.montant && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.montant}</AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button onClick={nextStep} className="flex items-center gap-2">
                    Suivant <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 2: Client & Description */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="id_client">
                    Client <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.id_client} onValueChange={(value) => handleInputChange('id_client', value)}>
                    <SelectTrigger className={errors.id_client ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client1">Client 1 - Entreprise ABC</SelectItem>
                      <SelectItem value="client2">Client 2 - Société XYZ</SelectItem>
                      <SelectItem value="client3">Client 3 - Association DEF</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.id_client && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.id_client}</AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={errors.description ? 'border-destructive' : ''}
                    placeholder="Décrivez les détails de cet historique juridique..."
                  />
                  {errors.description && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.description}</AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Précédent
                  </Button>
                  <Button onClick={nextStep} className="flex items-center gap-2">
                    Suivant <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 3: Étapes de Suivi */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Étape Enregistrement */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">1. Enregistrement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Statut</Label>
                        <Select value={formData.etape_enregistrement} onValueChange={(value) => handleInputChange('etape_enregistrement', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="non">Non</SelectItem>
                            <SelectItem value="oui">Oui</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Commentaire</Label>
                        <Textarea
                          value={formData.commentaire_enregistrement}
                          onChange={(e) => handleInputChange('commentaire_enregistrement', e.target.value)}
                          rows={2}
                          placeholder="Ajouter un commentaire pour cette étape..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Étape Taxe Professionnelle */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">2. Taxe Professionnelle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Statut</Label>
                        <Select value={formData.etape_taxe_professionnelle} onValueChange={(value) => handleInputChange('etape_taxe_professionnelle', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="non">Non</SelectItem>
                            <SelectItem value="oui">Oui</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Commentaire</Label>
                        <Textarea
                          value={formData.commentaire_taxe_professionnelle}
                          onChange={(e) => handleInputChange('commentaire_taxe_professionnelle', e.target.value)}
                          rows={2}
                          placeholder="Ajouter un commentaire pour cette étape..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Étapes personnalisables */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">3. Étape 3 (à personnaliser)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Statut</Label>
                        <Select value={formData.etape_step3} onValueChange={(value) => handleInputChange('etape_step3', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="non">Non</SelectItem>
                            <SelectItem value="oui">Oui</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Commentaire</Label>
                        <Textarea
                          value={formData.commentaire_step3}
                          onChange={(e) => handleInputChange('commentaire_step3', e.target.value)}
                          rows={2}
                          placeholder="Ajouter un commentaire pour cette étape..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">4. Étape 4 (à personnaliser)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Statut</Label>
                        <Select value={formData.etape_step4} onValueChange={(value) => handleInputChange('etape_step4', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="non">Non</SelectItem>
                            <SelectItem value="oui">Oui</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Commentaire</Label>
                        <Textarea
                          value={formData.commentaire_step4}
                          onChange={(e) => handleInputChange('commentaire_step4', e.target.value)}
                          rows={2}
                          placeholder="Ajouter un commentaire pour cette étape..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Statut Global */}
                <div className="space-y-2">
                  <Label>Statut Global</Label>
                  <Select value={formData.statut_global} onValueChange={(value) => handleInputChange('statut_global', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en_cours">En Cours</SelectItem>
                      <SelectItem value="termine">Terminé</SelectItem>
                      <SelectItem value="suspendu">Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Précédent
                  </Button>
                  <Button onClick={nextStep} className="flex items-center gap-2">
                    Suivant <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 4: Révision */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Révision de vos informations</h3>
                  <p className="text-muted-foreground">
                    Veuillez vérifier vos détails avant de créer l'historique juridique.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Informations de base */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Informations de Base</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date de modification:</span>
                          <span className="font-medium">{formData.date_modification}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Objet:</span>
                          <span className="font-medium">{formData.objet}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Montant:</span>
                          <span className="font-medium">{formData.montant} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Client:</span>
                          <span className="font-medium">{formData.id_client}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-muted-foreground text-sm">Description:</span>
                        <p className="font-medium text-sm mt-1">{formData.description}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Étapes de suivi */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Étapes de Suivi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">1. Enregistrement:</span>
                          <span className={`font-medium ${formData.etape_enregistrement === 'oui' ? 'text-green-600' : 'text-red-600'}`}>
                            {formData.etape_enregistrement === 'oui' ? 'Oui' : 'Non'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">2. Taxe Professionnelle:</span>
                          <span className={`font-medium ${formData.etape_taxe_professionnelle === 'oui' ? 'text-green-600' : 'text-red-600'}`}>
                            {formData.etape_taxe_professionnelle === 'oui' ? 'Oui' : 'Non'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">3. Étape 3:</span>
                          <span className={`font-medium ${formData.etape_step3 === 'oui' ? 'text-green-600' : 'text-red-600'}`}>
                            {formData.etape_step3 === 'oui' ? 'Oui' : 'Non'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">4. Étape 4:</span>
                          <span className={`font-medium ${formData.etape_step4 === 'oui' ? 'text-green-600' : 'text-red-600'}`}>
                            {formData.etape_step4 === 'oui' ? 'Oui' : 'Non'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Statut Global:</span>
                          <span className={`font-medium px-2 py-1 rounded text-xs ${
                            formData.statut_global === 'termine' ? 'bg-green-100 text-green-800' :
                            formData.statut_global === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {formData.statut_global === 'en_cours' ? 'En Cours' :
                             formData.statut_global === 'termine' ? 'Terminé' : 'Suspendu'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Retour
                  </Button>
                  <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Créer l'Historique
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}