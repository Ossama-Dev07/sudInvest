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
        $utilisateurs = Utilisateur::all();
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
            'role_utilisateurt' => ['required', Rule::in(['admin', 'consultant'])],
            'statut_client' => ['nullable', Rule::in(['actif', 'inactif'])],
        ]);

        $validated['password'] = Hash::make($validated['password']);
        
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
            'CIN_utilisateur' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('utilisateurs', 'CIN_utilisateur')->ignore($utilisateur->id_utilisateur, 'id_utilisateur')
            ],
            'Ntele_utilisateur' => 'nullable|string|max:20',
            'email_utilisateur' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('utilisateurs', 'email_utilisateur')->ignore($utilisateur->id_utilisateur, 'id_utilisateur')
            ],
            'dateIntri_utilisateur' => 'date|nullable',
            'adresse_utilisateur' => 'sometimes|required|string',
            'role_utilisateurt' => ['sometimes', 'required', Rule::in(['admin', 'consultant'])],
            'statut_client' => ['sometimes', 'nullable', Rule::in(['actif', 'inactif'])],
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $utilisateur->update($validated);

        return response()->json($utilisateur);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $utilisateur = Utilisateur::find($id);

        if (!$utilisateur) {
            return response()->json(['message' => 'Utilisateur not found'], 404);
        }

        $utilisateur->delete();

        return response()->json(['message' => 'Utilisateur deleted successfully']);
    }
}
