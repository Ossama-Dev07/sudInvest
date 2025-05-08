<?php

// namespace App\Http\Controllers\API;

// use App\Http\Controllers\Controller;
// use Illuminate\Http\Request;
// use App\Models\Client;
// use Illuminate\Support\Facades\Validator;
// use Carbon\Carbon;

// class ClientController extends Controller
// {
//     /**
//      * Display a listing of the resource.
//      */
//     public function index()
//     {
//         $clients = Client::all();
//         return response()->json($clients);
//     }

//     /**
//      * Store a newly created resource in storage.
//      */
//     public function store(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//             'id_fiscal' => 'required|numeric',
//             'nom_client' => 'nullable|string|max:255',
//             'prenom_client' => 'nullable|string|max:255',
//             'raisonSociale' => 'nullable|string|max:255',
//             'CIN_client' => 'required|string|max:255',
//             'rc' => 'required|string|max:255',
//             'telephone' => 'nullable|string|max:255',
//             'type' => 'required|in:pp,pm',
//             'email' => 'nullable|email|max:255',
//             'adresse' => 'nullable|string',
//             'datecreation' => 'required|date',
//             'date_collaboration' => 'nullable|date',
//             'ice' => 'nullable|string|max:255',
//             'taxe_profes' => 'nullable|string|max:255',
//             'activite' => 'required|string|max:255',
//             'statut_client' => 'required|in:actif,inactif',
//             'id_utilisateur' => 'required|exists:utilisateurs,id_utilisateur',
//         ]);

//         if ($validator->fails()) {
//             return response()->json([
//                 'status' => 'error',
//                 'message' => 'Validation failed',
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         $client = Client::create($request->all());

//         return response()->json([
//             'status' => 'success',
//             'message' => 'Client created successfully',
//             'data' => $client
//         ], 201);
//     }

//     /**
//      * Display the specified resource.
//      */
//     public function show(string $id)
//     {
//         $client = Client::find($id);
        
//         if (!$client) {
//             return response()->json([
//                 'status' => 'error',
//                 'message' => 'Client not found'
//             ], 404);
//         }
        
//         return response()->json([
//             'status' => 'success',
//             'data' => $client
//         ]);
//     }

//     /**
//      * Update the specified resource in storage.
//      */
//     public function update(Request $request, string $id)
//     {
//         $client = Client::find($id);
        
//         if (!$client) {
//             return response()->json([
//                 'status' => 'error',
//                 'message' => 'Client not found'
//             ], 404);
//         }
        
//         $validator = Validator::make($request->all(), [
//             'id_fiscal' => 'numeric',
//             'nom_client' => 'nullable|string|max:255',
//             'prenom_client' => 'nullable|string|max:255',
//             'raisonSociale' => 'nullable|string|max:255',
//             'CIN_client' => 'string|max:255',
//             'rc' => 'string|max:255',
//             'telephone' => 'nullable|string|max:255',
//             'type' => 'in:pp,pm',
//             'email' => 'email|max:255',
//             'adresse' => 'nullable|string',
//             'datecreation' => 'date',
//             'date_collaboration' => 'nullable|date',
//             'ice' => 'nullable|string|max:255',
//             'taxe_profes' => 'nullable|string|max:255',
//             'activite' => 'string|max:255',
//             'statut_client' => 'in:actif,inactif',
//             'id_utilisateur' => 'exists:utilisateurs,id_utilisateur',
//         ]);

//         if ($validator->fails()) {
//             return response()->json([
//                 'status' => 'error',
//                 'message' => 'Validation failed',
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         $client->update($request->all());
        
//         return response()->json([
//             'status' => 'success',
//             'message' => 'Client updated successfully',
//             'data' => $client
//         ]);
//     }

//     /**
//      * Remove the specified resource from storage.
//      */
//     public function destroy(string $id)
//     {
//         $client = Client::find($id);
        
//         if (!$client) {
//             return response()->json([
//                 'status' => 'error',
//                 'message' => 'Client not found'
//             ], 404);
//         }
        
