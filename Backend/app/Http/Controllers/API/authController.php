<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Register a new user
     *
     * @param  \Illuminate\Http\Request  
     * @return \Illuminate\Http\Response
     */
    public function register(Request $request)
    {
        // Validate the request data
        $validator = Validator::make($request->all(), [
            'nom_utilisateur' => 'required|string|max:255',
            'prenom_utilisateur' => 'required|string|max:255',
            'password' => 'required|string|min:8',
            'CIN_utilisateur' => 'required|string|unique:utilisateurs',
            'Ntele_utilisateur' => 'nullable|string',
            'email_utilisateur' => 'required|string|email|max:255|unique:utilisateurs',
            'adresse_utilisateur' => 'required|string',
            'role_utilisateur' => 'required|in:admin,consultant',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create the user
        $utilisateur = Utilisateur::create([
            'nom_utilisateur' => $request->nom_utilisateur,
            'prenom_utilisateur' => $request->prenom_utilisateur,
            'password' => Hash::make($request->password),
            'CIN_utilisateur' => $request->CIN_utilisateur,
            'Ntele_utilisateur' => $request->Ntele_utilisateur,
            'email_utilisateur' => $request->email_utilisateur,
            'adresse_utilisateur' => $request->adresse_utilisateur,
            'role_utilisateur' => $request->role_utilisateur,
           
        ]);

        // Generate token
        

        return response()->json([
            'status' => true,
            'message' => 'User registered successfully',
            'user' => $utilisateur,
        ], 201);
    }

    /**
     * Log in a user
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        // Check if user exists and credentials are correct
        $utilisateur = Utilisateur::where('email_utilisateur', $request->email_utilisateur)->first();

        if (!$utilisateur || !Hash::check($request->password, $utilisateur->password)) {
            return response()->json([
                'status' => false,
                'message' => "Informations d'identification non valides"
            ], 401);
        }

        // Check if user is active
        if ($utilisateur->statut_utilisateur === 'inactif') {
            return response()->json([
                'status' => false,
                'message' => "Compte inactif. Veuillez contacter l'administrateur."
            ], 403);
        }
        $token = $utilisateur->createToken('auth_token')->plainTextToken;
Cookie::queue('token', $token, 60, null, null, false, true); 
        return response()->json([
            'status' => true,
            'message' => 'User logged in successfully',
            'user' => $utilisateur,
            'token' => $token
        ], 200);
    }

 
    public function logout(Request $request)
    {
        // Revoke all tokens
        $request->user()->tokens()->delete();

        return response()->json([
            'status' => true,
            'message' => 'User logged out successfully'
        ], 200);
    }
}
