<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AGO;
use App\Models\EtapAgo;
use App\Models\Client;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class AgoController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $agos = AGO::with([
            'client:id_client,nom_client,prenom_client,raisonSociale,statut_client',
            'etapes'
        ])->whereHas('client', function($query) {
            $query->where('statut_client', 'actif');
        })->get();
        
        $formattedAgos = $agos->map(function ($ago) {
            return [
                'id' => $ago->id,
                'ago_date' => $ago->ago_date,
                'annee' => $ago->annee,
                'decision_type' => $ago->decision_type,
                'ran_amount' => $ago->ran_amount,
                'tpa_amount' => $ago->tpa_amount,
                'dividendes_nets' => $ago->dividendes_nets,
                'commentaire' => $ago->commentaire,
                'id_client' => $ago->id_client,
                'client_nom' => $ago->client->nom_client,
                'raisonSociale' => $ago->client->raisonSociale,
                'client_prenom' => $ago->client->prenom_client,
                'etapes' => $ago->etapes,
                'created_at' => $ago->created_at,
                'updated_at' => $ago->updated_at
            ];
        });
        
        return response()->json([
            'status' => 'success',
            'data' => $formattedAgos
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ago_date' => 'required|date',
            'annee' => 'required|integer|min:2000|max:2100',
            'decision_type' => 'required|in:RAN,DISTRIBUTION',
            'ran_amount' => 'sometimes|numeric|nullable',
            'tpa_amount' => 'sometimes|numeric|nullable',
            'dividendes_nets' => 'sometimes|numeric|nullable',
            'commentaire' => 'sometimes|string|nullable',
            'id_client' => 'required|exists:clients,id_client',
            'etapes' => 'sometimes|array',
            'etapes.*.titre' => 'required_with:etapes|string|max:255',
            'etapes.*.statut' => 'required_with:etapes|in:oui,non',
            'etapes.*.commentaire' => 'sometimes|string|nullable',
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
            
            $client = Client::findOrFail($request->id_client);
            
            // Check if AGO already exists for this client and year
            $existingAgo = AGO::where('id_client', $request->id_client)
                            ->where('annee', $request->annee)
                            ->first();
            
            if ($existingAgo) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Une AGO existe déjà pour ce client et cette année'
                ], 422);
            }
            
            $ago = AGO::create([
                'id_client' => $request->id_client,
                'ago_date' => $request->ago_date,
                'annee' => $request->annee,
                'decision_type' => $request->decision_type,
                'ran_amount' => $request->ran_amount,
                'tpa_amount' => $request->tpa_amount,
                'dividendes_nets' => $request->dividendes_nets,
                'commentaire' => $request->commentaire,
            ]);

            // Create etapes if provided
            if ($request->has('etapes') && is_array($request->etapes)) {
                foreach ($request->etapes as $etapeData) {
                    EtapAgo::create([
                        'id_ago' => $ago->id,
                        'titre' => $etapeData['titre'],
                        'statut' => $etapeData['statut'],
                        'commentaire' => $etapeData['commentaire'] ?? null
                    ]);
                }
            }
            
            $agoWithClient = AGO::with([
                'client:id_client,nom_client,prenom_client,raisonSociale',
                'etapes'
            ])->find($ago->id);
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'ago' => [
                        'id' => $agoWithClient->id,
                        'ago_date' => $agoWithClient->ago_date,
                        'annee' => $agoWithClient->annee,
                        'decision_type' => $agoWithClient->decision_type,
                        'ran_amount' => $agoWithClient->ran_amount,
                        'tpa_amount' => $agoWithClient->tpa_amount,
                        'dividendes_nets' => $agoWithClient->dividendes_nets,
                        'commentaire' => $agoWithClient->commentaire,
                        'id_client' => $agoWithClient->id_client,
                        'client_nom' => $agoWithClient->client->nom_client ?? null,
                        'client_prenom' => $agoWithClient->client->prenom_client ?? null,
                        'raisonSociale' => $agoWithClient->client->raisonSociale ?? null,
                        'etapes' => $agoWithClient->etapes,
                        'created_at' => $agoWithClient->created_at,
                        'updated_at' => $agoWithClient->updated_at,
                    ]
                ]
            ]);
            
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
            $ago = AGO::with([
                'client:id_client,nom_client,prenom_client,raisonSociale',
                'etapes'
            ])->findOrFail($id);
            
            $formattedAgo = [
                'id' => $ago->id,
                'ago_date' => $ago->ago_date,
                'annee' => $ago->annee,
                'decision_type' => $ago->decision_type,
                'ran_amount' => $ago->ran_amount,
                'tpa_amount' => $ago->tpa_amount,
                'dividendes_nets' => $ago->dividendes_nets,
                'commentaire' => $ago->commentaire,
                'id_client' => $ago->id_client,
                'client_nom' => $ago->client->nom_client,
                'client_prenom' => $ago->client->prenom_client,
                'raisonSociale' => $ago->client->raisonSociale,
                'etapes' => $ago->etapes,
                'created_at' => $ago->created_at,
                'updated_at' => $ago->updated_at
            ];
            
            return response()->json([
                'status' => 'success',
                'data' => $formattedAgo
            ], 200);
            
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'AGO introuvable'
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
            'ago_date' => 'sometimes|required|date',
            'annee' => 'sometimes|required|integer|min:2000|max:2100',
            'decision_type' => 'sometimes|required|in:RAN,DISTRIBUTION',
            'ran_amount' => 'sometimes|numeric|nullable',
            'tpa_amount' => 'sometimes|numeric|nullable',
            'dividendes_nets' => 'sometimes|numeric|nullable',
            'commentaire' => 'sometimes|string|nullable',
            'id_client' => 'sometimes|required|exists:clients,id_client',
            'etapes' => 'sometimes|array',
            'etapes.*.id' => 'sometimes|exists:etap_agos,id',
            'etapes.*.titre' => 'sometimes|string|max:255',
            'etapes.*.statut' => 'sometimes|in:oui,non',
            'etapes.*.commentaire' => 'sometimes|string|nullable',
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
            
            $ago = AGO::findOrFail($id);
            
            // Check if trying to change year and it conflicts with existing AGO
            if ($request->has('annee') && $request->annee != $ago->annee) {
                $existingAgo = AGO::where('id_client', $ago->id_client)
                                ->where('annee', $request->annee)
                                ->where('id', '!=', $id)
                                ->first();
                
                if ($existingAgo) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Une AGO existe déjà pour ce client et cette année'
                    ], 422);
                }
            }
            
            // Update only the fields that are provided in the request
            $updateData = $request->only([
                'ago_date', 'annee', 'decision_type', 'ran_amount', 
                'tpa_amount', 'dividendes_nets', 'commentaire', 'id_client'
            ]);
            
            // Filter out null/empty values to avoid overwriting existing data
            $updateData = array_filter($updateData, function($value) {
                return $value !== null && $value !== '';
            });
            
            $ago->update($updateData);
            
            // Update etapes if provided
            if ($request->has('etapes') && is_array($request->etapes)) {
                foreach ($request->etapes as $etapeData) {
                    if (isset($etapeData['id'])) {
                        // Update existing etape
                        $etape = EtapAgo::where('id', $etapeData['id'])
                            ->where('id_ago', $ago->id)
                            ->first();
                        
                        if ($etape) {
                            $etape->update([
                                'titre' => $etapeData['titre'],
                                'statut' => $etapeData['statut'],
                                'commentaire' => $etapeData['commentaire'] ?? null
                            ]);
                        }
                    } else {
                        // Create new etape if no ID is provided
                        EtapAgo::create([
                            'id_ago' => $ago->id,
                            'titre' => $etapeData['titre'],
                            'statut' => $etapeData['statut'],
                            'commentaire' => $etapeData['commentaire'] ?? null
                        ]);
                    }
                }
            }
            
            $updatedAgo = AGO::with([
                'client:id_client,nom_client,prenom_client,raisonSociale',
                'etapes'
            ])->find($ago->id);
    
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'ago' => [
                        'id' => $updatedAgo->id,
                        'ago_date' => $updatedAgo->ago_date,
                        'annee' => $updatedAgo->annee,
                        'decision_type' => $updatedAgo->decision_type,
                        'ran_amount' => $updatedAgo->ran_amount,
                        'tpa_amount' => $updatedAgo->tpa_amount,
                        'dividendes_nets' => $updatedAgo->dividendes_nets,
                        'commentaire' => $updatedAgo->commentaire,
                        'id_client' => $updatedAgo->id_client,
                        'client_nom' => $updatedAgo->client->nom_client ?? null,
                        'client_prenom' => $updatedAgo->client->prenom_client ?? null,
                        'raisonSociale' => $updatedAgo->client->raisonSociale ?? null,
                        'etapes' => $updatedAgo->etapes,
                        'created_at' => $updatedAgo->created_at,
                        'updated_at' => $updatedAgo->updated_at,
                    ]
                ]
            ]);
            
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'AGO ou etape introuvable'
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
            $ago = AGO::findOrFail($id);
            $ago->delete(); // This will cascade delete etapes too
            
            return response()->json([
                'status' => 'success',
                'message' => 'AGO supprimée avec succès'
            ], 200);
            
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'AGO introuvable'
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
     * Get AGOs by client ID
     */
    public function getByClientId($clientId)
    {
        try {
            $agos = AGO::where('id_client', $clientId)
                ->with('etapes')
                ->get();
            return response()->json([
                'status' => 'success',
                'data' => $agos
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
     * Add etape to existing AGO
     */
    public function addEtape(Request $request, $agoId)
    {
        $validator = Validator::make($request->all(), [
            'titre' => 'required|string|max:255',
            'statut' => 'required|in:oui,non',
            'commentaire' => 'sometimes|string|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $ago = AGO::findOrFail($agoId);
            
            $etape = EtapAgo::create([
                'id_ago' => $ago->id,
                'titre' => $request->titre,
                'statut' => $request->statut,
                'commentaire' => $request->commentaire
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $etape
            ], 201);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'AGO introuvable'
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
     * Update etape
     */
    public function updateEtape(Request $request, $etapeId)
    {
        $validator = Validator::make($request->all(), [
            'titre' => 'sometimes|required|string|max:255',
            'statut' => 'sometimes|required|in:oui,non',
            'commentaire' => 'sometimes|string|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $etape = EtapAgo::findOrFail($etapeId);
            $etape->update($request->only(['titre', 'statut', 'commentaire']));

            return response()->json([
                'status' => 'success',
                'data' => $etape
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Etape introuvable'
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