//         $client->delete();
        
//         return response()->json([
//             'status' => 'success',
//             'message' => 'Client deleted successfully'
//         ]);
//     }
// }

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\LogsAction;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $clients = Client::all();
        return response()->json($clients);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_fiscal' => 'required|numeric',
            'nom_client' => 'nullable|string|max:255',
            'prenom_client' => 'nullable|string|max:255',
            'raisonSociale' => 'nullable|string|max:255',
            'CIN_client' => 'required|string|max:255',
            'rc' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:255',
            'type' => 'required|in:pp,pm',
            'email' => 'nullable|email|max:255',
            'adresse' => 'nullable|string',
            'datecreation' => 'required|date',
            'date_collaboration' => 'nullable|date',
            'ice' => 'nullable|string|max:255',
            'taxe_profes' => 'nullable|string|max:255',
            'activite' => 'required|string|max:255',
            'statut_client' => 'required|in:actif,inactif',
            'id_utilisateur' => 'required|exists:utilisateurs,id_utilisateur',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $client = Client::create($request->all());
        
        // Get the utilisateur information
        $utilisateur = Utilisateur::find($request->id_utilisateur);
        
        // Create log for add action
        $this->createLog(
            'add',
            "User {$utilisateur->nom_utilisateur} {$utilisateur->prenom_utilisateur} added client {$client->nom_client} {$client->prenom_client}",
            $request->id_utilisateur
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Client created successfully',
            'data' => $client
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $client = Client::find($id);
        
        if (!$client) {
            return response()->json([
                'status' => 'error',
                'message' => 'Client not found'
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $client
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $client = Client::find($id);
        
        if (!$client) {
            return response()->json([
                'status' => 'error',
                'message' => 'Client not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'id_fiscal' => 'numeric',
            'nom_client' => 'nullable|string|max:255',
            'prenom_client' => 'nullable|string|max:255',
            'raisonSociale' => 'nullable|string|max:255',
            'CIN_client' => 'string|max:255',
            'rc' => 'string|max:255',
            'telephone' => 'nullable|string|max:255',
            'type' => 'in:pp,pm',
            'email' => 'email|max:255|unique:clients,email_client',
            'adresse' => 'nullable|string',
            'datecreation' => 'date',
            'date_collaboration' => 'nullable|date',
            'ice' => 'nullable|string|max:255',
            'taxe_profes' => 'nullable|string|max:255',
            'activite' => 'string|max:255',
            'statut_client' => 'in:actif,inactif',
            'id_utilisateur' => 'exists:utilisateurs,id_utilisateur',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Get id_utilisateur from request or current authenticated user
        $id_utilisateur = $request->id_utilisateur ?? $client->id_utilisateur;
        
        // Get the utilisateur information
        $utilisateur = Utilisateur::find($id_utilisateur);
        
        // Create log for update action
        $this->createLog(
            'update',
            "User {$utilisateur->nom_utilisateu} {$utilisateur->prenom_utilisateu} updated client {$client->nom_client} {$client->prenom_client}",
            $id_utilisateur
        );

        $client->update($request->all());
        
        return response()->json([
            'status' => 'success',
            'message' => 'Client updated successfully',
            'data' => $client
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $client = Client::find($id);
        
        if (!$client) {
            return response()->json([
                'status' => 'error',
                'message' => 'Client not found'
            ], 404);
        }
        
        $utilisateur = Utilisateur::find($client->id_utilisateur);
        
        // Create log for delete action
        $this->createLog(
            'delete',
            "User {$utilisateur->nom_utilisateu} {$utilisateur->prenom_utilisateu} deleted client {$client->nom_client} {$client->prenom_client}",
            $client->id_utilisateur
        );
        
        $client->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Client deleted successfully'
        ]);
    }
    
    /**
     * Create a log entry for user actions
     */
    private function createLog($type_action, $description, $id_utilisateur)
    {
        LogsAction::create([
            'type_action' => $type_action,
            'description' => $description,
            'id_utilisateur' => $id_utilisateur,
        ]);
    }
}