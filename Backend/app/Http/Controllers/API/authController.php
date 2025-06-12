<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use App\Models\LogsAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

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

   

   

    $utilisateur = Utilisateur::where('email_utilisateur', $request->email_utilisateur)->first();
    if (!$utilisateur || !Hash::check($request->password, $utilisateur->password)) {
        return response()->json([
            'status' => false,
            'message' => "Informations d'identification non valides",
            'user'=> $utilisateur,
        ], 401);
    }
    if($utilisateur->statut_utilisateur=="inactif"){
        return response()->json([
            'status' => false,
            'message' => "Compte archivé. Veuillez contacter l'administrateur."
        ], 403);
    };
   

    // Update last_active timestamp
    $utilisateur->last_active = now()->format('Y-m-d H:i:s');
    $utilisateur->save();

    // Generate token and queue it in cookie
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
    /**
     * Get user profile
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        
        // Calculate profile completion percentage
        $completionFields = [
            'nom_utilisateur', 'prenom_utilisateur', 'email_utilisateur', 
            'CIN_utilisateur', 'adresse_utilisateur', 'Ntele_utilisateur'
        ];
        
        $completedFields = 0;
        foreach ($completionFields as $field) {
            if (!empty($user->$field)) {
                $completedFields++;
            }
        }
        
        $completionPercentage = round(($completedFields / count($completionFields)) * 100);

        return response()->json([
            'status' => true,
            'user' => [
                'id_utilisateur' => $user->id_utilisateur,
                'nom_utilisateur' => $user->nom_utilisateur,
                'prenom_utilisateur' => $user->prenom_utilisateur,
                'email_utilisateur' => $user->email_utilisateur,
                'CIN_utilisateur' => $user->CIN_utilisateur,
                'Ntele_utilisateur' => $user->Ntele_utilisateur,
                'adresse_utilisateur' => $user->adresse_utilisateur,
                'role_utilisateur' => $user->role_utilisateur,
                'statut_utilisateur' => $user->statut_utilisateur,
                'dateIntri_utilisateur' => $user->dateIntri_utilisateur,
                'last_active' => $user->last_active,
                'created_at' => $user->created_at,
                'completion_percentage' => $completionPercentage
            ]
        ], 200);
    }

    /**
     * Update user profile
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'nom_utilisateur' => 'sometimes|required|string|max:255',
            'prenom_utilisateur' => 'sometimes|required|string|max:255',
            'CIN_utilisateur' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('utilisateurs', 'CIN_utilisateur')->ignore($user->id_utilisateur, 'id_utilisateur')
            ],
            'Ntele_utilisateur' => 'nullable|string|max:20',
            'email_utilisateur' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('utilisateurs', 'email_utilisateur')->ignore($user->id_utilisateur, 'id_utilisateur')
            ],
            'adresse_utilisateur' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update only the provided fields
        $updateData = $request->only([
            'nom_utilisateur', 'prenom_utilisateur', 'CIN_utilisateur',
            'Ntele_utilisateur', 'email_utilisateur', 'adresse_utilisateur'
        ]);

        $user->update($updateData);

        // Create log for profile update
        $this->createLog(
            'update',
            "L'utilisateur {$user->nom_utilisateur} {$user->prenom_utilisateur} a mis à jour son profil",
            $user->id_utilisateur
        );

        // Calculate new completion percentage
        $completionFields = [
            'nom_utilisateur', 'prenom_utilisateur', 'email_utilisateur', 
            'CIN_utilisateur', 'adresse_utilisateur', 'Ntele_utilisateur'
        ];
        
        $completedFields = 0;
        foreach ($completionFields as $field) {
            if (!empty($user->$field)) {
                $completedFields++;
            }
        }
        
        $completionPercentage = round(($completedFields / count($completionFields)) * 100);

        return response()->json([
            'status' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id_utilisateur' => $user->id_utilisateur,
                'nom_utilisateur' => $user->nom_utilisateur,
                'prenom_utilisateur' => $user->prenom_utilisateur,
                'email_utilisateur' => $user->email_utilisateur,
                'CIN_utilisateur' => $user->CIN_utilisateur,
                'Ntele_utilisateur' => $user->Ntele_utilisateur,
                'adresse_utilisateur' => $user->adresse_utilisateur,
                'role_utilisateur' => $user->role_utilisateur,
                'statut_utilisateur' => $user->statut_utilisateur,
                'dateIntri_utilisateur' => $user->dateIntri_utilisateur,
                'last_active' => $user->last_active,
                'created_at' => $user->created_at,
                'completion_percentage' => $completionPercentage
            ]
        ], 200);
    }

    /**
     * Change user password
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if current password is correct
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Current password is incorrect'
            ], 400);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        // Create log for password change
        $this->createLog(
            'update',
            "L'utilisateur {$user->nom_utilisateur} {$user->prenom_utilisateur} a changé son mot de passe",
            $user->id_utilisateur
        );

        // Revoke all existing tokens for security
        $user->tokens()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Password changed successfully. Please login again.'
        ], 200);
    }

    /**
     * Delete user account
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function deleteAccount(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
            'confirmation' => 'required|string|in:DELETE_MY_ACCOUNT'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if password is correct
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Password is incorrect'
            ], 400);
        }

        // Check if user has associated clients
        if ($user->clients()->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'Cannot delete account. You have associated clients. Please contact administrator.'
            ], 400);
        }

        // Create log before deletion
        $this->createLog(
            'delete',
            "L'utilisateur {$user->nom_utilisateur} {$user->prenom_utilisateur} a supprimé son compte",
            $user->id_utilisateur
        );

        // Revoke all tokens
        $user->tokens()->delete();

        // Delete the user
        $user->delete();

        return response()->json([
            'status' => true,
            'message' => 'Account deleted successfully'
        ], 200);
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
