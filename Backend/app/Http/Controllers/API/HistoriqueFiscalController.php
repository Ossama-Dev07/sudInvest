<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HistoriqueFiscal;
use App\Models\PaiementFiscal;
use App\Models\DeclarationFiscal;
use App\Models\Client;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class HistoriqueFiscalController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $historiques = HistoriqueFiscal::with([
            'client:id_client,nom_client,prenom_client,raisonSociale,type,ice,id_fiscal',
            'paiements',
            'declarations'
        ])->get();
        
        $formattedHistoriques = $historiques->map(function ($historique) {
            // Calculate progress statistics
            $totalPaiements = $historique->paiements->count();
            $paiementsPayes = $historique->paiements->where('statut', 'PAYE')->count();
            
            $totalDeclarations = $historique->declarations->count();
            $declarationsDeposees = $historique->declarations->whereIn('statut_declaration', ['DEPOSEE', 'ACCEPTEE'])->count();
            
            $totalElements = $totalPaiements + $totalDeclarations;
            $completedElements = $paiementsPayes + $declarationsDeposees;
            $progressPercentage = $totalElements > 0 ? round(($completedElements / $totalElements) * 100) : 0;

            // Format client display name
            $clientDisplay = $historique->client->raisonSociale 
                ? $historique->client->raisonSociale 
                : trim(($historique->client->prenom_client ?? '') . ' ' . ($historique->client->nom_client ?? ''));

            return [
                'id' => $historique->id,
                'datecreation' => $historique->datecreation,
                'annee_fiscal' => $historique->annee_fiscal,
                'description' => $historique->description,
                'statut_global' => $historique->statut_global,
                'commentaire_general' => $historique->commentaire_general,
                'id_client' => $historique->client->id_client,
                
                // Client information for display
                'client_nom' => $historique->client->nom_client,
                'client_prenom' => $historique->client->prenom_client,
                'client_raisonSociale' => $historique->client->raisonSociale,
                'client_type' => $historique->client->type,
                'client_ice' => $historique->client->ice,
                'client_id_fiscal' => $historique->client->id_fiscal,
                'client_display' => $clientDisplay,
                
                // Progress statistics
                'progress_percentage' => $progressPercentage,
                'total_paiements' => $totalPaiements,
                'paiements_payes' => $paiementsPayes,
                'total_declarations' => $totalDeclarations,
                'declarations_deposees' => $declarationsDeposees,
                'total_elements' => $totalElements,
                'completed_elements' => $completedElements,
                
                // Related data
                'paiements' => $historique->paiements,
                'declarations' => $historique->declarations,
                'created_at' => $historique->created_at,
                'updated_at' => $historique->updated_at
            ];
        });
        
        return response()->json([
            'status' => 'success',
            'data' => $formattedHistoriques
        ], 200);
    }

    /**
     * Store a newly created resource with payments and declarations.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_client' => 'required|exists:clients,id_client',
            'annee_fiscal' => 'required|string|max:4',
            'description' => 'required|string|max:1000',
            'statut_global' => 'sometimes|in:EN_COURS,COMPLETE,EN_RETARD',
            'commentaire_general' => 'nullable|string|max:2000',
            
            // Paiements validation
            'paiements' => 'sometimes|array',
            'paiements.*.type_impot' => 'required_with:paiements|string|max:100',
            'paiements.*.periode' => 'required_with:paiements|in:MENSUEL,TRIMESTRIEL,ANNUEL',
            'paiements.*.periode_numero' => 'nullable|integer|min:1|max:12',
            'paiements.*.montant_du' => 'nullable|numeric|min:0',
            'paiements.*.montant_paye' => 'nullable|numeric|min:0',
            'paiements.*.date_echeance' => 'nullable|date',
            'paiements.*.date_paiement' => 'nullable|date',
            'paiements.*.statut' => 'sometimes|in:NON_PAYE,PAYE,EN_RETARD,PARTIEL',
            'paiements.*.commentaire' => 'nullable|string',
            
            // Declarations validation
            'declarations' => 'sometimes|array',
            'declarations.*.type_declaration' => 'required_with:declarations|string|max:100',
            'declarations.*.annee_declaration' => 'required_with:declarations|integer|min:2000|max:2100',
            'declarations.*.dateDeclaration' => 'nullable|date',
            'declarations.*.montant_declare' => 'nullable|numeric',
            'declarations.*.date_limite' => 'nullable|date',
            'declarations.*.statut_declaration' => 'sometimes|string',
            'declarations.*.obligatoire' => 'sometimes|boolean',
            'declarations.*.commentaire' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();
            
            // Check if historique already exists for this client and year
            $existingHistorique = HistoriqueFiscal::where('id_client', $request->id_client)
                                                ->where('annee_fiscal', $request->annee_fiscal)
                                                ->first();

            if ($existingHistorique) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Un historique fiscal existe déjà pour ce client et cette année'
                ], 422);
            }
            
            $client = Client::findOrFail($request->id_client);
            
            // Create main historique fiscal
            $historiqueFiscal = HistoriqueFiscal::create([
                'id_client' => $request->id_client,
                'annee_fiscal' => $request->annee_fiscal,
                'description' => $request->description,
                'datecreation' => now(),
                'statut_global' => $request->statut_global ?? 'EN_COURS',
                'commentaire_general' => $request->commentaire_general,
            ]);

            // Create paiements if provided
            if ($request->has('paiements') && is_array($request->paiements)) {
                foreach ($request->paiements as $paiementData) {
                    PaiementFiscal::create([
                        'id_HFiscal' => $historiqueFiscal->id,
                        'type_impot' => $paiementData['type_impot'],
                        'periode' => $paiementData['periode'],
                        'periode_numero' => $paiementData['periode_numero'] ?? null,
                        'montant_du' => $paiementData['montant_du'] ?? null,
                        'montant_paye' => $paiementData['montant_paye'] ?? 0,
                        'date_echeance' => $paiementData['date_echeance'] ?? null,
                        'date_paiement' => $paiementData['date_paiement'] ?? null,
                        'statut' => $paiementData['statut'] ?? 'NON_PAYE',
                        'commentaire' => $paiementData['commentaire'] ?? null,
                    ]);
                }
            }

            // Create declarations if provided
            if ($request->has('declarations') && is_array($request->declarations)) {
                foreach ($request->declarations as $declarationData) {
                    DeclarationFiscal::create([
                        'id_HFiscal' => $historiqueFiscal->id,
                        'type_declaration' => $declarationData['type_declaration'],
                        'annee_declaration' => $declarationData['annee_declaration'],
                        'dateDeclaration' => $declarationData['dateDeclaration'] ?? null,
                        'montant_declare' => $declarationData['montant_declare'] ?? 0,
                        'date_limite' => $declarationData['date_limite'] ?? null,
                        'statut_declaration' => $declarationData['statut_declaration'] ?? 'NON_DEPOSEE',
                        'obligatoire' => $declarationData['obligatoire'] ?? true,
                        'commentaire' => $declarationData['commentaire'] ?? null,
                    ]);
                }
            }
            
            $historiqueWithRelations = HistoriqueFiscal::with([
                'client:id_client,nom_client,prenom_client,raisonSociale,type,ice,id_fiscal',
                'paiements',
                'declarations'
            ])->find($historiqueFiscal->id);
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Historique fiscal créé avec succès',
                'data' => $historiqueWithRelations
            ], 201);
            
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Client introuvable'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * 
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function show(string $id)
    {
        try {
            $historique = HistoriqueFiscal::with([
                'client:id_client,nom_client,prenom_client,raisonSociale,type,ice,id_fiscal,telephone,email,adresse',
                'paiements',
                'declarations'
            ])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'data' => $historique
            ], 200);
            
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Historique fiscal introuvable'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'annee_fiscal' => 'sometimes|string|max:4',
            'description' => 'sometimes|string|max:1000',
            'statut_global' => 'sometimes|in:EN_COURS,COMPLETE,EN_RETARD',
            'commentaire_general' => 'nullable|string|max:2000',
            
            // Paiements validation
            'paiements' => 'sometimes|array',
            'paiements.*.id' => 'sometimes|exists:paiement_fiscals,id',
            'paiements.*.type_impot' => 'sometimes|string|max:100',
            'paiements.*.periode' => 'sometimes|in:MENSUEL,TRIMESTRIEL,ANNUEL',
            'paiements.*.periode_numero' => 'nullable|integer|min:1|max:12',
            'paiements.*.montant_du' => 'nullable|numeric|min:0',
            'paiements.*.montant_paye' => 'nullable|numeric|min:0',
            'paiements.*.date_echeance' => 'nullable|date',
            'paiements.*.date_paiement' => 'nullable|date',
            'paiements.*.statut' => 'sometimes|in:NON_PAYE,PAYE,EN_RETARD,PARTIEL',
            'paiements.*.commentaire' => 'nullable|string',
            
            // Declarations validation
            'declarations' => 'sometimes|array',
            'declarations.*.id' => 'sometimes|exists:declaration_fiscals,id',
            'declarations.*.type_declaration' => 'sometimes|string|max:100',
            'declarations.*.annee_declaration' => 'sometimes|integer|min:2000|max:2100',
            'declarations.*.dateDeclaration' => 'nullable|date',
            'declarations.*.montant_declare' => 'nullable|numeric',
            'declarations.*.date_limite' => 'nullable|date',
            'declarations.*.statut_declaration' => 'sometimes|string',
            'declarations.*.obligatoire' => 'sometimes|boolean',
            'declarations.*.commentaire' => 'nullable|string',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }
    
        try {
            DB::beginTransaction();
            
            $historique = HistoriqueFiscal::findOrFail($id);
            
            // Check for duplicate year if updating annee_fiscal
            if ($request->has('annee_fiscal') && $request->annee_fiscal != $historique->annee_fiscal) {
                $existingHistorique = HistoriqueFiscal::where('id_client', $historique->id_client)
                                                    ->where('annee_fiscal', $request->annee_fiscal)
                                                    ->where('id', '!=', $id)
                                                    ->first();

                if ($existingHistorique) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Un historique fiscal existe déjà pour ce client et cette année'
                    ], 422);
                }
            }
            
            // Update main historique
            $updateData = $request->only([
                'annee_fiscal', 'description', 'statut_global', 'commentaire_general'
            ]);
            
            $updateData = array_filter($updateData, function($value) {
                return $value !== null && $value !== '';
            });
            
            $historique->update($updateData);
            
            // Update paiements if provided
            if ($request->has('paiements') && is_array($request->paiements)) {
                foreach ($request->paiements as $paiementData) {
                    if (isset($paiementData['id'])) {
                        // Update existing paiement
                        $paiement = PaiementFiscal::where('id', $paiementData['id'])
                            ->where('id_HFiscal', $historique->id)
                            ->first();
                        
                        if ($paiement) {
                            $paiement->update([
                                'type_impot' => $paiementData['type_impot'] ?? $paiement->type_impot,
                                'periode' => $paiementData['periode'] ?? $paiement->periode,
                                'periode_numero' => $paiementData['periode_numero'] ?? $paiement->periode_numero,
                                'montant_du' => $paiementData['montant_du'] ?? $paiement->montant_du,
                                'montant_paye' => $paiementData['montant_paye'] ?? $paiement->montant_paye,
                                'date_echeance' => $paiementData['date_echeance'] ?? $paiement->date_echeance,
                                'date_paiement' => $paiementData['date_paiement'] ?? $paiement->date_paiement,
                                'statut' => $paiementData['statut'] ?? $paiement->statut,
                                'commentaire' => $paiementData['commentaire'] ?? $paiement->commentaire,
                            ]);
                        }
                    } else {
                        // Create new paiement
                        PaiementFiscal::create([
                            'id_HFiscal' => $historique->id,
                            'type_impot' => $paiementData['type_impot'],
                            'periode' => $paiementData['periode'],
                            'periode_numero' => $paiementData['periode_numero'] ?? null,
                            'montant_du' => $paiementData['montant_du'] ?? null,
                            'montant_paye' => $paiementData['montant_paye'] ?? 0,
                            'date_echeance' => $paiementData['date_echeance'] ?? null,
                            'date_paiement' => $paiementData['date_paiement'] ?? null,
                            'statut' => $paiementData['statut'] ?? 'NON_PAYE',
                            'commentaire' => $paiementData['commentaire'] ?? null,
                        ]);
                    }
                }
            }

            // Update declarations if provided
            if ($request->has('declarations') && is_array($request->declarations)) {
                foreach ($request->declarations as $declarationData) {
                    if (isset($declarationData['id'])) {
                        // Update existing declaration
                        $declaration = DeclarationFiscal::where('id', $declarationData['id'])
                            ->where('id_HFiscal', $historique->id)
                            ->first();
                        
                        if ($declaration) {
                            $declaration->update([
                                'type_declaration' => $declarationData['type_declaration'] ?? $declaration->type_declaration,
                                'annee_declaration' => $declarationData['annee_declaration'] ?? $declaration->annee_declaration,
                                'dateDeclaration' => $declarationData['dateDeclaration'] ?? $declaration->dateDeclaration,
                                'montant_declare' => $declarationData['montant_declare'] ?? $declaration->montant_declare,
                                'date_limite' => $declarationData['date_limite'] ?? $declaration->date_limite,
                                'statut_declaration' => $declarationData['statut_declaration'] ?? $declaration->statut_declaration,
                                'obligatoire' => $declarationData['obligatoire'] ?? $declaration->obligatoire,
                                'commentaire' => $declarationData['commentaire'] ?? $declaration->commentaire,
                            ]);
                        }
                    } else {
                        // Create new declaration
                        DeclarationFiscal::create([
                            'id_HFiscal' => $historique->id,
                            'type_declaration' => $declarationData['type_declaration'],
                            'annee_declaration' => $declarationData['annee_declaration'],
                            'dateDeclaration' => $declarationData['dateDeclaration'] ?? null,
                            'montant_declare' => $declarationData['montant_declare'] ?? 0,
                            'date_limite' => $declarationData['date_limite'] ?? null,
                            'statut_declaration' => $declarationData['statut_declaration'] ?? 'NON_DEPOSEE',
                            'obligatoire' => $declarationData['obligatoire'] ?? true,
                            'commentaire' => $declarationData['commentaire'] ?? null,
                        ]);
                    }
                }
            }
            
            $updatedHistorique = HistoriqueFiscal::with([
                'client:id_client,nom_client,prenom_client,raisonSociale,type,ice,id_fiscal',
                'paiements',
                'declarations'
            ])->find($historique->id);
    
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Historique fiscal mis à jour avec succès',
                'data' => $updatedHistorique
            ], 200);
            
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Historique fiscal introuvable'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * 
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(string $id)
    {
        try {
            $historique = HistoriqueFiscal::findOrFail($id);
            $historique->delete(); // This will cascade delete paiements and declarations too
            
            return response()->json([
                'status' => 'success',
                'message' => 'Historique fiscal supprimé avec succès'
            ], 200);
            
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Historique fiscal introuvable'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get historique by client ID
     */
    public function getByClientId($clientId)
    {
        try {
            $historiques = HistoriqueFiscal::where('id_client', $clientId)
                ->with(['paiements', 'declarations'])
                ->get();
                
            return response()->json([
                'status' => 'success',
                'data' => $historiques
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all clients for dropdown
     */
    public function getClients()
    {
        try {
            $clients = Client::select([
                'id_client', 'nom_client', 'prenom_client', 
                'raisonSociale', 'type', 'ice', 'id_fiscal'
            ])
            ->orderBy('raisonSociale')
            ->orderBy('nom_client')
            ->get()
            ->map(function ($client) {
                return [
                    'id_client' => $client->id_client,
                    'nom_client' => $client->nom_client,
                    'prenom_client' => $client->prenom_client,
                    'raisonSociale' => $client->raisonSociale,
                    'type' => $client->type,
                    'ice' => $client->ice,
                    'id_fiscal' => $client->id_fiscal,
                    'display_name' => $client->raisonSociale 
                        ? $client->raisonSociale 
                        : trim(($client->prenom_client ?? '') . ' ' . ($client->nom_client ?? ''))
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $clients
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des clients',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add paiement to existing historique
     */
    public function addPaiement(Request $request, $historiqueId)
    {
        $validator = Validator::make($request->all(), [
            'type_impot' => 'required|string|max:100',
            'periode' => 'required|in:MENSUEL,TRIMESTRIEL,ANNUEL',
            'periode_numero' => 'nullable|integer|min:1|max:12',
            'montant_du' => 'nullable|numeric|min:0',
            'montant_paye' => 'nullable|numeric|min:0',
            'date_echeance' => 'nullable|date',
            'date_paiement' => 'nullable|date',
            'statut' => 'sometimes|in:NON_PAYE,PAYE,EN_RETARD,PARTIEL',
            'commentaire' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $historique = HistoriqueFiscal::findOrFail($historiqueId);
            
            $paiement = PaiementFiscal::create([
                'id_HFiscal' => $historique->id,
                'type_impot' => $request->type_impot,
                'periode' => $request->periode,
                'periode_numero' => $request->periode_numero,
                'montant_du' => $request->montant_du ?? null,
                'montant_paye' => $request->montant_paye ?? 0,
                'date_echeance' => $request->date_echeance,
                'date_paiement' => $request->date_paiement,
                'statut' => $request->statut ?? 'NON_PAYE',
                'commentaire' => $request->commentaire
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Paiement ajouté avec succès',
                'data' => $paiement
            ], 201);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Historique fiscal introuvable'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add declaration to existing historique
     */
    public function addDeclaration(Request $request, $historiqueId)
    {
        $validator = Validator::make($request->all(), [
            'type_declaration' => 'required|string|max:100',
            'annee_declaration' => 'required|integer|min:2000|max:2100',
            'dateDeclaration' => 'nullable|date',
            'montant_declare' => 'nullable|numeric',
            'date_limite' => 'nullable|date',
            'statut_declaration' => 'sometimes|string',
            'obligatoire' => 'sometimes|boolean',
            'commentaire' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $historique = HistoriqueFiscal::findOrFail($historiqueId);
            
            $declaration = DeclarationFiscal::create([
                'id_HFiscal' => $historique->id,
                'type_declaration' => $request->type_declaration,
                'annee_declaration' => $request->annee_declaration,
                'dateDeclaration' => $request->dateDeclaration,
                'montant_declare' => $request->montant_declare ?? 0,
                'date_limite' => $request->date_limite,
                'statut_declaration' => $request->statut_declaration ?? 'NON_DEPOSEE',
                'obligatoire' => $request->obligatoire ?? true,
                'commentaire' => $request->commentaire
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Déclaration ajoutée avec succès',
                'data' => $declaration
            ], 201);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Historique fiscal introuvable'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update paiement status
     */
    public function updatePaiement(Request $request, $paiementId)
    {
        $validator = Validator::make($request->all(), [
            'type_impot' => 'sometimes|string|max:100',
            'periode' => 'sometimes|in:MENSUEL,TRIMESTRIEL,ANNUEL',
            'periode_numero' => 'nullable|integer|min:1|max:12',
            'montant_du' => 'nullable|numeric|min:0',
            'montant_paye' => 'nullable|numeric|min:0',
            'date_echeance' => 'nullable|date',
            'date_paiement' => 'nullable|date',
            'statut' => 'sometimes|in:NON_PAYE,PAYE,EN_RETARD,PARTIEL',
            'commentaire' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $paiement = PaiementFiscal::findOrFail($paiementId);
            $paiement->update($request->only([
                'type_impot', 'periode', 'periode_numero', 'montant_du', 
                'montant_paye', 'date_echeance', 'date_paiement', 'statut', 'commentaire'
            ]));

            return response()->json([
                'status' => 'success',
                'message' => 'Paiement mis à jour avec succès',
                'data' => $paiement
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Paiement introuvable'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update declaration status
     */
    public function updateDeclaration(Request $request, $declarationId)
    {
        $validator = Validator::make($request->all(), [
            'type_declaration' => 'sometimes|string|max:100',
            'annee_declaration' => 'sometimes|integer|min:2000|max:2100',
            'dateDeclaration' => 'nullable|date',
            'montant_declare' => 'nullable|numeric',
            'date_limite' => 'nullable|date',
            'statut_declaration' => 'sometimes|string',
            'obligatoire' => 'sometimes|boolean',
            'commentaire' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $declaration = DeclarationFiscal::findOrFail($declarationId);
            $declaration->update($request->only([
                'type_declaration', 'annee_declaration', 'dateDeclaration', 
                'montant_declare', 'date_limite', 'statut_declaration', 'obligatoire', 'commentaire'
            ]));

            return response()->json([
                'status' => 'success',
                'message' => 'Déclaration mise à jour avec succès',
                'data' => $declaration
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Déclaration introuvable'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}