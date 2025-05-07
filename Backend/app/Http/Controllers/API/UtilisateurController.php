<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UtilisateurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get only active users
        $utilisateurs = Utilisateur::where('statut_utilisateur', 'actif')->get();
        return response()->json($utilisateurs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_utilisateur' => 'required|string|max:255',
            'prenom_utilisateur' => 'required|string|max:255',
            'password' => 'required|string|min:6',
            'CIN_utilisateur' => 'required|string|unique:utilisateurs,CIN_utilisateur',
            'Ntele_utilisateur' => 'nullable|string|max:20',
            'email_utilisateur' => 'required|email|unique:utilisateurs,email_utilisateur',
            'dateIntri_utilisateur' => 'date|nullable',
            'adresse_utilisateur' => 'required|string',
            'role_utilisateur' => ['required', Rule::in(['admin', 'consultant'])],
            'statut_utilisateur' => ['nullable', Rule::in(['actif', 'inactif'])],
        ]);

        $validated['password'] = Hash::make($validated['password']);
        // Set default status to active if not provided
        $validated['statut_utilisateur'] = $validated['statut_utilisateur'] ?? 'actif';
        
        $utilisateur = Utilisateur::create($validated);

        return response()->json($utilisateur, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $utilisateur = Utilisateur::find($id);

        if (!$utilisateur) {
            return response()->json(['message' => 'Utilisateur not found'], 404);
        }

        return response()->json($utilisateur);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $utilisateur = Utilisateur::find($id);
        if (!$utilisateur) {
            return response()->json(['message' => 'Utilisateur not found'], 404);
        }
        
        $validated = $request->validate([
            'nom_utilisateur' => 'sometimes|required|string|max:255',
            'prenom_utilisateur' => 'sometimes|required|string|max:255',
            'password' => 'sometimes|required|string|min:6',
            'CIN_utilisateur' => ['sometimes','required','string', Rule::unique('utilisateurs', 'CIN_utilisateur')->ignore($utilisateur->id_utilisateur, 'id_utilisateur')],
            'Ntele_utilisateur' => 'nullable|string|max:20',
            'email_utilisateur' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('utilisateurs', 'email_utilisateur')->ignore($utilisateur->id_utilisateur, 'id_utilisateur')
            ],
            'dateIntri_utilisateur' => 'date|nullable',
            'adresse_utilisateur' => 'sometimes|required|string',
            'role_utilisateur' => ['sometimes', 'required', Rule::in(['admin', 'consultant'])],
            'statut_utilisateur' => ['sometimes', 'required', Rule::in(['actif', 'inactif'])],
        ]);
        
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $utilisateur->update($validated);

        return response()->json($utilisateur);
    }

    /**
     * Soft delete: mark user as inactive instead of deleting
     */
    public function deactivate($id)
    {
        $utilisateur = Utilisateur::find($id);
        
        if (!$utilisateur) {
            return response()->json(['message' => 'Utilisateur not found'], 404);
        }

        $utilisateur->update([
            'archived_at' => now()->toDateString(),
            'statut_utilisateur' => 'inactif'
        ]);

        return response()->json(['message' => 'Utilisateur archived successfully']);
    }

    /**
     * Restore an archived user by setting status to active
     */
    public function restore($id)
    {
        $utilisateur = Utilisateur::find($id);
    
        if (!$utilisateur) {
            return response()->json(['message' => 'Utilisateur not found'], 404);
        }

        $utilisateur->update([
            'statut_utilisateur' => 'actif'
        ]);

        return response()->json(['message' => 'Utilisateur restored successfully']);
    }

    /**
     * Permanently remove the specified resource from storage.
     * This will be used in the archive page for permanent deletion.
     */
    public function destroy($id)
{
    $utilisateur = Utilisateur::find($id);

    if (!$utilisateur) {
        return response()->json(['message' => 'Utilisateur not found'], 404);
    }

    if ($utilisateur->clients()->exists()) {
        return response()->json(['message' => 'Cannot delete utilisateur, they have associated clients'], 400);
    }
    $utilisateur->delete();

    return response()->json(['message' => 'Utilisateur deleted permanently']);
}

    /**
     * Get all archived (inactive) users
     */
    public function getArchived()
    {
        try {
            $archived = Utilisateur::where('statut_utilisateur', 'inactif')->get();
            return response()->json($archived);
        } catch (\Exception $e) {
            \Log::error('Error fetching archived users: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function simpleTest()
    {
        return response()->json(['message' => 'Controller test working']);
    }
}