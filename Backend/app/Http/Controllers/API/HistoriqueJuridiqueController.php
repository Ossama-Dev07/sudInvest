<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HistoriqueJuridique;
use App\Models\Client;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class HistoriqueJuridiqueController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $historiques = HistoriqueJuridique::with('client:id_client,nom_client,prenom_client,raisonSociale')->get();
        
        $formattedHistoriques = $historiques->map(function ($historique) {
            return [
                'id' => $historique->id,
                'date_modification' => $historique->date_modification,
                'description' => $historique->description,
                'objet' => $historique->objet,
                'montant' => $historique->montant,
                'id_client' => $historique->id_client,
                'client_nom' => $historique->client->nom_client,
                'raisonSociale' => $historique->client->raisonSociale,
                'client_prenom' => $historique->client->prenom_client ,
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
            'id_client' => 'required|exists:clients,id_client',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $client = Client::findOrFail($request->id_client);
            
            $historiqueJuridique = HistoriqueJuridique::create([
                'date_modification' => $request->date_modification,
                'description' => $request->description,
                'objet' => $request->objet,
                'montant' => $request->montant,
                'id_client' => $request->id_client,
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Historique juridique créé avec succès',
                'data' => [
                    'historique' => $historiqueJuridique,
                    'client_nom' => $client->nom_client,
                    'client_prenom' => $client->prenom_client,
                    'raisonSociale' => $client->raisonSociale
                ]
            ], 201);
            
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Client introuvable'
            ], 404);
        } catch (\Exception $e) {
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
            $historiqueJuridique = HistoriqueJuridique::with('client:id,nom_client,prenom_client,raisonSociale')->findOrFail($id);
            
            $formattedHistorique = [
                'id' => $historiqueJuridique->id,
                'date_modification' => $historiqueJuridique->date_modification,
                'description' => $historiqueJuridique->description,
                'objet' => $historiqueJuridique->objet,
                'montant' => $historiqueJuridique->montant,
                'id_client' => $historiqueJuridique->id_client,
                'client_nom' => $historiqueJuridique->client->nom_client,
                'client_prenom' => $historiqueJuridique->client->prenom_client,
                'raisonSociale' => $historiqueJuridique->client->raisonSociale,
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
            'id_client' => 'sometimes|required|exists:clients,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $historiqueJuridique = HistoriqueJuridique::findOrFail($id);
            $historiqueJuridique->update($request->all());
            
            // Get the client information
            $client = Client::findOrFail($historiqueJuridique->id_client);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Historique juridique mis à jour avec succès',
                'data' => [
                    'historique' => $historiqueJuridique,
                    'client_nom' => $client->nom_client,
                    'client_prenom' => $client->prenom_client,
                    'raisonSociale' => $client->raisonSociale
                ]
            ], 200);
            
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Historique juridique ou client introuvable'
            ], 404);
        } catch (\Exception $e) {
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
            $historiqueJuridique->delete();
            
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
}