<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\HistoriqueFiscal;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class HistoriqueFiscalController extends Controller
{
    /**
     * Display a listing of all historique fiscals with client information
     */
    public function index()
    {
        try {
            $historiques = HistoriqueFiscal::with([
                'client:id_client,nom_client,prenom_client,raisonSociale,type,ice,id_fiscal',
                'paiements:id,id_HFiscal,statut',
                'declarations:id,id_HFiscal,statut_declaration'
            ])
            ->select([
                'id', 'datecreation', 'annee_fiscal', 'description', 
                'id_client', 'statut_global', 'commentaire_general',
                'created_at', 'updated_at'
            ])
            ->orderBy('annee_fiscal', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($historique) {
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
                    'annee_fiscal' => $historique->annee_fiscal,
                    'description' => $historique->description,
                    'statut_global' => $historique->statut_global,
                    'datecreation' => $historique->datecreation->format('Y-m-d'),
                    'commentaire_general' => $historique->commentaire_general,
                    
                    // Client information for display
                    'client_id' => $historique->client->id_client,
                    'client_nom' => $historique->client->nom_client,
                    'client_prenom' => $historique->client->prenom_client,
                    'client_raisonSociale' => $historique->client->raisonSociale,
                    'client_type' => $historique->client->type, // PM or PP
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
                    
                    'created_at' => $historique->created_at,
                    'updated_at' => $historique->updated_at,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $historiques
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des historiques fiscaux',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created historique fiscal
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_client' => 'required|exists:clients,id_client',
            'annee_fiscal' => 'required|string|max:4',
            'description' => 'required|string|max:1000',
            'statut_global' => 'sometimes|in:EN_COURS,COMPLETE,EN_RETARD',
            'commentaire_general' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
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

            $historique = HistoriqueFiscal::create([
                'id_client' => $request->id_client,
                'annee_fiscal' => $request->annee_fiscal,
                'description' => $request->description,
                'datecreation' => now(),
                'statut_global' => $request->statut_global ?? 'EN_COURS',
                'commentaire_general' => $request->commentaire_general,
            ]);

            // Load the historique with client information
            $historique->load('client:id_client,nom_client,prenom_client,raisonSociale,type,ice,id_fiscal');

            return response()->json([
                'status' => 'success',
                'message' => 'Historique fiscal créé avec succès',
                'data' => $historique
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la création de l\'historique fiscal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified historique fiscal with details
     */
    public function show(string $id)
    {
        try {
            $historique = HistoriqueFiscal::with([
                'client:id_client,nom_client,prenom_client,raisonSociale,type,ice,id_fiscal,telephone,email,adresse',
                'paiements',
                'declarations'
            ])->find($id);

            if (!$historique) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Historique fiscal non trouvé'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $historique
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération de l\'historique fiscal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified historique fiscal
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'annee_fiscal' => 'sometimes|string|max:4',
            'description' => 'sometimes|string|max:1000',
            'statut_global' => 'sometimes|in:EN_COURS,COMPLETE,EN_RETARD',
            'commentaire_general' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $historique = HistoriqueFiscal::find($id);

            if (!$historique) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Historique fiscal non trouvé'
                ], 404);
            }

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

            $historique->update($request->only([
                'annee_fiscal', 'description', 'statut_global', 'commentaire_general'
            ]));

            // Load with client information
            $historique->load('client:id_client,nom_client,prenom_client,raisonSociale,type,ice,id_fiscal');

            return response()->json([
                'status' => 'success',
                'message' => 'Historique fiscal mis à jour avec succès',
                'data' => $historique
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la mise à jour de l\'historique fiscal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified historique fiscal
     */
    public function destroy(string $id)
    {
        try {
            $historique = HistoriqueFiscal::find($id);

            if (!$historique) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Historique fiscal non trouvé'
                ], 404);
            }

            $historique->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Historique fiscal supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la suppression de l\'historique fiscal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all clients for dropdown/selection
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
}