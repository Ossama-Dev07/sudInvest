<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HistoriqueJuridique;
use App\Models\Etapes_juridique;
use App\Models\Client;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class HistoriqueJuridiqueController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $historiques = HistoriqueJuridique::with([
            'client:id_client,nom_client,prenom_client,raisonSociale,statut_client',
            'etapes'
        ])->whereHas('client', function($query) {
            $query->where('statut_client', 'actif');
        })->get();
        
        $formattedHistoriques = $historiques->map(function ($historique) {
            return [
                'id' => $historique->id,
                'date_modification' => $historique->date_modification,
                'description' => $historique->description,
                'objet' => $historique->objet,
                'montant' => $historique->montant,
                'debours' => $historique->debours,
                'id_client' => $historique->id_client,
                'client_nom' => $historique->client->nom_client,
                'raisonSociale' => $historique->client->raisonSociale,
                'client_prenom' => $historique->client->prenom_client,
                'etapes' => $historique->etapes,
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
     * Store a newly created resource in storage.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date_modification' => 'required|date',
            'description' => 'required|string|max:255',
            'objet' => 'required|string|max:255',
            'montant' => 'required|numeric',
            'debours' => 'sometimes|numeric|nullable',
            'id_client' => 'required|exists:clients,id_client',
            'etapes' => 'sometimes|array',
            'etapes.*.titre' => 'required_with:etapes|string|max:255',
            'etapes.*.statut' => 'required_with:etapes|in:oui,non',
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
            
            $historiqueJuridique = HistoriqueJuridique::create([
                'date_modification' => $request->date_modification,
                'description' => $request->description,
                'objet' => $request->objet,
                'montant' => $request->montant,
                'debours' => $request->debours,
                'id_client' => $request->id_client,
            ]);

            // Create etapes if provided
            if ($request->has('etapes') && is_array($request->etapes)) {
                foreach ($request->etapes as $etapeData) {
                    Etapes_juridique::create([
                        'id_historique' => $historiqueJuridique->id,
                        'commentaire'=> $etapeData['commentaire'],
                        'titre' => $etapeData['titre'],
                        'statut' => $etapeData['statut']
                    ]);
                }
            }
            
            $historiqueWithClient = HistoriqueJuridique::with([
                'client:id_client,nom_client,prenom_client,raisonSociale',
                'etapes'
            ])->find($historiqueJuridique->id);
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'historique' => [
                        'id' => $historiqueWithClient->id,
                        'date_modification' => $historiqueWithClient->date_modification,
                        'description' => $historiqueWithClient->description,
                        'objet' => $historiqueWithClient->objet,
                        'montant' => $historiqueWithClient->montant,
                        'debours' => $historiqueWithClient->debours,
                        'id_client' => $historiqueWithClient->id_client,
                        'client_nom' => $historiqueWithClient->client->nom_client ?? null,
                        'client_prenom' => $historiqueWithClient->client->prenom_client ?? null,
                        'raisonSociale' => $historiqueWithClient->client->raisonSociale ?? null,
                        'etapes' => $historiqueWithClient->etapes,
                        'created_at' => $historiqueWithClient->created_at,
                        'updated_at' => $historiqueWithClient->updated_at,
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
            $historiqueJuridique = HistoriqueJuridique::with([
                'client:id_client,nom_client,prenom_client,raisonSociale',
                'etapes'
            ])->findOrFail($id);
            
            $formattedHistorique = [
                'id' => $historiqueJuridique->id,
                'date_modification' => $historiqueJuridique->date_modification,
                'description' => $historiqueJuridique->description,
                'objet' => $historiqueJuridique->objet,
                'montant' => $historiqueJuridique->montant,
                'debours' => $historiqueJuridique->debours,
                'id_client' => $historiqueJuridique->id_client,
                'client_nom' => $historiqueJuridique->client->nom_client,
                'client_prenom' => $historiqueJuridique->client->prenom_client,
                'raisonSociale' => $historiqueJuridique->client->raisonSociale,
                'etapes' => $historiqueJuridique->etapes,
                'created_at' => $historiqueJuridique->created_at,
                'updated_at' => $historiqueJuridique->updated_at
            ];
            
            return response()->json([
                'status' => 'success',
                'data' => $formattedHistorique
            ], 200);
            
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Historique juridique introuvable'
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
            'date_modification' => 'sometimes|required|date',
            'description' => 'sometimes|required|string|max:255',
            'objet' => 'sometimes|required|string|max:255',
            'montant' => 'sometimes|required|numeric',
            'debours' => 'sometimes|numeric|nullable',
            'id_client' => 'sometimes|required|exists:clients,id_client',
            'etapes' => 'sometimes|array',
            'etapes.*.id' => 'sometimes|exists:etapes_juridiques,id',
            'etapes.*.name' => 'required_with:etapes|string|max:255',
            'etapes.*.statut' => 'required_with:etapes|in:oui,non',
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
            
            $historiqueJuridique = HistoriqueJuridique::findOrFail($id);
            $historiqueJuridique->update($request->only([
                'date_modification', 'description', 'objet', 'montant', 'debours', 'id_client'
            ]));
            
            // Update etapes if provided
            if ($request->has('etapes') && is_array($request->etapes)) {
                foreach ($request->etapes as $etapeData) {
                    if (isset($etapeData['id'])) {
                        // Update existing etape
                        $etape = Etapes_juridique::findOrFail($etapeData['id']);
                        $etape->update([
                            'name' => $etapeData['name'],
                            'statut' => $etapeData['statut']
                        ]);
                    } else {
                        // Create new etape
                        Etapes_juridique::create([
                            'id_historique' => $historiqueJuridique->id,
                            'name' => $etapeData['name'],
                            'statut' => $etapeData['statut']
                        ]);
                    }
                }
            }
            
            $updatedHistorique = HistoriqueJuridique::with([
                'client:id_client,nom_client,prenom_client,raisonSociale',
                'etapes'
            ])->find($historiqueJuridique->id);
    
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'historique' => [
                        'id' => $updatedHistorique->id,
                        'date_modification' => $updatedHistorique->date_modification,
                        'description' => $updatedHistorique->description,
                        'objet' => $updatedHistorique->objet,
                        'montant' => $updatedHistorique->montant,
                        'debours' => $updatedHistorique->debours,
                        'id_client' => $updatedHistorique->id_client,
                        'client_nom' => $updatedHistorique->client->nom_client ?? null,
                        'client_prenom' => $updatedHistorique->client->prenom_client ?? null,
                        'raisonSociale' => $updatedHistorique->client->raisonSociale ?? null,
                        'etapes' => $updatedHistorique->etapes,
                        'created_at' => $updatedHistorique->created_at,
                        'updated_at' => $updatedHistorique->updated_at,
                    ]
                ]
            ]);
            
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Historique juridique ou etape introuvable'
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
            $historiqueJuridique = HistoriqueJuridique::findOrFail($id);
            $historiqueJuridique->delete(); // This will cascade delete etapes too
            
            return response()->json([
                'status' => 'success',
                'message' => 'Historique juridique supprimé avec succès'
            ], 200);
            
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Historique juridique introuvable'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getByClientId($clientId)
    {
        try {
            $historiqueJuridique = HistoriqueJuridique::where('id_client', $clientId)
                ->with('etapes')
                ->get();
            return response()->json([
                'status' => 'success',
                'data' => $historiqueJuridique
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
     * Add etape to existing historique
     */
    public function addEtape(Request $request, $historiqueId)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'statut' => 'required|in:oui,non',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $historique = HistoriqueJuridique::findOrFail($historiqueId);
            
            $etape = Etapes_juridique::create([
                'id_historique' => $historique->id,
                'name' => $request->name,
                'statut' => $request->statut
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $etape
            ], 201);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Historique juridique introuvable'
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
     * Update etape status
     */
    public function updateEtape(Request $request, $etapeId)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'statut' => 'sometimes|required|in:oui,non',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $etape = Etapes_juridique::findOrFail($etapeId);
            $etape->update($request->only(['name', 'statut']));

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