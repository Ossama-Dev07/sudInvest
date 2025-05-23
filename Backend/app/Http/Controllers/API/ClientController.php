<?php


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
        $clients = Client::where('statut_client', 'actif')->get();

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
            'telephone2' => 'nullable|string|max:255',
            'type' => 'required|in:pp,pm',
            'email' => 'nullable|email|max:255|unique:clients,email',
            'email_2' => 'nullable|email|max:255|unique:clients,email_2',
            'adresse' => 'nullable|string',
            'datecreation' => 'required|date',
            'date_collaboration' => 'nullable|date',
            'ice' => 'nullable|string|max:255',
            'taxe_profes' => 'nullable|string|max:255',
            'activite' => 'nullable|string|max:255',
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
        $clientIdentification = (!empty($client->nom_client) || !empty($client->prenom_client)) 
        ? trim($client->nom_client . ' ' . $client->prenom_client) 
        : $client->raisonSociale;
        // Create log for add action
        $this->createLog(
            'add',
            "L'utilisateur  {$utilisateur->nom_utilisateur} {$utilisateur->prenom_utilisateur} a ajouté le client {$clientIdentification}",
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
            'email' => 'nullable|email|max:255|unique:clients,email,' . $client->id_client . ',id_client',
            // Ensure the email is unique except for the current client
            'adresse' => 'nullable|string',
            'datecreation' => 'date',
            'date_collaboration' => 'nullable|date',
            'ice' => 'nullable|string|max:255',
            'taxe_profes' => 'nullable|string|max:255',
            'activite' => 'nullable|string|max:255',
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
        $id_utilisateur = Auth::user()->id_utilisateur;
        
        // Get the utilisateur information
        
        $client->update($request->all());
        
        $utilisateur = Utilisateur::find($id_utilisateur);
        $clientIdentification = (!empty($client->nom_client) || !empty($client->prenom_client)) 
        ? trim($client->nom_client . ' ' . $client->prenom_client) 
        : $client->raisonSociale;
        
        // Create log for update action
        $this->createLog(
            'update',
            "L'utilisateur  {$utilisateur->nom_utilisateur} {$utilisateur->prenom_utilisateur} a mis à jour le client{$clientIdentification}",
            $id_utilisateur
        );
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
        $id_utilisateur = Auth::user()->id_utilisateur;
        $utilisateur = Utilisateur::find($id_utilisateur);
        $clientIdentification = (!empty($client->nom_client) || !empty($client->prenom_client)) 
        ? trim($client->nom_client . ' ' . $client->prenom_client) 
        : $client->raisonSociale;
        // Create log for delete action
        $this->createLog(
            'delete',
            "L'utilisateur  {$utilisateur->nom_utilisateur} {$utilisateur->prenom_utilisateur} a supprimé le client {$clientIdentification}",
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
    public function restore($id)
    {
        $client = Client::find($id);

        if (!$client) {
            return response()->json([
                'status' => 'error',
                'message' => 'Client not found'
            ], 404);
        }

        // Restore client (set `statut_client` back to active or appropriate status)
        $client->statut_client = 'actif';  // Assuming 'actif' is for active clients
        $client->save();
        $id_utilisateur = Auth::user()->id_utilisateur;
        $utilisateur = Utilisateur::find($id_utilisateur);
        
        // Create log for delete action
        $clientIdentification = (!empty($client->nom_client) || !empty($client->prenom_client)) 
        ? trim($client->nom_client . ' ' . $client->prenom_client) 
        : $client->raisonSociale;
        $this->createLog(
            'delete',
            "L'utilisateur  {$utilisateur->nom_utilisateu} {$utilisateur->prenom_utilisateur} a restauré le client {$clientIdentification}",
            $client->id_utilisateur
        );
        
        return response()->json([
            'status' => 'success',
            'message' => 'Client restored successfully',
        ]);
    }
    public function archivedClients()
    {
        // Fetch archived clients (filter clients with 'inactif' status, assuming deactivated clients are archived)
        $archivedClients = Client::where('statut_client', 'inactif')->get();

        return response()->json([
            'status' => 'success',
            'data' => $archivedClients,
        ]);
    }
    public function deactivate($id)
    {
        $client = Client::find($id);

        if (!$client) {
            return response()->json([
                'status' => 'error',
                'message' => 'Client not found'
            ], 404);
        }

       
        $client->statut_client = 'inactif';
        $client->archived_at=now()->toDateString();  
        $client->save();
        $id_utilisateur = Auth::user()->id_utilisateur;
        $utilisateur = Utilisateur::find($id_utilisateur);
        
        // Create log for delete action
        $clientIdentification = (!empty($client->nom_client) || !empty($client->prenom_client)) 
            ? trim($client->nom_client . ' ' . $client->prenom_client) 
            : $client->raisonSociale;
        $this->createLog(
            'delete',
            "L'utilisateur  {$utilisateur->nom_utilisateur} {$utilisateur->prenom_utilisateur} a archivé le client {$clientIdentification}",
            $client->id_utilisateur
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Client deactivated successfully',
        ]);
    }
}